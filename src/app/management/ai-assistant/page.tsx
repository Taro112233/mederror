"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatInputBar } from "@/components/chat/ChatInputBar";
import { Separator } from "@/components/ui/separator";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

// Define MedError type
interface MedError {
  id: string;
  eventDate: string;
  unit?: { label?: string };
  severity?: { label?: string };
  errorType?: { label?: string };
  subErrorType?: { label?: string };
  description: string;
}

export default function AiAssistantChatPage() {
  const { loading: authLoading, isAdminOrDeveloper } = useAuth();
  const [messages, setMessages] = useState<{role: "user"|"ai"; content: string;}[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [medErrors, setMedErrors] = useState<MedError[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ดึง organizationId ของผู้ใช้ปัจจุบัน
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/users/me");
        if (res.ok) {
          const user = await res.json();
          setOrganizationId(user.organizationId || null);
        }
      } catch {
        setOrganizationId(null);
      }
    };
    fetchUser();
  }, []);

  // ดึง med error records ขององค์กร (30 รายการล่าสุด หรือ 30 วันล่าสุด เอาน้อยสุด)
  useEffect(() => {
    if (!organizationId) return;
    const fetchMedErrors = async () => {
      try {
        const res = await fetch(`/api/mederror?organizationId=${organizationId}`);
        if (res.ok) {
          let data = await res.json();
          // กรอง 30 วันล่าสุด
          const now = new Date();
          const since = new Date();
          since.setDate(now.getDate() - 30);
          data = data.filter((e: MedError) => new Date(e.eventDate) >= since);
          // เรียง eventDate จากใหม่ไปเก่า
          data.sort((a: MedError, b: MedError) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
          // เอาน้อยสุดระหว่าง 30 วันล่าสุด กับ 30 รายการล่าสุด
          if (data.length > 30) data = data.slice(0, 30);
          setMedErrors(data);
        }
      } catch {
        setMedErrors([]);
      }
    };
    fetchMedErrors();
  }, [organizationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (msg?: string) => {
    const text = typeof msg === "string" ? msg : input;
    if (!text.trim()) return;
    setSending(true);
    // เพิ่มข้อความ user ลงใน state ก่อน
    setMessages((prev) => [
      ...prev,
      { role: "user" as const, content: text },
    ]);
    setInput("");
    try {
      // เตรียม messages array สำหรับ backend (role: "user" | "ai")
      const history = [
        ...messages,
        { role: "user", content: text },
      ].map((m) => ({
        role: m.role === "ai" ? "assistant" : "user",
        content: m.content,
      }));
      const res = await fetch("/api/ai-assistant-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, medErrors }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "เกิดข้อผิดพลาดในการเชื่อมต่อ AI");
      }
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "ai" as const,
          content: data.answer || "(ไม่สามารถตอบได้)",
        },
      ]);
    } catch (e: unknown) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai" as const,
          content: (e as Error).message || "(เกิดข้อผิดพลาดในการเชื่อมต่อ AI)",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  // Export chat as .txt file
  const handleExportChat = () => {
    if (messages.length === 0) return;
    const lines = messages.map(m => {
      return `${m.role === "user" ? "User" : "AI"}: ${m.content}`;
    });
    const blob = new Blob([lines.join("\n\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chat-export.txt";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  // Frequently asked questions for suggestion (10 questions)
  const faqSuggestions = useMemo(() => [
    "ช่วยสรุปเหตุการณ์ที่เกิดขึ้นในสัปดาห์นี้",
    "เดือนนี้เกิด Med Error ระดับไหนเยอะที่สุด?",
    "เหตุการณ์ Med Error ล่าสุดเกิดอะไรขึ้น?",
    "Med Error ที่เกิดขึ้นมากที่สุดคืออะไร?",
    "Med Error ที่หนักที่สุดในสัปดาห์นี้คืออะไร?",
    "Med Error ที่หนักที่สุดในเดือนนี้คืออะไร?",
    "ในสัปดาห์นี้แผนกไหนมี Med Error มากที่สุด?",
    "ปัญหาที่ควรแก้มากที่สุดในตอนนี้คืออะไร?",
    "ช่วงเวลาใดทำให้เกิด Med Error บ่อยที่สุด",
    "AI Assistant ทำอะไรได้บ้าง",
  ], []);

  // SSR-safe: show first 3, then randomize after mount
  const [randomFaqs, setRandomFaqs] = React.useState(faqSuggestions.slice(0, 3));
  React.useEffect(() => {
    const arr = [...faqSuggestions];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setRandomFaqs(arr.slice(0, 3));
  }, [faqSuggestions]);

  // ตรวจสอบสิทธิ์การเข้าถึง - ต้องอยู่หลัง hooks ทั้งหมด
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    );
  }
  if (!isAdminOrDeveloper) {
    // Redirect ไปหน้า management แทนที่จะแสดง AccessDenied
    if (typeof window !== 'undefined') {
      window.location.href = '/management';
    }
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col shadow-lg border rounded-lg p-0 md:p-0 bg-white dark:bg-muted h-[80dvh] text-black dark:text-black">
      {/* Minimal Header */}
      <div className="flex items-center justify-between gap-2 py-3 px-4">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-black" />
          <span className="text-lg font-bold">AI Assistant</span>
        </div>
        <Button size="sm" variant="outline" onClick={handleExportChat} disabled={messages.length === 0}>
          Export Chat
        </Button>
      </div>
      <div className="flex-1 px-2 md:px-4 py-2 overflow-y-auto">
        {messages.length === 0 && (
          <div className="flex flex-col items-center text-center text-gray-400 mt-8 gap-3">
            <div className="flex flex-col gap-2 w-full max-w-xs mx-auto">
              {randomFaqs.map((q, i) => (
                <button
                  key={i}
                  type="button"
                  className="bg-muted hover:bg-primary/10 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm transition-colors"
                  onClick={() => handleSend(q)}
                  disabled={sending}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, idx) => (
          <MessageBubble
            key={idx}
            role={msg.role}
            content={msg.content}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <Separator />
      {/* Input */}
      <ChatInputBar
        value={input}
        onChange={setInput}
        onSend={() => handleSend()}
        disabled={sending}
        placeholder="ถามอะไรก็ได้"
      />
    </div>
  );
} 