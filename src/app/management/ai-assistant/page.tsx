"use client";
import React, { useState, useRef, useEffect } from "react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatInputBar } from "@/components/chat/ChatInputBar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

const mockMessages = [
  {
    role: "ai" as const,
    content: "สวัสดีค่ะ! ฉันคือ AI Assistant ของคุณ มีอะไรให้ช่วยเหลือไหม?",
    timestamp: Date.now() - 1000 * 60 * 60,
  },
  {
    role: "user" as const,
    content: "ช่วยสรุปเหตุการณ์ Med Error ล่าสุดให้หน่อย",
    timestamp: Date.now() - 1000 * 60 * 55,
  },
  {
    role: "ai" as const,
    content:
      "เหตุการณ์ Med Error ล่าสุดเกิดขึ้นเมื่อวันที่ 1 มิถุนายน 2024 เกี่ยวกับการจ่ายยาเกินขนาด\n\n**รายละเอียด:**\n- ผู้ป่วย: นายสมชาย\n- ยาที่เกี่ยวข้อง: Paracetamol\n- ผลกระทบ: ไม่มีอาการรุนแรง พบและแก้ไขได้ทันเวลา\n\n> หากต้องการข้อมูลเพิ่มเติม สามารถสอบถามได้เลยค่ะ!",
    timestamp: Date.now() - 1000 * 60 * 54,
  },
];

export default function AiAssistantChatPage() {
  const [messages, setMessages] = useState(mockMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setSending(true);
    const now = Date.now();
    setMessages((prev) => [
      ...prev,
      { role: "user" as const, content: input, timestamp: now },
      {
        role: "ai" as const,
        content:
          "(AI ตอบกลับตัวอย่าง) ขอบคุณสำหรับคำถาม: \n\n" + input +
          "\n\n*หมายเหตุ: นี่เป็นข้อความตัวอย่าง ไม่มีการเชื่อมต่อ backend จริง*",
        timestamp: now + 1000,
      },
    ]);
    setInput("");
    setTimeout(() => setSending(false), 500);
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-8 flex flex-col h-[80vh] shadow-lg border rounded-2xl p-0 md:p-0 bg-white dark:bg-muted">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-muted/80 rounded-t-2xl">
        <h1 className="text-lg font-bold">AI Assistant</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">ถาม AI เกี่ยวกับ Med Error หรือเรื่องอื่น ๆ ในองค์กรของคุณ</p>
      </div>
      {/* Messages */}
      <ScrollArea className="flex-1 px-2 md:px-6 py-4 overflow-y-auto">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-12">เริ่มต้นสนทนาโดยพิมพ์ข้อความด้านล่าง</div>
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
      </ScrollArea>
      <Separator />
      {/* Input */}
      <ChatInputBar
        value={input}
        onChange={setInput}
        onSend={handleSend}
        disabled={sending}
      />
    </div>
  );
} 