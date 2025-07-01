/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useMemo, useEffect } from "react";
import {
  ColumnFiltersState,
  SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { ChevronDownIcon, ChevronUpIcon, CopyIcon, EyeIcon, Trash2Icon, RefreshCwIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

// Simple debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function AdminRecordsPage() {
  const [records, setRecords] = useState<MedErrorRecord[]>([]);
  const [showDetailId, setShowDetailId] = useState<string | null>(null);
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  // For debounced search
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 1000);

  // Fetch organizationId on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/users/me");
        if (res.ok) {
          const user = await res.json();
          setOrganizationId(user.organizationId || null);
        } else {
          setOrganizationId(null);
        }
      } catch {
        setOrganizationId(null);
      }
    };
    fetchUser();
  }, []);

  // Fetch MedError records when organizationId is available
  const fetchMedErrors = async (orgId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/mederror?organizationId=${orgId}`);
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

  useEffect(() => {
    if (organizationId) {
      fetchMedErrors(organizationId);
    }
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

  const table = useReactTable({
    data,
    columns: [
      {
        header: "วันที่ เวลา",
        accessorKey: "eventDate",
        meta: { filterVariant: "text" },
        cell: ({ getValue }) => (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="truncate max-w-[120px] block">{getValue() as string}</span>
              </TooltipTrigger>
              <TooltipContent>{getValue() as string}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ),
      },
      {
        header: "หน่วยงาน/แผนก",
        accessorKey: "unit.label",
        meta: { filterVariant: "text" },
        cell: ({ getValue }) => (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="truncate max-w-[120px] block">{getValue() as string}</span>
              </TooltipTrigger>
              <TooltipContent>{getValue() as string}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ),
      },
      {
        header: "ระดับ",
        accessorKey: "severity.label",
        meta: { filterVariant: "text" },
        cell: ({ getValue }) => (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="truncate max-w-[80px] block">{getValue() as string}</span>
              </TooltipTrigger>
              <TooltipContent>{getValue() as string}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ),
      },
      {
        header: "ประเภท",
        accessorKey: "errorType.label",
        meta: { filterVariant: "text" },
        cell: ({ getValue }) => (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="truncate max-w-[100px] block">{getValue() as string}</span>
              </TooltipTrigger>
              <TooltipContent>{getValue() as string}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ),
      },
      {
        header: "ชนิด",
        accessorKey: "subErrorType.label",
        meta: { filterVariant: "text" },
        cell: ({ getValue }) => (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="truncate max-w-[100px] block">{getValue() as string}</span>
              </TooltipTrigger>
              <TooltipContent>{getValue() as string}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ),
      },
      {
        header: "ผู้รายงาน",
        accessorKey: "reporterName",
        meta: { filterVariant: "text" },
        cell: ({ getValue }) => (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="truncate max-w-[100px] block">{getValue() as string}</span>
              </TooltipTrigger>
              <TooltipContent>{getValue() as string}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ),
      },
      {
        header: "จัดการ",
        id: "actions",
        cell: ({ row }) => (
          <div className="flex gap-2 justify-end">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" onClick={() => row.original.onShowDetail?.(row.original.id)}>
                    <EyeIcon size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>ดูรายละเอียด</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="destructive" onClick={() => row.original.onDelete?.(row.original.id)}>
                    <Trash2Icon size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>ลบ</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ),
        enableSorting: false,
      },
    ],
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

  // Pagination logic (use filtered rows)
  const filteredRows = table.getFilteredRowModel().rows;
  const paginatedData = useMemo(
    () => filteredRows.slice(page * pageSize, (page + 1) * pageSize),
    [filteredRows, page, pageSize]
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
    return Object.values(row.original).some((value: any) => {
      if (typeof value === "string") return value.toLowerCase().includes(lower);
      if (typeof value === "object" && value?.label) return value.label.toLowerCase().includes(lower);
      return false;
    });
  }

  // Update globalFilter when debouncedSearch changes
  useEffect(() => {
    setGlobalFilter(debouncedSearch);
    setPage(0);
  }, [debouncedSearch]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-3xl font-bold tracking-tight">รายการข้อผิดพลาด</h2>
        <Button
          size="sm"
          variant="outline"
          onClick={() => organizationId && fetchMedErrors(organizationId)}
          className="flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCwIcon size={16} className={loading ? "animate-spin" : ""} />
          รีเฟรช
        </Button>
      </div>
      <Card>
        <CardContent>
          {/* Global Search Only */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="font-semibold whitespace-nowrap">ค้นหา</div>
              <Input
                placeholder="ค้นหาทุกคอลัมน์..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="w-32 sm:w-32 md:w-64"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {table.getFilteredRowModel().rows.length !== records.length
                  ? `พบ ${table.getFilteredRowModel().rows.length} รายการ`
                  : `พบ ${records.length} รายการ`}
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-white shadow">
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
                    <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                      กำลังโหลดข้อมูล...
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length ? (
                  paginatedData.map((_, idx) => {
                    const row = table.getRowModel().rows[page * pageSize + idx];
                    if (!row) return null;
                    return (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell: any) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                      ไม่พบข้อมูล
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-end items-center gap-2 mt-2">
            <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>ก่อนหน้า</Button>
            <span className="text-sm">หน้า {page + 1} / {Math.max(1, Math.ceil(filteredRows.length / pageSize))}</span>
            <Button size="sm" variant="outline" onClick={() => setPage(p => p + 1)} disabled={(page + 1) * pageSize >= filteredRows.length}>ถัดไป</Button>
            <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(0); }} className="ml-2 border rounded px-2 py-1 text-sm">
              {[10, 20, 50].map(size => <option key={size} value={size}>{size} ต่อหน้า</option>)}
            </select>
          </div>
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

      {/* Dialog ยืนยันการลบ */}
      <Dialog open={!!deleteRecordId} onOpenChange={(open) => !open && setDeleteRecordId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">ยืนยันการลบ Med error</DialogTitle>
            <DialogDescription>
              การลบข้อมูลนี้จะไม่สามารถกู้คืนได้
            </DialogDescription>
          </DialogHeader>
          {deleteRecordId && (() => {
            const record = records.find(r => r.id === deleteRecordId);
            if (!record) return <div>ไม่พบข้อมูล</div>;
            
            return (
              <div className="space-y-3">
                <div>
                  <span className="font-bold text-black">errorID:</span> <span className="text-blue-700">{record.id}</span>
                </div>
                <div>
                  <span className="font-bold text-black">วัน/เดือน/ปี ที่เกิดเหตุการณ์:</span> <span className="text-blue-700">{record.eventDate}</span>
                </div>
                <div>
                  <span className="font-bold text-black">หน่วยงาน/แผนก:</span> <span className="text-blue-700">{record.unit.label}</span>
                </div>
                <div>
                  <span className="font-bold text-black">รายละเอียดเหตุการณ์:</span> <span className="text-blue-700">{record.description}</span>
                </div>
                <div>
                  <span className="font-bold text-black">ระดับความรุนแรง:</span> <span className="text-blue-700">{record.severity.label}</span>
                </div>
                <div>
                  <span className="font-bold text-black">ประเภทความคลาดเคลื่อน:</span> <span className="text-blue-700">{record.errorType.label}</span>
                </div>
                <div>
                  <span className="font-bold text-black">ชนิดความคลาดเคลื่อน:</span> <span className="text-blue-700">{record.subErrorType.label}</span>
                </div>
                <div>
                  <span className="font-bold text-black">ผู้รายงาน:</span> <span className="text-blue-700">{record.reporterName}</span>
                </div>
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteRecordId(null)}>
              ยกเลิก
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleDelete(deleteRecordId!)}
            >
              ยืนยันลบ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
