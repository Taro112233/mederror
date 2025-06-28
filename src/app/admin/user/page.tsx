"use client";
import { useState, useMemo, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export type UserRow = {
  id: number;
  username: string;
  name: string;
  position: string;
  phone: string;
  role: string;
  onRoleChange?: (id: number, newRole: string) => void;
  onDelete?: (id: number) => void;
  onShowDetail?: (id: number) => void;
};

const ROLE_OPTIONS = [
  { value: "UNAPPROVED", label: "Unapproved" },
  { value: "USER", label: "User" },
  { value: "ADMIN", label: "Admin" },
  { value: "DEVELOPER", label: "Developer" },
];

const columns: ColumnDef<UserRow>[] = [
  {
    header: "Username",
    accessorKey: "username",
    meta: { filterVariant: "text" },
  },
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
  const [users, setUsers] = useState<UserRow[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showDetailId, setShowDetailId] = useState<number | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [justDeleted, setJustDeleted] = useState(false);

  // ดึงข้อมูลสมาชิกจริง
  useEffect(() => {
    fetch("/api/users")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUsers(data); // ใช้ id จริงจาก backend
      });
  }, []);

  const handleDelete = async (id: number) => {
    try {
      const user = users.find(u => u.id === id);
      if (!user) return;
      // เรียก API ลบ
      const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("ลบไม่สำเร็จ");
      setUsers(prev => prev.filter(u => u.id !== id));
      setDeleteUserId(null);
      setJustDeleted(true);
    } catch {
      toast.error("ลบผู้ใช้ไม่สำเร็จ");
    }
  };

  useEffect(() => {
    if (justDeleted) {
      toast.success("ลบผู้ใช้สำเร็จ");
      setJustDeleted(false);
    }
  }, [justDeleted]);

  const data: UserRow[] = useMemo(() =>
    users.map(u => ({
      ...u,
      onRoleChange: async (id: number, newRole: string) => {
        try {
          const user = users.find(x => x.id === id);
          if (!user) return;
          const res = await fetch(`/api/users/${user.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: newRole }),
          });
          if (!res.ok) throw new Error("เปลี่ยน role ไม่สำเร็จ");
          setUsers(prev => prev.map(x => x.id === id ? { ...x, role: newRole } : x));
          toast.success("เปลี่ยน Role ผู้ใช้สำเร็จ");
        } catch {
          toast.error("เปลี่ยน Role ไม่สำเร็จ");
        }
      },
      onDelete: (id: number) => setDeleteUserId(id),
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">จัดการผู้ใช้</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายชื่อผู้ใช้ในสังกัด</CardTitle>
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
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl relative mx-4 max-h-full overflow-y-auto flex flex-col box-border">
            <div className="sticky top-0 z-20 bg-white flex items-center justify-between border-b pt-0 pb-3" style={{padding: 20}}>
              <h2 className="text-lg font-bold text-black text-center flex-1">รายละเอียดผู้ใช้</h2>
              <button className="btn btn-xs ml-2" onClick={() => setShowDetailId(null)}>❌</button>
            </div>
            <div className="flex-1 w-full" style={{padding: 32}}>
              {(() => {
                const user = users.find(u => u.id === showDetailId);
                if (!user) return <div>ไม่พบข้อมูล</div>;
                return (
                  <div className="flex flex-col gap-3 pb-2 mt-2">
                    <div>
                      <span className="font-bold text-black">Username:</span><br />
                      <span className="text-blue-700">{user.username}</span>
                    </div>
                    <div>
                      <span className="font-bold text-black">ชื่อ-นามสกุล:</span><br />
                      <span className="text-blue-700">{user.name}</span>
                    </div>
                    <div>
                      <span className="font-bold text-black">ตำแหน่ง:</span><br />
                      <span className="text-blue-700">{user.position}</span>
                    </div>
                    <div>
                      <span className="font-bold text-black">เบอร์โทร:</span><br />
                      <span className="text-blue-700">{user.phone}</span>
                    </div>
                    <div>
                      <span className="font-bold text-black">Role:</span><br />
                      <span className="text-blue-700">{user.role}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Modal ยืนยันการลบ */}
      {deleteUserId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl relative mx-4 max-h-full overflow-y-auto p-8 box-border">
            <button className="absolute top-4 right-4 btn btn-xs" onClick={() => setDeleteUserId(null)}>❌</button>
            <h2 className="text-lg font-bold mb-4 text-red-600">ยืนยันการลบผู้ใช้</h2>
            <div className="mb-3">
              <b>ชื่อ-นามสกุล:</b> {users.find(u => u.id === deleteUserId)?.name}
            </div>
            <div className="mb-3">
              <b>ตำแหน่ง:</b> {users.find(u => u.id === deleteUserId)?.position}
            </div>
            <div className="mb-3">
              <b>เบอร์โทร:</b> {users.find(u => u.id === deleteUserId)?.phone}
            </div>
            <div className="flex gap-4 mt-6 justify-end">
              <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => setDeleteUserId(null)}>ยกเลิก</button>
              <button className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600" onClick={() => handleDelete(deleteUserId)}>ยืนยันลบ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
