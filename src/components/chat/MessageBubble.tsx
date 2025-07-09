import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { User, Bot, Copy as CopyIcon } from "lucide-react";
import React from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "../ui/button";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "../ui/tooltip";
// Optional: use toast if available
let toast: ((msg: string) => void) | undefined = undefined;
try {
  // Dynamically import sonner toast if available
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  toast = require("sonner").toast;
} catch {}

interface MessageBubbleProps {
  role: "user" | "ai";
  content: string;
  timestamp: number;
  className?: string;
}

export function MessageBubble({ role, content, timestamp, className }: MessageBubbleProps) {
  const isUser = role === "user";
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    if (toast) toast("คัดลอกข้อความแล้ว");
  };
  return (
    <div
      className={cn(
        "flex w-full items-end gap-2 mb-2",
        isUser ? "justify-end" : "justify-start",
        className
      )}
    >
      {!isUser && (
        <Avatar className="mr-2">
          <AvatarFallback>
            <Bot className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
      <Card
        className={cn(
          "max-w-[75%] rounded-2xl shadow p-4 group relative",
          isUser
            ? "bg-blue-600 text-white ml-auto dark:bg-blue-500"
            : "bg-gray-100 text-gray-900 dark:bg-muted dark:text-gray-100"
        )}
      >
        <CardContent className="p-0">
          <div className="prose prose-sm dark:prose-invert break-words">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
          {/* No copy button */}
        </CardContent>
      </Card>
      {isUser && (
        <Avatar className="ml-2">
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
} 