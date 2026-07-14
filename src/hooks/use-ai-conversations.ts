"use client";

import * as React from "react";
import { toast } from "sonner";

export type AiConversationType =
  | "CHAT"
  | "PDF_SUMMARIZER"
  | "STUDY_PLANNER"
  | "QUESTION_SOLVER";

export interface AiConversation {
  id: string;
  userId: string;
  type: AiConversationType;
  title: string;
  sourceFileName: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { messages: number };
}

export function useAiConversations(type?: AiConversationType) {
  const [conversations, setConversations] = React.useState<AiConversation[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const search = new URLSearchParams();
      if (type) search.set("type", type);
      const res = await fetch(`/api/ai/conversations?${search.toString()}`);
      const json = await res.json();
      if (res.ok) setConversations(json.conversations ?? []);
    } catch {
      toast.error("Failed to load conversations");
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  async function createConversation(convType: AiConversationType, title?: string) {
    const res = await fetch("/api/ai/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: convType, title }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to start conversation");
      return null;
    }
    await refresh();
    return json.conversation as AiConversation;
  }

  async function deleteConversation(id: string) {
    const res = await fetch(`/api/ai/conversations/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to delete conversation");
      return false;
    }
    toast.success("Conversation deleted");
    await refresh();
    return true;
  }

  return { conversations, isLoading, refresh, createConversation, deleteConversation };
}
