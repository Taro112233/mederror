import React, { useState } from "react";

interface OnboardingFormProps {
  onSubmit: (data: { name: string; phone: string; position: string }) => void;
}

export default function OnboardingForm({ onSubmit }: OnboardingFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // mock delay (ในอนาคตเชื่อม backend จริง)
    await new Promise(r => setTimeout(r, 700));
    onSubmit({ name, phone, position });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xs mx-auto mt-10">
      <div>
        <label className="block text-sm font-medium mb-1">ชื่อ-นามสกุล</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">เบอร์โทร</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">ตำแหน่ง</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={position}
          onChange={e => setPosition(e.target.value)}
          required
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
      </button>
    </form>
  );
}
