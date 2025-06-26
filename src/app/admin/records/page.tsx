/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useMemo } from "react";
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
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ประเภทข้อมูล Med Error
export type MedErrorRecord = {
  id: number;
  date: string;
  reporter: string;
  severity: string;
  errorType: string;
  subErrorType: string;
  included: boolean;
  detail: string;
  // สำหรับ action ในตาราง (inject run-time)
  onToggleInclude?: (id: number) => void;
  onDelete?: (id: number) => void;
  onShowDetail?: (id: number) => void;
};

const mockRecords: MedErrorRecord[] = [
  { id: 1, date: "2024-06-01", reporter: "สมชาย ใจดี", severity: "A", errorType: "การสั่งยา", subErrorType: "ขนาดยา", included: true, detail: "ลืมจ่ายยา X" },
  { id: 2, date: "2024-06-02", reporter: "สมหญิง รักเรียน", severity: "B", errorType: "การจ่ายยา", subErrorType: "ชื่อยา", included: false, detail: "จ่ายยาผิดขนาด" },
];

// columns สำหรับ TanStack Table
const columns: ColumnDef<MedErrorRecord>[] = [
  {
    header: "วันที่",
    accessorKey: "date",
    meta: { filterVariant: "text" },
  },
  {
    header: "ผู้รายงาน",
    accessorKey: "reporter",
    meta: { filterVariant: "text" },
  },
  {
    header: "ระดับ",
    accessorKey: "severity",
    meta: { filterVariant: "text" },
  },
  {
    header: "ประเภท",
    accessorKey: "errorType",
    meta: { filterVariant: "text" },
  },
  {
    header: "ชนิด",
    accessorKey: "subErrorType",
    meta: { filterVariant: "text" },
  },
  {
    header: "จัดการ",
    id: "actions",
    cell: ({ row }) => (
      <div className="flex gap-1 justify-end">
        <Button size="sm" variant="secondary" onClick={() => row.original.onShowDetail?.(row.original.id)}>ดูรายละเอียด</Button>
        <Button size="sm" variant="outline" disabled>แก้ไข</Button>
        <Button size="sm" variant="destructive" onClick={() => row.original.onDelete?.(row.original.id)}>ลบ</Button>
      </div>
    ),
    enableSorting: false,
  },
];

export default function AdminRecordsPage() {
  const [records, setRecords] = useState<MedErrorRecord[]>(mockRecords);
  const [showDetailId, setShowDetailId] = useState<number | null>(null);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // inject action handlers to each row
  const data: MedErrorRecord[] = useMemo(() =>
    records.map(r => ({
      ...r,
      onToggleInclude: (id: number) => setRecords(prev => prev.map(x => x.id === id ? { ...x, included: !x.included } : x)),
      onDelete: (id: number) => setRecords(prev => prev.filter(x => x.id !== id)),
      onShowDetail: (id: number) => setShowDetailId(id),
    })),
    [records]
  );

  // Custom global filter function: match if any string field contains the filter value
  function globalStringFilter(row: any, _columnId: string, filterValue: string) {
    if (!filterValue) return true;
    const lower = filterValue.toLowerCase();
    // ตรวจสอบทุกฟิลด์ string ใน row.original
    return Object.values(row.original).some((value) => {
      if (typeof value === "string") return value.toLowerCase().includes(lower);
      if (typeof value === "boolean") return (value ? "แสดง" : "ไม่แสดง").includes(filterValue);
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
    <>
      <Card>
        <CardHeader>
          <CardTitle>รายการ Med error (Admin)</CardTitle>
          <CardDescription>จัดการรายการ Med error ของคุณได้ที่นี่</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Global Search Only */}
          <div className="mb-4">
            <div className="font-semibold mb-1">ค้นหา</div>
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
              {table.getRowModel().rows.length ? (
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 btn btn-xs" onClick={() => setShowDetailId(null)}>❌</button>
            <h2 className="text-lg font-bold mb-2">รายละเอียด Med error</h2>
            <div className="mb-2">
              <b>วัน/เดือน/ปี ที่เกิดเหตุการณ์:</b> {records.find(r => r.id === showDetailId)?.date}
            </div>
            <div className="mb-2">
              <b>ผู้รายงาน:</b> {records.find(r => r.id === showDetailId)?.reporter}
            </div>
            <div className="mb-2">
              <b>ระดับความรุนแรง:</b> {records.find(r => r.id === showDetailId)?.severity}
            </div>
            <div className="mb-2">
              <b>ประเภทความคลาดเคลื่อน:</b> {records.find(r => r.id === showDetailId)?.errorType}
            </div>
            <div className="mb-2">
              <b>ชนิดความคลาดเคลื่อน:</b> {records.find(r => r.id === showDetailId)?.subErrorType}
            </div>
            <div className="mb-2">
              <b>รายละเอียดเหตุการณ์:</b> {records.find(r => r.id === showDetailId)?.detail}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
