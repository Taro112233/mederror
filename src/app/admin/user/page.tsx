"use client";
import { useState, useMemo } from "react";
import {
  ColumnDef,
  SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

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

export default function AdminUserPage() {
  const [users, setUsers] = useState<UserRow[]>(mockUsers);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const data: UserRow[] = useMemo(() =>
    users.map(u => ({
      ...u,
      onRoleChange: (id: number, newRole: string) => setUsers(prev => prev.map(x => x.id === id ? { ...x, role: newRole } : x)),
    })),
    [users]
  );

  function globalStringFilter(row: { original: UserRow }, _columnId: string, filterValue: string) {
    if (!filterValue) return true;
    const lower = filterValue.toLowerCase();
    return Object.values(row.original).some((value) => {
      if (typeof value === "string") return value.toLowerCase().includes(lower);
      return false;
    });
  }

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSortingRemoval: false,
    globalFilterFn: globalStringFilter,
  });

  return (
    <Card>
      <CardHeader>
        <h1 className="text-xl font-bold mb-2 text-center">Admin panel</h1>
        <div className="font-semibold mb-2">รายชื่อผู้ใช้ในสังกัด</div>
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
  );
}
