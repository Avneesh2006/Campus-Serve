"use client";

import * as React from "react";
import { toast } from "sonner";
import type { AiConversation } from "@/hooks/use-ai-conversations";
import type { AiMessage } from "@/hooks/use-ai-messages";

export function usePdfSummarizer() {
  const [isExtracting, setIsExtracting] = React.useState(false);
  const [isSummarizing, setIsSummarizing] = React.useState(false);

  async function summarizeFile(file: File) {
    setIsExtracting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const extractRes = await fetch("/api/ai/extract-pdf-text", {
        method: "POST",
        body: formData,
      });
      const extractJson = await extractRes.json();

      if (!extractRes.ok) {
        toast.error(extractJson.error || "Failed to read PDF");
        return null;
      }

      setIsExtracting(false);
      setIsSummarizing(true);

      const summarizeRes = await fetch("/api/ai/pdf-summarizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: extractJson.fileName,
          extractedText: extractJson.extractedText,
        }),
      });
      const summarizeJson = await summarizeRes.json();

      if (!summarizeRes.ok) {
        toast.error(summarizeJson.error || "Failed to summarize PDF");
        return null;
      }

      toast.success("Summary ready");
      return summarizeJson as {
        conversation: AiConversation;
        userMessage: AiMessage;
        assistantMessage: AiMessage;
      };
    } catch {
      toast.error("Something went wrong");
      return null;
    } finally {
      setIsExtracting(false);
      setIsSummarizing(false);
    }
  }

  return { summarizeFile, isExtracting, isSummarizing };
}
