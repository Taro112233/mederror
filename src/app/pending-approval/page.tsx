'use client';
import React from "react";

export default function PendingApprovalPage() {
  // ในอนาคตอาจมี polling เช็คสถานะอนุมัติจาก backend
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1>รอการอนุมัติจากผู้ดูแลระบบ</h1>
    </div>
  );
}
