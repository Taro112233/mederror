import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OpenAI } from "openai";
import jwt from "jsonwebtoken";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    // Auth: check session token
    const sessionToken = req.cookies.get("session_token")?.value;
    if (!sessionToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    let payload: jwt.JwtPayload;
    try {
      payload = jwt.verify(sessionToken, process.env.JWT_SECRET || "dev_secret") as jwt.JwtPayload;
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }
    if (payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin only" }, { status: 401 });
    }
    const organizationId = payload.organizationId;
    if (!organizationId) {
      return NextResponse.json({ error: "No organization" }, { status: 400 });
    }
    // Parse input
    const { question } = await req.json();
    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Missing question" }, { status: 400 });
    }
    // Fetch recent mederror data (last 30 days)
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const medErrors = await prisma.medError.findMany({
      where: {
        reporterOrganizationId: organizationId,
        eventDate: { gte: since },
      },
      orderBy: { eventDate: "desc" },
      take: 50,
      include: {
        unit: true,
        severity: true,
        errorType: true,
        subErrorType: true,
      },
    });
    // Prepare context for AI
    const medErrorSummary = medErrors.map(e =>
      `วันที่: ${e.eventDate.toISOString().slice(0,10)}, หน่วยงาน: ${e.unit?.label || "-"}, ระดับ: ${e.severity?.label || "-"}, ประเภท: ${e.errorType?.label || "-"}, รายละเอียด: ${e.description}`
    ).join("\n");
    // Compose prompt
    const systemPrompt = `คุณคือผู้เชี่ยวชาญด้าน RCA (Root Cause Analysis) สำหรับเหตุการณ์ Med Error ในโรงพยาบาล ให้คำตอบเป็นภาษาไทยโดยใช้ข้อมูลเหตุการณ์ล่าสุดขององค์กรนี้ (30 วันล่าสุด) ด้านล่างนี้\n\n${medErrorSummary}\n\n---\n\n`;
    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      max_tokens: 800,
      temperature: 0.2,
    });
    const aiAnswer = completion.choices[0]?.message?.content || "(ไม่สามารถตอบได้)";
    return NextResponse.json({ answer: aiAnswer });
  } catch (err) {
    console.error("AI RCA error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 