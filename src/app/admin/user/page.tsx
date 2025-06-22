"use client";
import { useState } from "react";

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
        <div className="overflow-x-auto rounded shadow bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">ชื่อ-นามสกุล</th>
                <th className="p-2 text-left">ตำแหน่ง</th>
                <th className="p-2 text-left">สังกัด</th>
                <th className="p-2 text-left">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="p-2 whitespace-nowrap">{u.name}</td>
                  <td className="p-2 whitespace-nowrap">{u.position}</td>
                  <td className="p-2 whitespace-nowrap">{u.org}</td>
                  <td className="p-2">
                    <select
                      value={u.role}
                      onChange={e => handleRoleChange(u.id, e.target.value)}
                      className="input input-bordered"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
