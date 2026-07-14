"use client";

import { ChatPanel } from "@/components/ai-tools/chat-panel";

export function AiChatTab() {
  return (
    <ChatPanel
      type="CHAT"
      emptyStateTitle="Ask me anything"
      emptyStateDescription="Get help with study questions, concepts, or general advice. Your conversations are saved automatically."
      inputPlaceholder="Ask a question..."
    />
  );
}
