"use client";
import React, { useState, useRef, useEffect } from "react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatInputBar } from "@/components/chat/ChatInputBar";
import { Separator } from "@/components/ui/separator";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AiAssistantChatPage() {
  const [messages, setMessages] = useState<{role: "user"|"ai"; content: string; timestamp: number;}[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (msg?: string) => {
    const text = typeof msg === "string" ? msg : input;
    if (!text.trim()) return;
    setSending(true);
    const now = Date.now();
    setMessages((prev) => [
      ...prev,
      { role: "user" as const, content: text, timestamp: now },
      {
        role: "ai" as const,
        content:
          "(AI ตอบกลับตัวอย่าง) ขอบคุณสำหรับคำถาม: \n\n" + text +
          "\n\n*หมายเหตุ: นี่เป็นข้อความตัวอย่าง ไม่มีการเชื่อมต่อ backend จริง*",
        timestamp: now + 1000,
      },
    ]);
    setInput("");
    setTimeout(() => setSending(false), 500);
  };

  // Export chat as .txt file
  const handleExportChat = () => {
    if (messages.length === 0) return;
    const lines = messages.map(m => {
      const date = new Date(m.timestamp).toLocaleString();
      return `[${date}] ${m.role === "user" ? "User" : "AI"}: ${m.content}`;
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
  const faqSuggestions = [
    "Med Error คืออะไร?",
    "จะป้องกันความผิดพลาดทางยาได้อย่างไร?",
    "ช่วยสรุปเหตุการณ์ Med Error ล่าสุดให้หน่อย",
    "AI ช่วยวิเคราะห์สาเหตุของ Med Error ได้ไหม?",
    "ควรทำอย่างไรเมื่อเกิด Med Error?",
    "AI ช่วยแนะนำแนวทางการสื่อสารกับทีมเมื่อเกิดข้อผิดพลาด",
    "มีวิธีติดตามและประเมิน Med Error อย่างไร?",
    "AI ช่วยสรุปข้อควรระวังในการจ่ายยา",
    "จะสร้างวัฒนธรรมความปลอดภัยในองค์กรได้อย่างไร?",
    "AI ช่วยแนะนำการอบรมป้องกัน Med Error",
  ];

  // SSR-safe: show first 3, then randomize after mount
  const [randomFaqs, setRandomFaqs] = React.useState(faqSuggestions.slice(0, 3));
  React.useEffect(() => {
    const arr = [...faqSuggestions];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setRandomFaqs(arr.slice(0, 3));
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col shadow-lg border rounded-lg p-0 md:p-0 bg-white dark:bg-muted h-[80dvh]">
      {/* Minimal Header */}
      <div className="flex items-center justify-between gap-2 py-3 px-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">AI Assistant</span>
          <Sparkles className="h-6 w-6 text-yellow-400" />
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
            timestamp={msg.timestamp}
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
        placeholder="พิมพ์คำถาม เช่น 'ช่วยสรุปเหตุการณ์ล่าสุด' หรือ 'AI ช่วยแนะนำวิธีป้องกันความผิดพลาด'..."
      />
    </div>
  );
} 