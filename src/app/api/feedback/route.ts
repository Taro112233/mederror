import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  // ดึง session_token จาก cookie
  const sessionToken = req.cookies.get('session_token')?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let payload: jwt.JwtPayload;
  try {
    payload = jwt.verify(sessionToken, process.env.JWT_SECRET || 'dev_secret') as jwt.JwtPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }
  const accountId = payload.id;
  const organizationId = payload.organizationId;
  if (!accountId || !organizationId) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  // หา userId จาก accountId
  const user = await prisma.user.findUnique({ where: { accountId } });
  if (!user) {
    return NextResponse.json({ error: 'ไม่พบข้อมูลผู้ใช้ (User)' }, { status: 404 });
  }
  const userId = user.id;

  const { message } = await req.json();
  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
  }

  const feedback = await prisma.feedback.create({
    data: {
      message,
      userId,
      organizationId,
    },
  });

  return NextResponse.json({ success: true, feedback });
} 