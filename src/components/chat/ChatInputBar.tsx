import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { ArrowUp } from "lucide-react";
import React, { useRef } from "react";

interface ChatInputBarProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export function ChatInputBar({ value, onChange, onSend, disabled, className, placeholder }: ChatInputBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Autosize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [value]);

  return (
    <div className={`w-full bg-white dark:bg-muted border-t border-gray-200 dark:border-gray-800 p-4 flex items-end gap-2 sticky bottom-0 z-10 ${className || ""}`}> 
      <Textarea
        ref={textareaRef}
        className="flex-1 resize-none min-h-[44px] max-h-32 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
        placeholder={placeholder || "Type your message..."}
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
      <Button type="button" onClick={onSend} disabled={disabled || !value.trim()} className="h-11 px-4">
        <ArrowUp className="h-5 w-5" />
      </Button>
    </div>
  );
} 