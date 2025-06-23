"use client";
import { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

const mockUsers = [
  { id: 1, name: "สมชาย ใจดี", position: "เภสัชกร", org: "รพ. A", role: "user" },
  { id: 2, name: "สมหญิง รักเรียน", position: "พยาบาล", org: "รพ. A", role: "user" },
  { id: 3, name: "ดร. สมปอง เก่งมาก", position: "แพทย์", org: "รพ. A", role: "admin" },
];

export default function AdminUserPage() {
  const [users, setUsers] = useState(mockUsers);

  const handleRoleChange = (id: number, newRole: string) => {
    setUsers((prev) => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
  };

  return (
    <div className="max-w-3xl mx-auto w-full p-4 sm:p-6">
      <h1 className="text-xl font-bold mb-6 text-center">Admin panel</h1>
      {/* User Table */}
      <div>
        <h2 className="font-semibold mb-2">รายชื่อผู้ใช้ในสังกัด</h2>
        <div className="rounded shadow bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อ-นามสกุล</TableHead>
                <TableHead>ตำแหน่ง</TableHead>
                <TableHead>สังกัด</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(u => (
                <TableRow key={u.id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.position}</TableCell>
                  <TableCell>{u.org}</TableCell>
                  <TableCell>
                    <select
                      value={u.role}
                      onChange={e => handleRoleChange(u.id, e.target.value)}
                      className="input input-bordered"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
