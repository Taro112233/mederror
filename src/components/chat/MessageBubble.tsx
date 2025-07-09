import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { User, Bot } from "lucide-react";
import React from "react";
import ReactMarkdown from "react-markdown";

interface MessageBubbleProps {
  role: "user" | "ai";
  content: string;
  timestamp: number;
  className?: string;
}

export function MessageBubble({ role, content, timestamp, className }: MessageBubbleProps) {
  const isUser = role === "user";
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
          "max-w-[75%] rounded-2xl shadow p-4",
          isUser
            ? "bg-blue-600 text-white ml-auto dark:bg-blue-500"
            : "bg-gray-100 text-gray-900 dark:bg-muted dark:text-gray-100"
        )}
      >
        <CardContent className="p-0">
          <div className="prose prose-sm dark:prose-invert break-words">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              {new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
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