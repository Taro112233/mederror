import React, { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

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
      <div className="space-y-1">
        <Label className="" htmlFor="name">ชื่อ-นามสกุล</Label>
        <Input
          id="name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1">
        <Label className="" htmlFor="phone">เบอร์โทร</Label>
        <Input
          id="phone"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1">
        <Label className="" htmlFor="position">ตำแหน่ง</Label>
        <Input
          id="position"
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
