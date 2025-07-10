import { Sparkles } from "lucide-react";
import React from "react";

interface ChatInputBarProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export function ChatInputBar({ value, onChange, onSend, disabled, className, placeholder }: ChatInputBarProps) {
  return (
    <div
      className={`w-full flex items-center rounded-xl bg-white px-4 py-2 ${className || ""}`}
    >
      <input
        className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 outline-none border-none text-base min-h-[40px]"
        placeholder={placeholder || "Describe your design"}
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        onKeyDown={e => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!disabled && value.trim()) onSend();
          }
        }}
      />
      <button
        type="button"
        className="ml-2 p-2 rounded-lg bg-blue-700 hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onSend}
        disabled={disabled || !value.trim()}
        style={{ minWidth: 40, minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Sparkles className="w-6 h-6 text-white" />
      </button>
    </div>
  );
} 