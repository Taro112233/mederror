"use client";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BarChart3, Settings } from "lucide-react";

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function AiRcaChatPage() {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace("/management");
    }
  }, [isAdmin, loading, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setInput("");
    setSending(true);
    // Simulate AI response (replace with real API call later)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "(AI ตอบกลับที่นี่ - ฟีเจอร์ backend ยังไม่เชื่อมต่อ)" },
      ]);
      setSending(false);
    }, 1200);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[80vh] border rounded-lg bg-white/80 shadow-lg">
      {/* End Breadcrumb */}
      <div className="flex-shrink-0 px-6 py-4 border-b">
        <h1 className="text-2xl font-bold">AI Root Cause Analysis (RCA)</h1>
        <p className="text-muted-foreground text-sm mt-1">ถาม AI เกี่ยวกับเหตุการณ์ Med Error ในองค์กรของคุณ</p>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-12">เริ่มต้นสนทนาโดยพิมพ์คำถามของคุณด้านล่าง</div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`rounded-lg px-4 py-2 max-w-[80%] whitespace-pre-line text-sm shadow-sm ${
                msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-900"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form
        className="flex items-center gap-2 px-6 py-4 border-t bg-white"
        onSubmit={e => {
          e.preventDefault();
          if (!sending) handleSend();
        }}
      >
        <Input
          className="flex-1"
          placeholder="พิมพ์คำถาม เช่น 'ช่วยสรุปเหตุการณ์ล่าสุด' หรือ 'ช่วยทำ RCA ของเดือนนี้'..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={sending}
          autoFocus
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (!sending) handleSend();
            }
          }}
        />
        <Button type="submit" disabled={sending || !input.trim()}>
          {sending ? "กำลังส่ง..." : "ส่ง"}
        </Button>
      </form>
    </div>
  );
} 