"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Users, TrendingUp, Calendar, Plus, Filter } from "lucide-react";
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
  dailyData30?: ChartData[];
  recentErrors: MedError[];
  filteredErrors: MedError[];
  severityChartData?: ChartData[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<"year" | "month" | "week">("year");
  const [selectedBar, setSelectedBar] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!data) return;
    const now = new Date();
    let filtered: MedError[] = [];
    if (selectedPeriod === "year") {
      filtered = data.recentErrors.filter(error => {
        const d = new Date(error.eventDate);
        return d.getFullYear() === now.getFullYear();
      });
    } else if (selectedPeriod === "month") {
      filtered = data.recentErrors.filter(error => {
        const d = new Date(error.eventDate);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      });
    } else if (selectedPeriod === "week") {
      const firstDayOfWeek = new Date(now);
      firstDayOfWeek.setDate(now.getDate() - now.getDay());
      firstDayOfWeek.setHours(0,0,0,0);
      const lastDayOfWeek = new Date(firstDayOfWeek);
      lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
      lastDayOfWeek.setHours(23,59,59,999);
      filtered = data.recentErrors.filter(error => {
        const d = new Date(error.eventDate);
        return d >= firstDayOfWeek && d <= lastDayOfWeek;
      });
    }
    setSelectedBar(null);
    setData(prev => prev ? { ...prev, filteredErrors: filtered } : null);
  }, [selectedPeriod, data?.recentErrors]);

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
      if (data) {
        const now = new Date();
        let filtered: MedError[] = [];
        if (selectedPeriod === "year") {
          filtered = data.recentErrors.filter(error => {
            const d = new Date(error.eventDate);
            return d.getFullYear() === now.getFullYear();
          });
        } else if (selectedPeriod === "month") {
          filtered = data.recentErrors.filter(error => {
            const d = new Date(error.eventDate);
            return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
          });
        } else if (selectedPeriod === "week") {
          const firstDayOfWeek = new Date(now);
          firstDayOfWeek.setDate(now.getDate() - now.getDay());
          firstDayOfWeek.setHours(0,0,0,0);
          const lastDayOfWeek = new Date(firstDayOfWeek);
          lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
          lastDayOfWeek.setHours(23,59,59,999);
          filtered = data.recentErrors.filter(error => {
            const d = new Date(error.eventDate);
            return d >= firstDayOfWeek && d <= lastDayOfWeek;
          });
        }
        setData(prev => prev ? { ...prev, filteredErrors: filtered } : null);
      }
    } else {
      setSelectedBar(clickedData.name);
      if (clickedData && clickedData.date && data) {
        const selectedDate = new Date(clickedData.date);
        const filtered = data.filteredErrors.filter((error: MedError) => {
          const errorDate = new Date(error.eventDate);
          if (selectedPeriod === "year") {
            return errorDate.getMonth() === selectedDate.getMonth() && 
                   errorDate.getFullYear() === selectedDate.getFullYear();
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
        return data.dailyData30 || data.weeklyData;
      case "week":
        return data.dailyData;
      default:
        return data.monthlyData;
    }
  };

  const getChartTitle = () => {
    switch (selectedPeriod) {
      case "year":
        return "แนวโน้มรายเดือน";
      case "month":
        return "แนวโน้มรายสัปดาห์";
      case "week":
        return "แนวโน้มรายวัน";
      default:
        return "แนวโน้มการรายงานข้อผิดพลาด";
    }
  };

  // ฟังก์ชันสำหรับกรองข้อมูล severityChartData ตามช่วงเวลา
  const getFilteredSeverityChartData = () => {
    if (!data) return [];
    // สร้าง map ของ severity label
    const severityLabels: Record<string, number> = {};
    data.filteredErrors.forEach(error => {
      severityLabels[error.severity.label] = 0;
    });
    // นับจำนวนแต่ละ severity
    data.filteredErrors.forEach(error => {
      severityLabels[error.severity.label] = (severityLabels[error.severity.label] || 0) + 1;
    });
    // คืนค่าในรูปแบบที่ DashboardCharts ต้องการ
    return Object.keys(severityLabels).map(label => ({
      name: label,
      value: severityLabels[label],
      code: label
    }));
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
        <div className="flex items-center gap-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/report/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              รายงานข้อผิดพลาดใหม่
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards (Top Row) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center justify-between px-6 pt-3 pb-2">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-5 w-5 text-muted-foreground mr-1" />
                <span className="text-base font-semibold">ข้อผิดพลาดทั้งหมด</span>
              </div>
              <span className="text-sm text-muted-foreground">รายงานข้อผิดพลาดทางการแพทย์</span>
            </div>
            <div className="text-3xl font-bold text-right">{data.totalErrors}</div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between px-6 pt-3 pb-2">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <Users className="h-5 w-5 text-muted-foreground mr-1" />
                <span className="text-base font-semibold">ผู้ใช้ทั้งหมด</span>
              </div>
              <span className="text-sm text-muted-foreground">ผู้ใช้ในองค์กร</span>
            </div>
            <div className="text-3xl font-bold text-right">{data.totalUsers}</div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between px-6 pt-3 pb-2">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <Calendar className="h-5 w-5 text-muted-foreground mr-1" />
                <span className="text-base font-semibold">ข้อผิดพลาดเดือนนี้</span>
              </div>
              <span className="text-sm text-muted-foreground">รายงานในเดือนปัจจุบัน</span>
            </div>
            <div className="text-3xl font-bold text-right">{data.errorsThisMonth}</div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between px-6 pt-3 pb-2">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-5 w-5 text-muted-foreground mr-1" />
                <span className="text-base font-semibold">ข้อผิดพลาดสัปดาห์นี้</span>
              </div>
              <span className="text-sm text-muted-foreground">รายงานในสัปดาห์ปัจจุบัน</span>
            </div>
            <div className="text-3xl font-bold text-right">{data.errorsThisWeek}</div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* กราฟแนวโน้ม */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{getChartTitle()}</CardTitle>
                <CardDescription>
                  จำนวน Medication Error
                </CardDescription>
              </div>
              <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as "year" | "month" | "week")}> 
                <TabsList>
                  <TabsTrigger value="year" className="min-w-[80px] flex-1">ปี</TabsTrigger>
                  <TabsTrigger value="month" className="min-w-[80px] flex-1">เดือน</TabsTrigger>
                  <TabsTrigger value="week" className="min-w-[80px] flex-1">สัปดาห์</TabsTrigger>
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
              <div className="h-96">
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
                      if (data) {
                        const now = new Date();
                        let filtered: MedError[] = [];
                        if (selectedPeriod === "year") {
                          filtered = data.recentErrors.filter(error => {
                            const d = new Date(error.eventDate);
                            return d.getFullYear() === now.getFullYear();
                          });
                        } else if (selectedPeriod === "month") {
                          filtered = data.recentErrors.filter(error => {
                            const d = new Date(error.eventDate);
                            return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
                          });
                        } else if (selectedPeriod === "week") {
                          const firstDayOfWeek = new Date(now);
                          firstDayOfWeek.setDate(now.getDate() - now.getDay());
                          firstDayOfWeek.setHours(0,0,0,0);
                          const lastDayOfWeek = new Date(firstDayOfWeek);
                          lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
                          lastDayOfWeek.setHours(23,59,59,999);
                          filtered = data.recentErrors.filter(error => {
                            const d = new Date(error.eventDate);
                            return d >= firstDayOfWeek && d <= lastDayOfWeek;
                          });
                        }
                        setData(prev => prev ? { ...prev, filteredErrors: filtered } : null);
                      }
                    }}
                  >
                    ล้างตัวกรอง
                  </Button>
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* กราฟ Bar แนวนอนแสดงจำนวนแต่ละระดับความรุนแรง */}
        <Card>
          <CardHeader>
            <CardTitle>จำนวนข้อผิดพลาดแยกตามระดับความรุนแรง</CardTitle>
            <CardDescription>
              แสดงจำนวนข้อผิดพลาดในแต่ละระดับความรุนแรง
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <DashboardCharts
                type="bar"
                data={getFilteredSeverityChartData()}
                config={{ value: { label: "จำนวน", color: "hsl(var(--destructive))" } }}
                layout={"vertical"}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
