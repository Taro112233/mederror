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
    const organizationId = payload.organizationId;
    if (!organizationId) {
      return NextResponse.json({ error: "No organization" }, { status: 400 });
    }
    // Parse input
    const body = await req.json();
    // If getContext: return medError context string only
    if (body.getContext) {
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
      const medErrorSummary = medErrors.map(e =>
        `วันที่: ${e.eventDate.toISOString().slice(0,10)}, หน่วยงาน: ${e.unit?.label || "-"}, ระดับ: ${e.severity?.label || "-"}, ประเภท: ${e.errorType?.label || "-"}, รายละเอียด: ${e.description}`
      ).join("\n");
      return NextResponse.json({ medErrorContext: medErrorSummary });
    }
    // If messages: use as OpenAI chat history
    if (Array.isArray(body.messages)) {
      // Validate messages
      const messages = body.messages.filter(
        (m: { role: string; content: string }) => m && typeof m.role === "string" && typeof m.content === "string"
      );
      if (messages.length === 0) {
        return NextResponse.json({ error: "No messages" }, { status: 400 });
      }
      // แนบข้อมูล medErrors (ถ้ามี) เข้าไปใน system prompt
      let medErrorRaw: {
        id: string;
        eventDate: string;
        unit: string | null;
        severity: string | null;
        errorType: string | null;
        subErrorType: string | null;
        description: string;
      }[] = [];
      if (Array.isArray(body.medErrors) && body.medErrors.length > 0) {
        medErrorRaw = body.medErrors.map((e: {
          id: string;
          eventDate: string;
          unit?: { label?: string };
          severity?: { label?: string };
          errorType?: { label?: string };
          subErrorType?: { label?: string };
          description: string;
        }) => ({
          id: e.id,
          eventDate: e.eventDate,
          unit: e.unit?.label || null,
          severity: e.severity?.label || null,
          errorType: e.errorType?.label || null,
          subErrorType: e.subErrorType?.label || null,
          description: e.description,
        }));
      }
      const medErrorJson = JSON.stringify(medErrorRaw);
      const systemPrompt = `คุณคือ AI Assistant สำหรับเหตุการณ์ Med Error ในโรงพยาบาล กรุณาตอบเป็นภาษาไทยโดยอ้างอิงข้อมูล MedError ที่อยู่ใน JSON ด้านล่างนี้ หากคำถามหรือคำตอบเกี่ยวข้องกับเหตุการณ์ใด ๆ กรุณาระบุ \"MedError ID\" ของเหตุการณ์นั้นในคำตอบด้วย`;
      // ปรับ role ให้ถูกต้องตาม OpenAI API
      let chatMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
        { role: "system", content: systemPrompt },
      ];
      if (medErrorRaw.length > 0) {
        chatMessages.push({ role: "system", content: `MedErrorRecords: ${medErrorJson}` });
      }
      chatMessages = [
        ...chatMessages,
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role === "assistant" || m.role === "ai" ? "assistant" : m.role,
          content: m.content,
        })),
      ];
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: chatMessages,
        max_tokens: 2000,
        temperature: 0.2,
      });
      const aiAnswer = completion.choices[0]?.message?.content || "(ไม่สามารถตอบได้)";
      return NextResponse.json({ answer: aiAnswer });
    }
    // Fallback: single question (legacy)
    const { question, medErrors: medErrorsFromBody } = body;
    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Missing question" }, { status: 400 });
    }
    // ใช้ medErrors จาก body ถ้ามี, ถ้าไม่มีให้ fallback ไปดึงเอง
    let medErrorRaw: {
      id: string;
      eventDate: string;
      unit: string | null;
      severity: string | null;
      errorType: string | null;
      subErrorType: string | null;
      description: string;
    }[];
    if (Array.isArray(medErrorsFromBody) && medErrorsFromBody.length > 0) {
      medErrorRaw = medErrorsFromBody.map((e: {
        id: string;
        eventDate: string;
        unit?: { label?: string };
        severity?: { label?: string };
        errorType?: { label?: string };
        subErrorType?: { label?: string };
        description: string;
      }) => ({
        id: e.id,
        eventDate: e.eventDate,
        unit: e.unit?.label || null,
        severity: e.severity?.label || null,
        errorType: e.errorType?.label || null,
        subErrorType: e.subErrorType?.label || null,
        description: e.description,
      }));
    } else {
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
      medErrorRaw = medErrors.map(e => ({
        id: e.id,
        eventDate: e.eventDate.toISOString(),
        unit: e.unit?.label || null,
        severity: e.severity?.label || null,
        errorType: e.errorType?.label || null,
        subErrorType: e.subErrorType?.label || null,
        description: e.description,
      }));
    }
    // ปรับ input/output token
    const MAX_CONTEXT = 4096;
    const MAX_OUTPUT_TOKENS = 1200;
    const MAX_INPUT_TOKENS = MAX_CONTEXT - MAX_OUTPUT_TOKENS;
    function estimateTokens(str: string) {
      return Math.ceil(str.length / 4);
    }
    const systemPrompt = `คุณคือ AI Assistant สำหรับเหตุการณ์ Med Error ในโรงพยาบาล กรุณาตอบเป็นภาษาไทยโดยอ้างอิงข้อมูล MedError ที่อยู่ใน JSON ด้านล่างนี้ หากคำถามหรือคำตอบเกี่ยวข้องกับเหตุการณ์ใด ๆ กรุณาระบุ \"MedError ID\" ของเหตุการณ์นั้นในคำตอบด้วย`;
    const userPrompt = question;
    let medErrorJson = JSON.stringify(medErrorRaw);
    let totalInputTokens = estimateTokens(systemPrompt) + estimateTokens(userPrompt) + estimateTokens(medErrorJson);
    while (totalInputTokens > MAX_INPUT_TOKENS && medErrorRaw.length > 10) {
      medErrorRaw = medErrorRaw.slice(0, medErrorRaw.length - 5);
      medErrorJson = JSON.stringify(medErrorRaw);
      totalInputTokens = estimateTokens(systemPrompt) + estimateTokens(userPrompt) + estimateTokens(medErrorJson);
    }
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "system", content: `MedErrorRecords: ${medErrorJson}` },
        { role: "user", content: userPrompt },
      ],
      max_tokens: MAX_OUTPUT_TOKENS,
      temperature: 0.2,
    });
    const aiAnswer = completion.choices[0]?.message?.content || "(ไม่สามารถตอบได้)";
    return NextResponse.json({ answer: aiAnswer });
  } catch (err) {
    console.error("AI Assistant error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 