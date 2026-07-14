"use client";

import * as React from "react";
import { toast } from "sonner";

export type AiMessageRole = "USER" | "ASSISTANT";

export interface AiMessage {
  id: string;
  conversationId: string;
  role: AiMessageRole;
  content: string;
  createdAt: string;
}

export function useAiMessages(conversationId: string | null) {
  const [messages, setMessages] = React.useState<AiMessage[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSending, setIsSending] = React.useState(false);

  const refresh = React.useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/ai/conversations/${conversationId}/messages`);
      const json = await res.json();
      if (res.ok) setMessages(json.messages ?? []);
    } catch {
      toast.error("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  async function sendMessage(content: string) {
    if (!conversationId) return null;

    // Optimistically show the user's message immediately.
    const optimisticUser: AiMessage = {
      id: `optimistic-${Date.now()}`,
      conversationId,
      role: "USER",
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUser]);
    setIsSending(true);

    try {
      const res = await fetch(`/api/ai/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Failed to send message");
        // Roll back the optimistic message on failure.
        setMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id));
        return null;
      }

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== optimisticUser.id),
        json.userMessage,
        json.assistantMessage,
      ]);
      return json.assistantMessage as AiMessage;
    } catch {
      toast.error("Failed to send message");
      setMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id));
      return null;
    } finally {
      setIsSending(false);
    }
  }

  return { messages, isLoading, isSending, refresh, sendMessage, setMessages };
}
