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
  onDelete?: (id: string) => void;
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
    header: "ผู้รายงาน",
    accessorKey: "reporterName",
    meta: { filterVariant: "text" },
  },
  {
    header: "จัดการ",
    id: "actions",
    cell: ({ row }) => (
      <div className="flex gap-1 justify-end">
        <Button size="sm" variant="secondary" onClick={() => row.original.onShowDetail?.(row.original.id)}>ดูรายละเอียด</Button>
        <button
          onClick={() => row.original.onDelete?.(row.original.id)}
          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          ลบ
        </button>
      </div>
    ),
    enableSorting: false,
  },
];

export default function AdminRecordsPage() {
  const [records, setRecords] = useState<MedErrorRecord[]>([]);
  const [showDetailId, setShowDetailId] = useState<string | null>(null);
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  // ดึง organizationId ของผู้ใช้ปัจจุบัน
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/users/me");
        if (res.ok) {
          const user = await res.json();
          setOrganizationId(user.organizationId || null);
        }
      } catch {
        setOrganizationId(null);
      }
    };
    fetchUser();
  }, []);

  // ดึงข้อมูล MedError จากฐานข้อมูล เมื่อได้ organizationId จริง
  useEffect(() => {
    if (!organizationId) return;
    const fetchMedErrors = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/mederror?organizationId=${organizationId}`);
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
        console.error("Error fetching med errors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMedErrors();
  }, [organizationId]);

  // inject action handlers to each row
  const data: MedErrorRecord[] = useMemo(() =>
    records.map(r => ({
      ...r,
      onDelete: (id: string) => setDeleteRecordId(id),
      onShowDetail: (id: string) => setShowDetailId(id),
    })),
    [records]
  );

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/mederror?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('ลบข้อมูลไม่สำเร็จ');
      setRecords(prev => prev.filter(x => x.id !== id));
      setDeleteRecordId(null);
      toast.success('ลบข้อมูลเรียบร้อย');
    } catch (e: any) {
      if (e instanceof Error && (e as any).code === 'P2025') {
        toast.success('ข้อมูลถูกลบไปแล้ว');
      } else {
        toast.error('เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    }
  };

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
        <h2 className="text-3xl font-bold tracking-tight">รายการข้อผิดพลาด</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการ Med Error ทั้งหมด</CardTitle>
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

      {/* Modal รายละเอียด */}
      {showDetailId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl relative mx-4 max-h-full overflow-y-auto flex flex-col box-border">
            {/* Sticky Header */}
            <div className="sticky top-0 z-20 bg-white flex items-center justify-between border-b pt-0 pb-3" style={{padding: 20}}>
              <h2 className="text-lg font-bold text-black text-center flex-1">รายละเอียด Med error</h2>
              <div className="flex items-center gap-4 ml-2">
                <button
                  className="btn btn-xs"
                  title="คัดลอกข้อมูลทั้งหมด"
                  aria-label="คัดลอกข้อมูลทั้งหมด"
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
                >
                  <CopyIcon className="size-4" />
                </button>
                <button className="btn btn-xs" onClick={() => setShowDetailId(null)}>❌</button>
              </div>
            </div>
            <div className="flex-1 w-full" style={{padding: 32}}>
              {(() => {
                const record = records.find(r => r.id === showDetailId);
                if (!record) return <div>ไม่พบข้อมูล</div>;
                return (
                  <>
                    <div className="flex flex-col gap-3 pb-2">
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
                    <div className="mt-4 mb-2">
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
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Modal ยืนยันการลบ */}
      {deleteRecordId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl relative mx-4 max-h-full overflow-y-auto p-8 box-border">
            <button className="absolute top-4 right-4 btn btn-xs" onClick={() => setDeleteRecordId(null)}>❌</button>
            <h2 className="text-lg font-bold mb-4 text-red-600">ยืนยันการลบ Med error</h2>
            {(() => {
              const record = records.find(r => r.id === deleteRecordId);
              if (!record) return <div>ไม่พบข้อมูล</div>;
              
              return (
                <>
                  <div className="mb-3">
                    <span className="font-bold text-black">errorID:</span> <span className="text-blue-700">{record.id}</span>
                  </div>
                  <div className="mb-3">
                    <span className="font-bold text-black">วัน/เดือน/ปี ที่เกิดเหตุการณ์:</span> <span className="text-blue-700">{record.eventDate}</span>
                  </div>
                  <div className="mb-3">
                    <span className="font-bold text-black">หน่วยงาน/แผนก:</span> <span className="text-blue-700">{record.unit.label}</span>
                  </div>
                  <div className="mb-3">
                    <span className="font-bold text-black">รายละเอียดเหตุการณ์:</span> <span className="text-blue-700">{record.description}</span>
                  </div>
                  <div className="mb-3">
                    <span className="font-bold text-black">ระดับความรุนแรง:</span> <span className="text-blue-700">{record.severity.label}</span>
                  </div>
                  <div className="mb-3">
                    <span className="font-bold text-black">ประเภทความคลาดเคลื่อน:</span> <span className="text-blue-700">{record.errorType.label}</span>
                  </div>
                  <div className="mb-3">
                    <span className="font-bold text-black">ชนิดความคลาดเคลื่อน:</span> <span className="text-blue-700">{record.subErrorType.label}</span>
                  </div>
                  <div className="mb-3">
                    <span className="font-bold text-black">ผู้รายงาน:</span> <span className="text-blue-700">{record.reporterName}</span>
                  </div>
                  <div className="flex gap-4 mt-6 justify-end">
                    <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => setDeleteRecordId(null)}>ยกเลิก</button>
                    <button className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600" onClick={() => handleDelete(deleteRecordId)}>ยืนยันลบ</button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
