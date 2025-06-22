"use client";
import { useState } from "react";

const mockRecords = [
  { id: 1, date: "2024-06-01", reporter: "สมชาย ใจดี", severity: "A", type: "การสั่งยา", included: true, detail: "ลืมจ่ายยา X" },
  { id: 2, date: "2024-06-02", reporter: "สมหญิง รักเรียน", severity: "B", type: "การจ่ายยา", included: false, detail: "จ่ายยาผิดขนาด" },
];

export default function AdminRecordsPage() {
  const [records, setRecords] = useState(mockRecords);
  const [showDetailId, setShowDetailId] = useState<number|null>(null);

  const handleToggleInclude = (id: number) => {
    setRecords((prev) => prev.map(r => r.id === id ? { ...r, included: !r.included } : r));
  };
  const handleDelete = (id: number) => {
    setRecords((prev) => prev.filter(r => r.id !== id));
  };

  return (
    <div className="max-w-3xl mx-auto w-full p-4 sm:p-6">
      <h1 className="text-xl font-bold mb-6 text-center">รายการ Med error (Admin)</h1>
      <div className="overflow-x-auto rounded shadow bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">วันที่</th>
              <th className="p-2 text-left">ผู้รายงาน</th>
              <th className="p-2 text-left">ความรุนแรง</th>
              <th className="p-2 text-left">ชนิด</th>
              <th className="p-2 text-left">คำนวณใน Dashboard</th>
              <th className="p-2 text-left">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {records.map(r => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="p-2 whitespace-nowrap">{r.date}</td>
                <td className="p-2 whitespace-nowrap">{r.reporter}</td>
                <td className="p-2 whitespace-nowrap">{r.severity}</td>
                <td className="p-2 whitespace-nowrap">{r.type}</td>
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={r.included}
                    onChange={() => handleToggleInclude(r.id)}
                    className="checkbox"
                  />
                </td>
                <td className="p-2 flex flex-wrap gap-1">
                  <button className="btn btn-xs btn-info" onClick={() => setShowDetailId(r.id)}>ดูรายละเอียด</button>
                  <button className="btn btn-xs btn-outline" disabled>แก้ไข</button>
                  <button className="btn btn-xs btn-error" onClick={() => handleDelete(r.id)}>ลบ</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal รายละเอียด */}
      {showDetailId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 btn btn-xs" onClick={() => setShowDetailId(null)}>ปิด</button>
            <h2 className="text-lg font-bold mb-2">รายละเอียด Med error</h2>
            <div className="mb-2">
              <b>วันที่:</b> {records.find(r => r.id === showDetailId)?.date}
            </div>
            <div className="mb-2">
              <b>ผู้รายงาน:</b> {records.find(r => r.id === showDetailId)?.reporter}
            </div>
            <div className="mb-2">
              <b>ความรุนแรง:</b> {records.find(r => r.id === showDetailId)?.severity}
            </div>
            <div className="mb-2">
              <b>ชนิด:</b> {records.find(r => r.id === showDetailId)?.type}
            </div>
            <div className="mb-2">
              <b>รายละเอียด:</b> {records.find(r => r.id === showDetailId)?.detail}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
