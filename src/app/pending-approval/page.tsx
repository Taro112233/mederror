'use client';
import React from "react";

export default function PendingApprovalPage() {
  // ในอนาคตอาจมี polling เช็คสถานะอนุมัติจาก backend
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded shadow text-center">
        <h1 className="text-xl font-bold mb-4">รออนุมัติ</h1>
        <p className="text-gray-700">กรุณารอให้ผู้ดูแลระบบอนุมัติบัญชีของคุณ</p>
      </div>
    </main>
  );
}
