import React, { useState } from "react";

interface LoginFormProps {
  onSuccess: () => void;
  onFail: () => void;
}

export default function LoginForm({ onSuccess, onFail }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // mock login logic (ในอนาคตเชื่อม backend จริง)
    await new Promise(r => setTimeout(r, 700));
    if (username === "user" && password === "pass") {
      onSuccess();
    } else {
      setError("Username หรือ Password ไม่ถูกต้อง");
      onFail();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xs mx-auto mt-10">
      <div>
        <label className="block text-sm font-medium mb-1">Username</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          className="w-full border rounded px-3 py-2"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </button>
    </form>
  );
}
