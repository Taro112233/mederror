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
import { Card, CardContent } from "@/components/ui/card";
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
  const [records, setRecords] = useState<MedErrorRecord[]>(mockRecords);
  const [showDetailId, setShowDetailId] = useState<number | null>(null);
  const [deleteRecordId, setDeleteRecordId] = useState<number | null>(null);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // inject action handlers to each row
  const data: MedErrorRecord[] = useMemo(() =>
    records.map(r => ({
      ...r,
      onToggleInclude: (id: number) => setRecords(prev => prev.map(x => x.id === id ? { ...x, included: !x.included } : x)),
      onDelete: (id: number) => setDeleteRecordId(id),
      onShowDetail: (id: number) => setShowDetailId(id),
    })),
    [records]
  );

  const handleDelete = (id: number) => {
    setRecords(prev => prev.filter(x => x.id !== id));
    setDeleteRecordId(null);
  };

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
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-2 text-center">Admin panel</h1>
        <div className="font-semibold mb-2 text-center">รายการ Med error (Admin)</div>
      </div>
      <Card className="shadow-lg">
        <CardContent className="px-6 pb-6">
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative mx-4">
            <button className="absolute top-4 right-4 btn btn-xs" onClick={() => setShowDetailId(null)}>❌</button>
            <h2 className="text-lg font-bold mb-4">รายละเอียด Med error</h2>
            <div className="mb-3">
              <b>วัน/เดือน/ปี ที่เกิดเหตุการณ์:</b> {records.find(r => r.id === showDetailId)?.date}
            </div>
            <div className="mb-3">
              <b>ผู้รายงาน:</b> {records.find(r => r.id === showDetailId)?.reporter}
            </div>
            <div className="mb-3">
              <b>ระดับความรุนแรง:</b> {records.find(r => r.id === showDetailId)?.severity}
            </div>
            <div className="mb-3">
              <b>ประเภทความคลาดเคลื่อน:</b> {records.find(r => r.id === showDetailId)?.errorType}
            </div>
            <div className="mb-3">
              <b>ชนิดความคลาดเคลื่อน:</b> {records.find(r => r.id === showDetailId)?.subErrorType}
            </div>
            <div className="mb-3">
              <b>รายละเอียดเหตุการณ์:</b> {records.find(r => r.id === showDetailId)?.detail}
            </div>
          </div>
        </div>
      )}

      {/* Modal ยืนยันการลบ */}
      {deleteRecordId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative mx-4">
            <button className="absolute top-4 right-4 btn btn-xs" onClick={() => setDeleteRecordId(null)}>❌</button>
            <h2 className="text-lg font-bold mb-4 text-red-600">ยืนยันการลบ Med error</h2>
            <div className="mb-3">
              <b>วัน/เดือน/ปี ที่เกิดเหตุการณ์:</b> {records.find(r => r.id === deleteRecordId)?.date}
            </div>
            <div className="mb-3">
              <b>ผู้รายงาน:</b> {records.find(r => r.id === deleteRecordId)?.reporter}
            </div>
            <div className="mb-3">
              <b>ระดับความรุนแรง:</b> {records.find(r => r.id === deleteRecordId)?.severity}
            </div>
            <div className="mb-3">
              <b>ประเภทความคลาดเคลื่อน:</b> {records.find(r => r.id === deleteRecordId)?.errorType}
            </div>
            <div className="mb-3">
              <b>ชนิดความคลาดเคลื่อน:</b> {records.find(r => r.id === deleteRecordId)?.subErrorType}
            </div>
            <div className="flex gap-4 mt-6 justify-end">
              <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => setDeleteRecordId(null)}>ยกเลิก</button>
              <button className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600" onClick={() => handleDelete(deleteRecordId)}>ยืนยันลบ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
