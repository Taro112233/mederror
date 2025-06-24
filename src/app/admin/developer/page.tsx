"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DeveloperPanel() {
  const [orgs, setOrgs] = useState<{ id: string; name: string }[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ดึงรายชื่อองค์กรจาก API
  useEffect(() => {
    fetch("/api/organizations")
      .then(res => res.json())
      .then(data => setOrgs(data));
  }, []);

  // สร้างองค์กรใหม่
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "เกิดข้อผิดพลาด");
      } else {
        const org = await res.json();
        setOrgs(prev => [org, ...prev]);
        setName("");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Developer Panel</h1>
      <form onSubmit={handleCreate} className="flex gap-2 mb-8">
        <Input
          placeholder="ชื่อ Organization"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-64"
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !name.trim()}>{loading ? "กำลังสร้าง..." : "สร้าง Organization"}</Button>
      </form>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">รายการ Organization</h2>
        <ul className="space-y-2">
          {orgs.map(org => (
            <li key={org.id} className="border rounded px-4 py-2 bg-white shadow">
              {org.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 