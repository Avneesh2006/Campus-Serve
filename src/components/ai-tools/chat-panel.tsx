"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { useAiConversations, type AiConversationType } from "@/hooks/use-ai-conversations";
import { useAiMessages } from "@/hooks/use-ai-messages";
import { ConversationHistoryList } from "@/components/ai-tools/conversation-history-list";
import { ChatMessageList } from "@/components/ai-tools/chat-message-list";
import { ChatInputBar } from "@/components/ai-tools/chat-input-bar";
import { DeleteConfirmDialog } from "@/components/attendance/delete-confirm-dialog";

export function ChatPanel({
  type,
  emptyStateTitle,
  emptyStateDescription,
  inputPlaceholder = "Type a message...",
}: {
  type: AiConversationType;
  emptyStateTitle: string;
  emptyStateDescription: string;
  inputPlaceholder?: string;
}) {
  const {
    conversations,
    isLoading: conversationsLoading,
    createConversation,
    deleteConversation,
    refresh: refreshConversations,
  } = useAiConversations(type);

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const {
    messages,
    isLoading: messagesLoading,
    isSending,
    sendMessage,
  } = useAiMessages(selectedId);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!selectedId && conversations.length > 0) {
      setSelectedId(conversations[0].id);
    }
  }, [conversations, selectedId]);

  async function handleNew() {
    const conv = await createConversation(type);
    if (conv) setSelectedId(conv.id);
  }

  async function handleSend(content: string) {
    if (!selectedId) {
      const conv = await createConversation(type);
      if (!conv) return;
      setSelectedId(conv.id);
      // Wait a tick so the hook's conversationId updates before sending.
      setTimeout(async () => {
        await sendMessage(content);
        await refreshConversations();
      }, 0);
      return;
    }
    await sendMessage(content);
    await refreshConversations();
  }

  async function handleDelete() {
    if (!deletingId) return;
    const wasSelected = deletingId === selectedId;
    await deleteConversation(deletingId);
    if (wasSelected) setSelectedId(null);
    setDeletingId(null);
  }

  return (
    <Card className="grid h-[70vh] grid-cols-1 overflow-hidden p-0 md:grid-cols-[260px_1fr]">
      <div className="hidden border-r md:block">
        <ConversationHistoryList
          conversations={conversations}
          isLoading={conversationsLoading}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onDelete={setDeletingId}
          onNew={handleNew}
        />
      </div>

      <div className="flex min-w-0 flex-col">
        <div className="flex-1 overflow-y-auto">
          <ChatMessageList
            messages={selectedId ? messages : []}
            isLoading={!!selectedId && messagesLoading}
            isSending={isSending}
            emptyState={
              <div className="max-w-sm text-center">
                <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <Sparkles className="size-5" />
                </div>
                <p className="font-medium">{emptyStateTitle}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {emptyStateDescription}
                </p>
              </div>
            }
          />
        </div>
        <ChatInputBar onSend={handleSend} isSending={isSending} placeholder={inputPlaceholder} />
      </div>

      <DeleteConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Delete this conversation?"
        description="This will permanently delete the conversation and its messages. This action cannot be undone."
        onConfirm={handleDelete}
      />
    </Card>
  );
}
