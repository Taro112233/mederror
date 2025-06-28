import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  Users, 
  TrendingUp, 
  Calendar,
  Plus,
  Eye
} from "lucide-react";
import Link from "next/link";
import { DashboardCharts } from "@/components/DashboardCharts";

// [AUTH] เฉพาะผู้ใช้ที่ login แล้ว, onboarded แล้ว, และ role ไม่ใช่ UNAPPROVED เท่านั้นที่เข้าถึงได้
export default async function DashboardPage() {
  // --- Logic ตรวจสอบ session, onboarding, approved, role ---
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;
  if (!sessionToken) {
    redirect("/login");
  }
  let payload: jwt.JwtPayload;
  try {
    payload = jwt.verify(sessionToken, process.env.JWT_SECRET || "dev_secret") as jwt.JwtPayload;
  } catch {
    redirect("/login");
  }
  const prisma = new PrismaClient();
  const account = await prisma.account.findUnique({ where: { id: payload.id } });
  if (!account) {
    redirect("/login");
  }
  if (!account.onboarded) {
    redirect("/onboarding");
  }
  if (!account.role || account.role === "UNAPPROVED") {
    redirect("/pending-approval");
  }
  // --- END Logic ---

  // Fetch dashboard data
  const [
    totalErrors,
    totalUsers,
    recentErrors,
    errorsBySeverity,
    monthlyTrend
  ] = await Promise.all([
    prisma.medError.count(),
    prisma.account.count({ where: { role: { not: "UNAPPROVED" } } }),
    prisma.medError.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        errorType: true,
        severity: true,
      }
    }),
    prisma.medError.groupBy({
      by: ["severityId"],
      _count: { id: true }
    }),
    prisma.medError.groupBy({
      by: ["createdAt"],
      _count: { id: true },
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - 6, 1)
        }
      }
    })
  ]);

  // Fetch severity data for mapping
  const severities = await prisma.severity.findMany();

  const severityData = errorsBySeverity.map(item => {
    const severity = severities.find(s => s.id === item.severityId);
    return {
      name: severity?.label || "Unknown",
      value: item._count.id,
      color: severity?.label === "Critical" ? "hsl(var(--destructive))" : 
             severity?.label === "High" ? "hsl(var(--destructive) / 0.8)" :
             severity?.label === "Medium" ? "hsl(var(--warning))" :
             "hsl(var(--muted-foreground))"
    };
  });

  const trendData = monthlyTrend.map(item => ({
    name: new Date(item.createdAt).toLocaleDateString('th-TH', { month: 'short', year: 'numeric' }),
    value: item._count.id
  }));

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Link href="/report/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              รายงานข้อผิดพลาดใหม่
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ข้อผิดพลาดทั้งหมด</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalErrors}</div>
            <p className="text-xs text-muted-foreground">
              รายงานข้อผิดพลาดทางการแพทย์
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ผู้ใช้ทั้งหมด</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              ผู้ใช้ที่ได้รับการอนุมัติ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ข้อผิดพลาดเดือนนี้</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monthlyTrend.filter(item => 
                new Date(item.createdAt).getMonth() === new Date().getMonth()
              ).reduce((sum, item) => sum + item._count.id, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              รายงานในเดือนปัจจุบัน
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">อัตราการรายงาน</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((totalErrors / Math.max(totalUsers, 1)) * 100) / 100}
            </div>
            <p className="text-xs text-muted-foreground">
              ข้อผิดพลาดต่อผู้ใช้
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>แนวโน้มการรายงานข้อผิดพลาด</CardTitle>
            <CardDescription>
              จำนวนข้อผิดพลาดที่รายงานใน 6 เดือนที่ผ่านมา
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <DashboardCharts 
              type="line"
              data={trendData}
              config={{
                value: {
                  label: "จำนวนข้อผิดพลาด",
                  color: "hsl(var(--primary))"
                }
              }}
            />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>ข้อผิดพลาดตามระดับความรุนแรง</CardTitle>
            <CardDescription>
              การกระจายของข้อผิดพลาดตามระดับความรุนแรง
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardCharts 
              type="pie"
              data={severityData}
              config={{
                Critical: { label: "วิกฤต", color: "hsl(var(--destructive))" },
                High: { label: "สูง", color: "hsl(var(--destructive) / 0.8)" },
                Medium: { label: "ปานกลาง", color: "hsl(var(--warning))" },
                Low: { label: "ต่ำ", color: "hsl(var(--muted-foreground))" }
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent Errors */}
      <Card>
        <CardHeader>
          <CardTitle>ข้อผิดพลาดล่าสุด</CardTitle>
          <CardDescription>
            ข้อผิดพลาดที่รายงานล่าสุด 5 รายการ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentErrors.map((error) => (
              <div key={error.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <h4 className="font-medium">{error.errorType.label}</h4>
                    <p className="text-sm text-muted-foreground">
                      รายงานโดย: {error.reporterName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(error.createdAt).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={
                    error.severity.label === "Critical" ? "destructive" :
                    error.severity.label === "High" ? "destructive" :
                    error.severity.label === "Medium" ? "secondary" :
                    "outline"
                  }>
                    {error.severity.label}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
