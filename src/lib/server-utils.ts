import { prisma } from "./prisma";

// อัปเดต lastActivityAt สำหรับ account
export async function updateUserActivity(accountId: string) {
  try {
    await prisma.account.update({
      where: { id: accountId },
      data: { lastActivityAt: new Date() },
    });
  } catch (error) {
    console.error("Failed to update user activity:", error);
  }
}

// ตรวจสอบว่า session หมดอายุจากการไม่ใช้งานหรือยัง
export async function checkSessionActivity(accountId: string): Promise<boolean> {
  try {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: { lastActivityAt: true },
    });

    if (!account) return false;

    const lastActivity = account.lastActivityAt;
    const now = new Date();
    const hoursSinceLastActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

    // ถ้าไม่ใช้งานเกิน 2 ชั่วโมง ให้หมดอายุ
    return hoursSinceLastActivity <= 2;
  } catch (error) {
    console.error("Failed to check session activity:", error);
    return false;
  }
} 