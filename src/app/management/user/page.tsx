"use client";
import { useState, useMemo, useEffect } from "react";
import {
  SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { ChevronDownIcon, ChevronUpIcon, EyeIcon, RefreshCwIcon, CopyIcon } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import AccessDenied from "@/components/AccessDenied";

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



// Simple debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function AdminUserPage() {
  const { user, loading, isAdminOrDeveloper } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showDetailId, setShowDetailId] = useState<number | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [justDeleted, setJustDeleted] = useState(false);
  const [pendingRoleChange, setPendingRoleChange] = useState<{ id: number; newRole: string } | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 1000);

  // ตรวจสอบสิทธิ์การเข้าถึง
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!isAdminOrDeveloper) {
    return (
      <AccessDenied 
        title="ไม่มีสิทธิ์เข้าถึงหน้าจัดการผู้ใช้"
        message="เฉพาะผู้ดูแลระบบ (Admin) และนักพัฒนา (Developer) เท่านั้นที่สามารถเข้าถึงหน้านี้ได้"
      />
    );
  }

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
      onRoleChange: (id: number, newRole: string) => {
        setPendingRoleChange({ id, newRole });
      },
      onDelete: (id: number) => setDeleteUserId(id),
      onShowDetail: (id: number) => setShowDetailId(id),
    })),
    [users]
  );

  const confirmRoleChange = async () => {
    if (!pendingRoleChange) return;
    const { id, newRole } = pendingRoleChange;
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
    } finally {
      setPendingRoleChange(null);
    }
  };

  // Custom global filter function: match if any string field contains the filter value
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
    columns: [
      {
        header: "Username",
        accessorKey: "username",
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
        header: "ชื่อ-นามสกุล",
        accessorKey: "name",
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
        header: "ตำแหน่ง",
        accessorKey: "position",
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
        header: "เบอร์โทร",
        accessorKey: "phone",
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
        header: "สถานะ",
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
          <div className="flex justify-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" onClick={() => row.original.onShowDetail?.(row.original.id)}>
                    <EyeIcon size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>ดูรายละเอียด</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <button
              onClick={() => row.original.onDelete?.(row.original.id)}
              className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              ลบ
            </button>
          </div>
        ),
      },
    ],
    state: { sorting, globalFilter },
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

  // ฟังก์ชัน export ข้อมูล filteredRows เป็น Excel
  const exportFilteredToExcel = () => {
    const exportData = filteredRows.map(row => {
      const r = row.original;
      return {
        id: r.id,
        username: r.username,
        name: r.name,
        position: r.position,
        phone: r.phone,
        role: r.role,
      };
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "users.xlsx");
  };

  // Update globalFilter when debouncedSearch changes
  useEffect(() => {
    setGlobalFilter(debouncedSearch);
    setPage(0);
  }, [debouncedSearch]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-3xl font-bold tracking-tight">จัดการผู้ใช้</h2>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-900 hover:bg-gray-100"
          >
            <RefreshCwIcon size={16} />
            รีเฟรช
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={exportFilteredToExcel}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-900 hover:bg-gray-100"
            disabled={filteredRows.length === 0}
          >
            Export Excel
          </Button>
        </div>
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
                {table.getFilteredRowModel().rows.length !== users.length
                  ? `พบ ${table.getFilteredRowModel().rows.length} รายการ`
                  : `พบ ${users.length} รายการ`}
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
                {filteredRows.length ? (
                  paginatedData.map((_, idx) => {
                    const row = table.getRowModel().rows[page * pageSize + idx];
                    if (!row) return null;
                    return (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
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
          <div className="flex justify-between items-center gap-2 mt-2">
            {/* Left: Page size selector */}
            <div>
              <select
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setPage(0); }}
                className="h-8 rounded-md px-3 text-xs border bg-background inline-flex items-center"
              >
                {[10, 20, 50].map(size => (
                  <option key={size} value={size}>{size} ต่อหน้า</option>
                ))}
              </select>
            </div>
            {/* Right: Pagination */}
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>ก่อนหน้า</Button>
              <span className="text-sm">หน้า {page + 1} / {Math.max(1, Math.ceil(filteredRows.length / pageSize))}</span>
              <Button size="sm" variant="outline" onClick={() => setPage(p => p + 1)} disabled={(page + 1) * pageSize >= filteredRows.length}>ถัดไป</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog รายละเอียด */}
      <Dialog open={!!showDetailId} onOpenChange={(open) => !open && setShowDetailId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>รายละเอียดผู้ใช้</DialogTitle>
            <DialogDescription>
              ข้อมูลรายละเอียดของผู้ใช้
            </DialogDescription>
          </DialogHeader>
          {showDetailId && (() => {
            const user = users.find(u => u.id === showDetailId);
            if (!user) return <div>ไม่พบข้อมูล</div>;
            return (
              <div className="space-y-3">
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
                  <span className="font-bold text-black">สถานะ:</span><br />
                  <span className="text-blue-700">{user.role}</span>
                </div>
              </div>
            );
          })()}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                const user = users.find(u => u.id === showDetailId);
                if (!user) return;
                const text = [
                  `Username: ${user.username}`,
                  `ชื่อ-นามสกุล: ${user.name}`,
                  `ตำแหน่ง: ${user.position}`,
                  `เบอร์โทร: ${user.phone}`,
                  `สถานะ: ${user.role}`,
                ].join('\n');
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
      <Dialog open={!!deleteUserId} onOpenChange={(open) => !open && setDeleteUserId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">ยืนยันการลบผู้ใช้</DialogTitle>
            <DialogDescription>
              การลบผู้ใช้นี้จะไม่สามารถกู้คืนได้
            </DialogDescription>
          </DialogHeader>
          {deleteUserId && (() => {
            const user = users.find(u => u.id === deleteUserId);
            if (!user) return <div>ไม่พบข้อมูล</div>;
            return (
              <div className="space-y-3">
                <div>
                  <span className="font-bold text-black">ชื่อ-นามสกุล:</span> <span className="text-blue-700">{user.name}</span>
                </div>
                <div>
                  <span className="font-bold text-black">ตำแหน่ง:</span> <span className="text-blue-700">{user.position}</span>
                </div>
                <div>
                  <span className="font-bold text-black">เบอร์โทร:</span> <span className="text-blue-700">{user.phone}</span>
                </div>
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteUserId(null)}>
              ยกเลิก
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleDelete(deleteUserId!)}
            >
              ยืนยันลบ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog ยืนยันการเปลี่ยนสถานะ */}
      <Dialog open={!!pendingRoleChange} onOpenChange={open => !open && setPendingRoleChange(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-blue-600">ยืนยันการเปลี่ยนสถานะ</DialogTitle>
            <DialogDescription>
              คุณต้องการเปลี่ยนสถานะของผู้ใช้นี้ใช่หรือไม่?
            </DialogDescription>
          </DialogHeader>
          {pendingRoleChange && (() => {
            const user = users.find(u => u.id === pendingRoleChange.id);
            if (!user) return <div>ไม่พบข้อมูล</div>;
            return (
              <div className="space-y-3">
                <div>
                  <span className="font-bold text-black">ชื่อ-นามสกุล:</span> <span className="text-blue-700">{user.name}</span>
                </div>
                <div>
                  <span className="font-bold text-black">สถานะเดิม:</span> <span className="text-blue-700">{user.role}</span>
                </div>
                <div>
                  <span className="font-bold text-black">สถานะใหม่:</span> <span className="text-blue-700">{pendingRoleChange.newRole}</span>
                </div>
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingRoleChange(null)}>
              ยกเลิก
            </Button>
            <Button variant="default" onClick={confirmRoleChange}>
              ยืนยันเปลี่ยนสถานะ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
