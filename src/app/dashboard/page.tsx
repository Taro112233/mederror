"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  AlertTriangle, 
  Users, 
  TrendingUp, 
  Calendar,
  Plus,
  Eye,
  Filter
} from "lucide-react";
import Link from "next/link";
import { DashboardCharts } from "@/components/DashboardCharts";

interface MedError {
  id: string;
  eventDate: string;
  description: string;
  createdAt: string;
  reporterName: string;
  errorType: { label: string };
  severity: { label: string };
  unit: { label: string };
}

interface ChartData {
  name: string;
  value: number;
  date?: string;
}

interface DashboardData {
  totalErrors: number;
  totalUsers: number;
  errorsThisMonth: number;
  errorsThisWeek: number;
  errorsToday: number;
  monthlyData: ChartData[];
  weeklyData: ChartData[];
  dailyData: ChartData[];
  recentErrors: MedError[];
  filteredErrors: MedError[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<"year" | "month" | "week">("year");
  const [selectedBar, setSelectedBar] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (response.ok) {
        const dashboardData = await response.json();
        setData(dashboardData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBarClick = (clickedData: ChartData) => {
    if (selectedBar === clickedData.name) {
      setSelectedBar(null);
      setData(prev => prev ? { ...prev, filteredErrors: prev.recentErrors } : null);
    } else {
      setSelectedBar(clickedData.name);
      // Filter errors based on selected bar
      if (clickedData && clickedData.date && data) {
        const selectedDate = new Date(clickedData.date);
        const filtered = data.recentErrors.filter((error: MedError) => {
          const errorDate = new Date(error.createdAt);
          if (selectedPeriod === "year") {
            return errorDate.getMonth() === selectedDate.getMonth() && 
                   errorDate.getFullYear() === selectedDate.getFullYear();
          } else if (selectedPeriod === "month") {
            return errorDate.toDateString() === selectedDate.toDateString();
          } else {
            return errorDate.toDateString() === selectedDate.toDateString();
          }
        });
        setData(prev => prev ? { ...prev, filteredErrors: filtered } : null);
      }
    }
  };

  const getChartData = () => {
    if (!data) return [];
    
    switch (selectedPeriod) {
      case "year":
        return data.monthlyData;
      case "month":
        return data.weeklyData;
      case "week":
        return data.dailyData;
      default:
        return data.monthlyData;
    }
  };

  const getChartTitle = () => {
    switch (selectedPeriod) {
      case "year":
        return "แนวโน้มรายเดือน (12 เดือนล่าสุด)";
      case "month":
        return "แนวโน้มรายสัปดาห์ (30 วันล่าสุด)";
      case "week":
        return "แนวโน้มรายวัน (7 วันล่าสุด)";
      default:
        return "แนวโน้มการรายงานข้อผิดพลาด";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">ไม่สามารถโหลดข้อมูลได้</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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

      {/* Main Content: Chart (left) & Stats Cards (right) */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Chart Section (Left) */}
        <div className="lg:w-2/3 w-full">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{getChartTitle()}</CardTitle>
                  <CardDescription>
                    คลิกที่แท่งเพื่อกรองข้อมูลในตารางด้านล่าง
                  </CardDescription>
                </div>
                <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as "year" | "month" | "week")}> 
                  <TabsList>
                    <TabsTrigger value="year">ปี</TabsTrigger>
                    <TabsTrigger value="month">เดือน</TabsTrigger>
                    <TabsTrigger value="week">สัปดาห์</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <div 
                className="cursor-pointer"
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  const barElement = target.closest('.recharts-bar-rectangle');
                  if (barElement) {
                    const dataKey = barElement.getAttribute('data-key');
                    if (dataKey) {
                      const chartData = getChartData();
                      const clickedData = chartData.find(item => item.name === dataKey);
                      if (clickedData) {
                        handleBarClick(clickedData);
                      }
                    }
                  }
                }}
              >
                <DashboardCharts 
                  type="bar"
                  data={getChartData()}
                  config={{
                    value: {
                      label: "จำนวนข้อผิดพลาด",
                      color: "hsl(var(--primary))"
                    }
                  }}
                />
              </div>
              {selectedBar && (
                <div className="mt-4 p-3 bg-muted rounded-lg flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span className="text-sm">
                    กรองข้อมูล: {selectedBar} 
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-2 h-6 px-2"
                      onClick={() => {
                        setSelectedBar(null);
                        setData(prev => prev ? { ...prev, filteredErrors: prev.recentErrors } : null);
                      }}
                    >
                      ล้างตัวกรอง
                    </Button>
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Stats Cards (Right) */}
        <div className="lg:w-1/3 w-full flex flex-col gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ข้อผิดพลาดทั้งหมด</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalErrors}</div>
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
              <div className="text-2xl font-bold">{data.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                ผู้ใช้ในองค์กร
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ข้อผิดพลาดเดือนนี้</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.errorsThisMonth}</div>
              <p className="text-xs text-muted-foreground">
                รายงานในเดือนปัจจุบัน
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ข้อผิดพลาดสัปดาห์นี้</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.errorsThisWeek}</div>
              <p className="text-xs text-muted-foreground">
                รายงานในสัปดาห์ปัจจุบัน
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Data Table (Full Width) */}
      <Card>
        <CardHeader>
          <CardTitle>รายละเอียดข้อผิดพลาด</CardTitle>
          <CardDescription>
            {selectedBar ? `ข้อมูลสำหรับ: ${selectedBar}` : 'ข้อผิดพลาดทั้งหมด'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>วันที่เกิดเหตุการณ์</TableHead>
                <TableHead>ประเภทข้อผิดพลาด</TableHead>
                <TableHead>ระดับความรุนแรง</TableHead>
                <TableHead>หน่วยงาน</TableHead>
                <TableHead>ผู้รายงาน</TableHead>
                <TableHead>รายละเอียด</TableHead>
                <TableHead>การดำเนินการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(selectedBar ? data.filteredErrors : data.recentErrors).map((error) => (
                <TableRow key={error.id}>
                  <TableCell>
                    {new Date(error.eventDate).toLocaleDateString('th-TH')}
                  </TableCell>
                  <TableCell>{error.errorType.label}</TableCell>
                  <TableCell>
                    <Badge variant={
                      error.severity.label === "Critical" ? "destructive" :
                      error.severity.label === "High" ? "destructive" :
                      error.severity.label === "Medium" ? "secondary" :
                      "outline"
                    }>
                      {error.severity.label}
                    </Badge>
                  </TableCell>
                  <TableCell>{error.unit.label}</TableCell>
                  <TableCell>{error.reporterName}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {error.description}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
