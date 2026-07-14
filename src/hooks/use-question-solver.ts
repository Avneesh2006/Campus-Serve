"use client";

import * as React from "react";
import { toast } from "sonner";
import type { AiConversation } from "@/hooks/use-ai-conversations";
import type { AiMessage } from "@/hooks/use-ai-messages";

export function useQuestionSolver() {
  const [isSolving, setIsSolving] = React.useState(false);

  async function solveQuestion(data: { question: string; subject?: string }) {
    setIsSolving(true);
    try {
      const res = await fetch("/api/ai/question-solver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Failed to solve question");
        return null;
      }

      return json as {
        conversation: AiConversation;
        userMessage: AiMessage;
        assistantMessage: AiMessage;
      };
    } catch {
      toast.error("Something went wrong");
      return null;
    } finally {
      setIsSolving(false);
    }
  }

  return { solveQuestion, isSolving };
}
