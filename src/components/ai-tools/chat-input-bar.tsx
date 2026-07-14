"use client";

import * as React from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ChatInputBar({
  onSend,
  isSending,
  placeholder = "Type a message...",
  disabled,
}: {
  onSend: (content: string) => void;
  isSending: boolean;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [value, setValue] = React.useState("");

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || isSending || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  return (
    <div className="flex items-end gap-2 border-t p-3">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-11 flex-1 resize-none"
        rows={1}
      />
      <Button
        variant="brand"
        size="icon"
        onClick={handleSend}
        disabled={!value.trim() || isSending || disabled}
        aria-label="Send message"
      >
        {isSending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
      </Button>
    </div>
  );
}
