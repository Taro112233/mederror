import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get session token from cookies
    const sessionToken = request.cookies.get("session_token")?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify JWT token
    let payload: jwt.JwtPayload;
    try {
      payload = jwt.verify(sessionToken, process.env.JWT_SECRET || "dev_secret") as jwt.JwtPayload;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get user account
    const account = await prisma.account.findUnique({ 
      where: { id: payload.id },
      include: { organization: true }
    });
    
    if (!account || !account.organizationId) {
      return NextResponse.json({ error: "User not found or no organization" }, { status: 404 });
    }

    const organizationId = account.organizationId;

    // Calculate date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    // Fetch dashboard data for the organization
    const [
      totalErrors,
      totalUsers,
      errorsThisMonth,
      errorsThisWeek,
      errorsToday,
      recentErrors,
      monthlyData,
      weeklyData,
      dailyData,
      dailyData30,
      // Group by severity
      severityGroup
    ] = await Promise.all([
      // Total errors in organization
      prisma.medError.count({
        where: { reporterOrganizationId: organizationId }
      }),
      
      // Total users in organization
      prisma.account.count({
        where: { 
          organizationId: organizationId,
          role: { not: "UNAPPROVED" }
        }
      }),
      
      // Errors this month
      prisma.medError.count({
        where: {
          reporterOrganizationId: organizationId,
          eventDate: { gte: startOfMonth }
        }
      }),
      
      // Errors this week
      prisma.medError.count({
        where: {
          reporterOrganizationId: organizationId,
          eventDate: { gte: startOfWeek }
        }
      }),
      
      // Errors today
      prisma.medError.count({
        where: {
          reporterOrganizationId: organizationId,
          eventDate: { gte: startOfDay }
        }
      }),
      
      // Recent errors with details
      prisma.medError.findMany({
        where: { reporterOrganizationId: organizationId },
        take: 50,
        orderBy: { eventDate: "desc" },
        include: {
          errorType: true,
          severity: true,
          unit: true,
        }
      }),
      
      // Monthly data for the last 12 months
      prisma.medError.groupBy({
        by: ["eventDate"],
        _count: { id: true },
        where: {
          reporterOrganizationId: organizationId,
          eventDate: {
            gte: new Date(now.getFullYear(), now.getMonth() - 11, 1)
          }
        }
      }),
      
      // Weekly data for the last 30 days
      prisma.medError.groupBy({
        by: ["eventDate"],
        _count: { id: true },
        where: {
          reporterOrganizationId: organizationId,
          eventDate: {
            gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Daily data for the last 7 days
      prisma.medError.groupBy({
        by: ["eventDate"],
        _count: { id: true },
        where: {
          reporterOrganizationId: organizationId,
          eventDate: {
            gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Daily data for the last 30 days
      prisma.medError.groupBy({
        by: ["eventDate"],
        _count: { id: true },
        where: {
          reporterOrganizationId: organizationId,
          eventDate: {
            gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Group by severity
      prisma.medError.groupBy({
        by: ["severityId"],
        _count: { id: true },
        where: { reporterOrganizationId: organizationId }
      })
    ]);

    // ดึง label severity
    const severities = await prisma.severity.findMany({ orderBy: { code: "asc" } });
    // Group by severity - แสดงทุกระดับแม้ไม่มีข้อมูล
    const severityChartData = severities.map(severity => {
      const found = severityGroup.find(g => g.severityId === severity.id);
      return {
        name: severity.code,
        value: found ? found._count.id : 0,
        code: severity.code
      };
    });

    // Process monthly data
    const monthlyChartData = processMonthlyData(monthlyData);
    
    // Process weekly data
    const weeklyChartData = processWeeklyData(weeklyData);
    
    // Process daily data
    const dailyChartData = processDailyData(dailyData);
    // Process 30 days data
    const dailyChartData30 = processDailyData30(dailyData30);

    return NextResponse.json({
      totalErrors,
      totalUsers,
      errorsThisMonth,
      errorsThisWeek,
      errorsToday,
      recentErrors,
      monthlyData: monthlyChartData,
      weeklyData: weeklyChartData,
      dailyData: dailyChartData,
      dailyData30: dailyChartData30,
      filteredErrors: recentErrors,
      severityChartData
    });

  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

interface GroupByResult {
  eventDate: Date;
  _count: { id: number };
}

function processMonthlyData(data: GroupByResult[]) {
  const months: { name: string; value: number; date: string }[] = [];
  const now = new Date();
  
  // Generate last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      name: date.toLocaleDateString('th-TH', { month: 'short', year: 'numeric' }),
      value: 0,
      date: date.toISOString()
    });
  }

  // Fill in actual data
  data.forEach(item => {
    const itemDate = new Date(item.eventDate);
    const monthIndex = months.findIndex(month => {
      const monthDate = new Date(month.date);
      return monthDate.getMonth() === itemDate.getMonth() && 
             monthDate.getFullYear() === itemDate.getFullYear();
    });
    
    if (monthIndex !== -1) {
      months[monthIndex].value += item._count.id;
    }
  });

  return months;
}

function processWeeklyData(data: GroupByResult[]) {
  const weeks: { name: string; value: number; date: string }[] = [];
  const now = new Date();
  
  // Generate last 4 weeks
  for (let i = 3; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    
    weeks.push({
      name: `สัปดาห์ ${i + 1}`,
      value: 0,
      date: weekStart.toISOString()
    });
  }

  // Fill in actual data
  data.forEach(item => {
    const itemDate = new Date(item.eventDate);
    const weekIndex = Math.floor((now.getTime() - itemDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    if (weekIndex >= 0 && weekIndex < 4) {
      weeks[3 - weekIndex].value += item._count.id;
    }
  });

  return weeks;
}

function processDailyData(data: GroupByResult[]) {
  const days: { name: string; value: number; date: string }[] = [];
  const now = new Date();
  
  // Generate last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    days.push({
      name: date.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric' }),
      value: 0,
      date: date.toISOString()
    });
  }

  // Fill in actual data
  data.forEach(item => {
    const itemDate = new Date(item.eventDate);
    const dayIndex = Math.floor((now.getTime() - itemDate.getTime()) / (24 * 60 * 60 * 1000));
    
    if (dayIndex >= 0 && dayIndex < 7) {
      days[6 - dayIndex].value += item._count.id;
    }
  });

  return days;
}

function processDailyData30(data: GroupByResult[]) {
  const days: { name: string; value: number; date: string }[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    days.push({
      name: date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
      value: 0,
      date: date.toISOString()
    });
  }
  data.forEach(item => {
    const itemDate = new Date(item.eventDate);
    const dayIndex = Math.floor((now.getTime() - itemDate.getTime()) / (24 * 60 * 60 * 1000));
    if (dayIndex >= 0 && dayIndex < 30) {
      days[29 - dayIndex].value += item._count.id;
    }
  });
  return days;
} 