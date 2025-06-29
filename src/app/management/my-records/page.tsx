/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useMemo, useEffect } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { ChevronDownIcon, ChevronUpIcon, CopyIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import { toast } from "sonner";

// ประเภทข้อมูล Med Error จากฐานข้อมูล
export type MedErrorRecord = {
  id: string;
  eventDate: string; // เวลาที่ผู้ใช้งานกรอก
  createdAt: string; // เวลาที่บันทึกข้อมูล
  unit: {
    label: string;
  };
  severity: {
    label: string;
  };
  errorType: {
    label: string;
  };
  subErrorType: {
    label: string;
  };
  reporterName: string;
  description: string;
  reporterUsername: string;
  reporterPosition: string;
  reporterPhone: string;
  images: Array<{
    url: string;
  }>;
  // สำหรับ action ในตาราง (inject run-time)
  onShowDetail?: (id: string) => void;
};

// columns สำหรับ TanStack Table
const columns: ColumnDef<MedErrorRecord>[] = [
  {
    header: "วันที่ เวลา",
    accessorKey: "eventDate",
    meta: { filterVariant: "text" },
  },
  {
    header: "หน่วยงาน/แผนก",
    accessorKey: "unit.label",
    meta: { filterVariant: "text" },
  },
  {
    header: "ระดับ",
    accessorKey: "severity.label",
    meta: { filterVariant: "text" },
  },
  {
    header: "ประเภท",
    accessorKey: "errorType.label",
    meta: { filterVariant: "text" },
  },
  {
    header: "ชนิด",
    accessorKey: "subErrorType.label",
    meta: { filterVariant: "text" },
  },
  {
    header: "จัดการ",
    id: "actions",
    cell: ({ row }) => (
      <div className="flex gap-1 justify-end">
        <Button size="sm" variant="secondary" onClick={() => row.original.onShowDetail?.(row.original.id)}>ดูรายละเอียด</Button>
      </div>
    ),
    enableSorting: false,
  },
];

export default function MyRecordsPage() {
  const [records, setRecords] = useState<MedErrorRecord[]>([]);
  const [showDetailId, setShowDetailId] = useState<string | null>(null);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // ดึง organizationId และ userId ของผู้ใช้ปัจจุบัน
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/users/me");
        if (res.ok) {
          const user = await res.json();
          setOrganizationId(user.organizationId || null);
          setCurrentUserId(user.id || null);
        }
      } catch {
        setOrganizationId(null);
        setCurrentUserId(null);
      }
    };
    fetchUser();
  }, []);

  // ดึงข้อมูล MedError ของผู้ใช้ปัจจุบัน
  useEffect(() => {
    if (!organizationId || !currentUserId) return;
    const fetchMyMedErrors = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/mederror?organizationId=${organizationId}&reporterAccountId=${currentUserId}`);
        if (response.ok) {
          const data = await response.json();
          const formattedData: MedErrorRecord[] = data.map((item: any) => ({
            id: item.id,
            eventDate: new Date(item.eventDate).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }),
            createdAt: new Date(item.createdAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }),
            unit: item.unit,
            severity: item.severity,
            errorType: item.errorType,
            subErrorType: item.subErrorType,
            reporterName: item.reporterName,
            description: item.description,
            reporterUsername: item.reporterUsername,
            reporterPosition: item.reporterPosition,
            reporterPhone: item.reporterPhone,
            images: item.images,
          }));
          setRecords(formattedData);
        }
      } catch (error) {
        console.error("Error fetching my med errors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyMedErrors();
  }, [organizationId, currentUserId]);

  // inject action handlers to each row
  const data: MedErrorRecord[] = useMemo(() =>
    records.map(r => ({
      ...r,
      onShowDetail: (id: string) => setShowDetailId(id),
    })),
    [records]
  );

  // Custom global filter function: match if any string field contains the filter value
  function globalStringFilter(row: any, _columnId: string, filterValue: string) {
    if (!filterValue) return true;
    const lower = filterValue.toLowerCase();
    // ตรวจสอบทุกฟิลด์ string ใน row.original
    return Object.values(row.original).some((value: any) => {
      if (typeof value === "string") return value.toLowerCase().includes(lower);
      if (typeof value === "object" && value?.label) return value.label.toLowerCase().includes(lower);
      return false;
    });
  }

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSortingRemoval: false,
    globalFilterFn: globalStringFilter,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">รายการข้อผิดพลาดของตนเอง</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการ Med Error ของตนเอง</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Global Search Only */}
          <div className="mb-4 flex items-center gap-3">
            <div className="font-semibold whitespace-nowrap">ค้นหา</div>
            <Input
              placeholder="ค้นหาทุกคอลัมน์..."
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              className="w-64"
            />
          </div>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id} className="bg-muted/50">
                  {headerGroup.headers.map(header => (
                    <TableHead
                      key={header.id}
                      className="relative h-10 border-t select-none text-center"
                      aria-sort={
                        header.column.getIsSorted() === "asc"
                          ? "ascending"
                          : header.column.getIsSorted() === "desc"
                          ? "descending"
                          : "none"
                      }
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <div
                          className="flex h-full cursor-pointer items-center justify-between gap-2 select-none"
                          onClick={header.column.getToggleSortingHandler()}
                          tabIndex={header.column.getCanSort() ? 0 : undefined}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <ChevronUpIcon className="shrink-0 opacity-60" size={16} aria-hidden="true" />,
                            desc: <ChevronDownIcon className="shrink-0 opacity-60" size={16} aria-hidden="true" />,
                          }[header.column.getIsSorted() as string] ?? (
                            <span className="size-4" aria-hidden="true" />
                          )}
                        </div>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    กำลังโหลดข้อมูล...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    ไม่พบข้อมูล
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog รายละเอียด */}
      <Dialog open={!!showDetailId} onOpenChange={(open) => !open && setShowDetailId(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              รายละเอียด Med error
            </DialogTitle>
            <DialogDescription>
              ข้อมูลรายละเอียดของ Med error
            </DialogDescription>
          </DialogHeader>
          {showDetailId && (() => {
            const record = records.find(r => r.id === showDetailId);
            if (!record) return <div>ไม่พบข้อมูล</div>;
            return (
              <div className="space-y-4">
                <div className="flex flex-col gap-3">
                  <div>
                    <span className="font-bold text-black">errorID:</span><br />
                    <span className="text-blue-700">{record.id}</span>
                  </div>
                  <div>
                    <span className="font-bold text-black">วัน/เดือน/ปี และเวลา ที่เกิดเหตุการณ์:</span><br />
                    <span className="text-blue-700">{record.eventDate}</span>
                  </div>
                  <div>
                    <span className="font-bold text-black">หน่วยงาน/แผนก:</span><br />
                    <span className="text-blue-700">{record.unit.label}</span>
                  </div>
                  <div>
                    <span className="font-bold text-black">รายละเอียดเหตุการณ์:</span><br />
                    <span className="text-blue-700">{record.description}</span>
                  </div>
                  <div>
                    <span className="font-bold text-black">ระดับความรุนแรง:</span><br />
                    <span className="text-blue-700">{record.severity.label}</span>
                  </div>
                  <div>
                    <span className="font-bold text-black">ประเภทความคลาดเคลื่อน:</span><br />
                    <span className="text-blue-700">{record.errorType.label}</span>
                  </div>
                  <div>
                    <span className="font-bold text-black">ชนิดความคลาดเคลื่อน:</span><br />
                    <span className="text-blue-700">{record.subErrorType.label}</span>
                  </div>
                  {record.images && record.images.length > 0 && (
                    <div>
                      <span className="font-bold text-black">รูปภาพ:</span>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {record.images.map((image, index) => (
                          <Image
                            key={index}
                            src={image.url}
                            alt={`รูปภาพ ${index + 1}`}
                            width={300}
                            height={128}
                            className="w-full h-32 object-cover rounded"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {/* ข้อมูลผู้รายงาน */}
                <div className="border rounded-lg bg-gray-50 p-4">
                  <div className="font-semibold mb-2 text-gray-700">ข้อมูลผู้รายงาน</div>
                  <div className="mb-1">
                    <span className="font-bold text-black">ชื่อ-นามสกุล:</span> <span className="text-blue-700">{record.reporterName || '-'}</span>
                  </div>
                  <div className="mb-1">
                    <span className="font-bold text-black">ตำแหน่ง:</span> <span className="text-blue-700">{record.reporterPosition || '-'}</span>
                  </div>
                  <div className="mb-1">
                    <span className="font-bold text-black">เบอร์โทร:</span> <span className="text-blue-700">{record.reporterPhone || '-'}</span>
                  </div>
                  <div className="mb-1">
                    <span className="font-bold text-black">เวลาบันทึก:</span> <span className="text-blue-700">{record.createdAt}</span>
                  </div>
                </div>
              </div>
            );
          })()}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                const record = records.find(r => r.id === showDetailId);
                if (!record) return;
                const text = [
                  `errorID: ${record.id}`,
                  `วัน/เดือน/ปี และเวลา ที่เกิดเหตุการณ์: ${record.eventDate}`,
                  `หน่วยงาน/แผนก: ${record.unit.label}`,
                  `รายละเอียดเหตุการณ์: ${record.description}`,
                  `ระดับความรุนแรง: ${record.severity.label}`,
                  `ประเภทความคลาดเคลื่อน: ${record.errorType.label}`,
                  `ชนิดความคลาดเคลื่อน: ${record.subErrorType.label}`,
                  record.images && record.images.length > 0 ? `รูปภาพ: ${record.images.map(img => img.url).join(", ")}` : null,
                  `ชื่อ-นามสกุล: ${record.reporterName || '-'}`,
                  `ตำแหน่ง: ${record.reporterPosition || '-'}`,
                  `เบอร์โทร: ${record.reporterPhone || '-'}`,
                  `เวลาบันทึก: ${record.createdAt}`,
                ].filter(Boolean).join('\n');
                navigator.clipboard.writeText(text);
                toast.success('คัดลอกข้อมูลเรียบร้อย');
              }}
              className="flex items-center gap-2"
            >
              <CopyIcon className="h-4 w-4" />
              คัดลอกข้อมูล
            </Button>
            <Button onClick={() => setShowDetailId(null)}>
              ปิด
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 