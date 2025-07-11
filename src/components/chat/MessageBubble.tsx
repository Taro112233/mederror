import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { User, Bot } from "lucide-react";
import React from "react";
import ReactMarkdown from "react-markdown";

interface MessageBubbleProps {
  role: "user" | "ai";
  content: string;
  className?: string;
}

export function MessageBubble({ role, content, className }: MessageBubbleProps) {
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
          "max-w-[75%] rounded-2xl shadow p-4 group relative",
          isUser
            ? "bg-blue-600 text-white ml-auto dark:bg-blue-500"
            : "bg-gray-100 text-black dark:bg-muted dark:text-black"
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