import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";
import { Plus, User, Settings, HelpCircle } from "lucide-react";
import React from "react";

interface ChatSidebarProps {
  chats: { id: string; title: string }[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  className?: string;
}

export function ChatSidebar({ chats, selectedId, onSelect, onNewChat, className }: ChatSidebarProps) {
  return (
    <aside
      className={cn(
        "flex flex-col h-full w-64 border-r border-gray-200 dark:border-gray-800",
        className
      )}
      style={{ background: 'oklch(95.3% 0.051 180.801)' }}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <Button variant="outline" className="w-full flex gap-2" onClick={onNewChat}>
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>
      <ScrollArea className="flex-1 overflow-y-auto">
        <nav className="flex flex-col gap-1 p-2">
          {chats.length === 0 && (
            <span className="text-gray-400 text-sm text-center mt-8">No chats yet</span>
          )}
          {chats.map((chat) => (
            <Button
              key={chat.id}
              variant={selectedId === chat.id ? "secondary" : "ghost"}
              className={cn(
                "justify-start w-full rounded-lg px-3 py-2 text-left font-normal",
                selectedId === chat.id && "font-semibold"
              )}
              onClick={() => onSelect(chat.id)}
            >
              {chat.title}
            </Button>
          ))}
        </nav>
      </ScrollArea>
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-2">
        <Button variant="ghost" className="justify-start gap-2 w-full">
          <User className="h-4 w-4" /> Account
        </Button>
        <Button variant="ghost" className="justify-start gap-2 w-full">
          <Settings className="h-4 w-4" /> Settings
        </Button>
        <Button variant="ghost" className="justify-start gap-2 w-full">
          <HelpCircle className="h-4 w-4" /> Help
        </Button>
      </div>
    </aside>
  );
} 