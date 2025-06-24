/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useMemo, useId } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
  Column,
} from "@tanstack/react-table";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

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
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    header: "วัน/เดือน/ปี ที่เกิดเหตุการณ์",
    accessorKey: "date",
    meta: { filterVariant: "text" },
  },
  {
    header: "ผู้รายงาน",
    accessorKey: "reporter",
    meta: { filterVariant: "text" },
  },
  {
    header: "ระดับความรุนแรง",
    accessorKey: "severity",
    meta: { filterVariant: "text" },
  },
  {
    header: "ประเภทความคลาดเคลื่อน",
    accessorKey: "errorType",
    meta: { filterVariant: "text" },
  },
  {
    header: "ชนิดความคลาดเคลื่อน",
    accessorKey: "subErrorType",
    meta: { filterVariant: "text" },
  },
  {
    header: "แสดงบน Dashboard",
    accessorKey: "included",
    cell: ({ row, getValue }) => (
      <Checkbox
        checked={getValue() as boolean}
        onCheckedChange={() => row.original.onToggleInclude?.(row.original.id)}
      />
    ),
    enableSorting: false,
    meta: { filterVariant: "select" },
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

// Filter component (เหมือน comp-478)
function Filter({ column }: { column: Column<any, unknown> }) {
  const id = useId();
  const columnFilterValue = column.getFilterValue();
  const { filterVariant } = column.columnDef.meta ?? {};
  const columnHeader = typeof column.columnDef.header === "string" ? column.columnDef.header : "";

  if (filterVariant === "select") {
    // สำหรับ included (true/false)
    return (
      <div>
        <Label htmlFor={`${id}-select`}>{columnHeader}</Label>
        <Select
          value={String(columnFilterValue ?? "all")}
          onValueChange={value => {
            if (value === "all") column.setFilterValue(undefined);
            else if (value === "true") column.setFilterValue(true);
            else if (value === "false") column.setFilterValue(false);
          }}
        >
          <SelectTrigger id={`${id}-select`} className="mt-1 w-full">
            <SelectValue placeholder="ทั้งหมด" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            <SelectItem value="true">แสดง</SelectItem>
            <SelectItem value="false">ไม่แสดง</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }
  // text filter
  return (
    <div>
      <Label htmlFor={id}>{columnHeader}</Label>
      <Input
        id={id}
        value={String(columnFilterValue ?? "")}
        onChange={e => column.setFilterValue(e.target.value)}
        placeholder={`ค้นหา...`}
        className="mt-1"
      />
    </div>
  );
}

export default function AdminRecordsPage() {
  const [records, setRecords] = useState<MedErrorRecord[]>(mockRecords);
  const [showDetailId, setShowDetailId] = useState<number | null>(null);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

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

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSortingRemoval: false,
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>รายการ Med error (Admin)</CardTitle>
          <CardDescription>จัดการรายการ Med error ของคุณได้ที่นี่</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            {table.getAllLeafColumns().map(col =>
              col.getCanFilter() && col.id !== "actions" && (
                <div key={col.id} className="w-44">
                  <Filter column={col} />
                </div>
              )
            )}
          </div>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id} className="bg-muted/50">
                  {headerGroup.headers.map(header => (
                    <TableHead
                      key={header.id}
                      className="relative h-10 border-t select-none"
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
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
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
            <button className="absolute top-2 right-2 btn btn-xs" onClick={() => setShowDetailId(null)}>ปิด</button>
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
