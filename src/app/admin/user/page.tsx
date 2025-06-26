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
import { Button } from "@/components/ui/button";

export type UserRow = {
  id: number;
  name: string;
  position: string;
  phone: string;
  role: string;
  onRoleChange?: (id: number, newRole: string) => void;
  onDelete?: (id: number) => void;
  onShowDetail?: (id: number) => void;
};

const mockUsers: UserRow[] = [
  { id: 1, name: "สมชาย ใจดี", position: "เภสัชกร", phone: "0812345678", role: "USER" },
  { id: 2, name: "สมหญิง รักเรียน", position: "พยาบาล", phone: "0898765432", role: "USER" },
  { id: 3, name: "ดร. สมปอง เก่งมาก", position: "แพทย์", phone: "0822222222", role: "ADMIN" },
];

const ROLE_OPTIONS = [
  { value: "UNAPPROVED", label: "Unapproved" },
  { value: "USER", label: "User" },
  { value: "ADMIN", label: "Admin" },
  { value: "DEVELOPER", label: "Developer" },
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
    header: "เบอร์โทร",
    accessorKey: "phone",
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
        {ROLE_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    ),
    meta: { filterVariant: "select" },
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
  },
];

export default function AdminUserPage() {
  const [users, setUsers] = useState<UserRow[]>(mockUsers);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showDetailId, setShowDetailId] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const data: UserRow[] = useMemo(() =>
    users.map(u => ({
      ...u,
      onRoleChange: (id: number, newRole: string) => setUsers(prev => prev.map(x => x.id === id ? { ...x, role: newRole } : x)),
      onDelete: handleDelete,
      onShowDetail: (id: number) => setShowDetailId(id),
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
    <>
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

      {/* Modal รายละเอียด */}
      {showDetailId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 btn btn-xs" onClick={() => setShowDetailId(null)}>❌</button>
            <h2 className="text-lg font-bold mb-2">รายละเอียดผู้ใช้</h2>
            <div className="mb-2">
              <b>ชื่อ-นามสกุล:</b> {users.find(u => u.id === showDetailId)?.name}
            </div>
            <div className="mb-2">
              <b>ตำแหน่ง:</b> {users.find(u => u.id === showDetailId)?.position}
            </div>
            <div className="mb-2">
              <b>เบอร์โทร:</b> {users.find(u => u.id === showDetailId)?.phone}
            </div>
            <div className="mb-2">
              <b>Role:</b> {users.find(u => u.id === showDetailId)?.role}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
