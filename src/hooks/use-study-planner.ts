"use client";

import * as React from "react";
import { toast } from "sonner";
import type { AiConversation } from "@/hooks/use-ai-conversations";
import type { AiMessage } from "@/hooks/use-ai-messages";

export function useStudyPlanner() {
  const [isGenerating, setIsGenerating] = React.useState(false);

  async function generatePlan(data: {
    goal: string;
    daysAvailable: number;
    hoursPerDay?: number;
  }) {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/study-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Failed to generate plan");
        return null;
      }

      toast.success("Study plan ready");
      return json as {
        conversation: AiConversation;
        userMessage: AiMessage;
        assistantMessage: AiMessage;
      };
    } catch {
      toast.error("Something went wrong");
      return null;
    } finally {
      setIsGenerating(false);
    }
  }

  return { generatePlan, isGenerating };
}
