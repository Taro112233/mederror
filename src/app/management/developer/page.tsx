"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Developer Panel</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>สร้าง Organization ใหม่</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex gap-2">
            <Input
              placeholder="ชื่อ Organization"
              value={name}
              onChange={e => setName(e.target.value)}
              className="flex-1"
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? "กำลังสร้าง..." : "สร้าง Organization"}
            </Button>
          </form>
          {error && <div className="text-red-500 mt-2">{error}</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>รายการ Organization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {orgs.map(org => (
              <div key={org.id} className="border rounded px-4 py-2 bg-muted/50">
                {org.name}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 