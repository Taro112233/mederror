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
  RowData,
  Column,
} from "@tanstack/react-table";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export type UserRow = {
  id: number;
  name: string;
  position: string;
  org: string;
  role: string;
  onRoleChange?: (id: number, newRole: string) => void;
};

const mockUsers: UserRow[] = [
  { id: 1, name: "สมชาย ใจดี", position: "เภสัชกร", org: "รพ. A", role: "user" },
  { id: 2, name: "สมหญิง รักเรียน", position: "พยาบาล", org: "รพ. A", role: "user" },
  { id: 3, name: "ดร. สมปอง เก่งมาก", position: "แพทย์", org: "รพ. A", role: "admin" },
];

const columns: ColumnDef<UserRow>[] = [
  {
    header: "ชื่อ-นามสกุล",
    accessorKey: "name",
    meta: { filterVariant: "text" },
  },
  {
    header: "ตำแหน่ง",
    accessorKey: "position",
    meta: { filterVariant: "text" },
  },
  {
    header: "สังกัด",
    accessorKey: "org",
    meta: { filterVariant: "text" },
  },
  {
    header: "Role",
    accessorKey: "role",
    cell: ({ row, getValue }) => (
      <select
        value={getValue() as string}
        onChange={e => row.original.onRoleChange?.(row.original.id, e.target.value)}
        className="input input-bordered"
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
    ),
    meta: { filterVariant: "select" },
  },
];

function Filter({ column }: { column: Column<any, unknown> }) {
  const id = useId();
  const columnFilterValue = column.getFilterValue();
  const { filterVariant } = column.columnDef.meta ?? {};
  const columnHeader = typeof column.columnDef.header === "string" ? column.columnDef.header : "";

  if (filterVariant === "select") {
    // สำหรับ role
    return (
      <div>
        <Label htmlFor={`${id}-select`}>{columnHeader}</Label>
        <Select
          value={String(columnFilterValue ?? "all")}
          onValueChange={value => column.setFilterValue(value === "all" ? undefined : value)}
        >
          <SelectTrigger id={`${id}-select`} className="mt-1 w-full">
            <SelectValue placeholder="ทั้งหมด" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
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

export default function AdminUserPage() {
  const [users, setUsers] = useState<UserRow[]>(mockUsers);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const data: UserRow[] = useMemo(() =>
    users.map(u => ({
      ...u,
      onRoleChange: (id: number, newRole: string) => setUsers(prev => prev.map(x => x.id === id ? { ...x, role: newRole } : x)),
    })),
    [users]
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
    <Card>
      <CardHeader>
        <h1 className="text-xl font-bold mb-2 text-center">Admin panel</h1>
        <div className="font-semibold mb-2">รายชื่อผู้ใช้ในสังกัด</div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          {table.getAllLeafColumns().map(col =>
            col.getCanFilter() && (
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
  );
}
