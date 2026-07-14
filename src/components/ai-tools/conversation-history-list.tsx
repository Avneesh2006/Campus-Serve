"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AiConversation } from "@/hooks/use-ai-conversations";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHrs < 1) return "Just now";
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

export function ConversationHistoryList({
  conversations,
  isLoading,
  selectedId,
  onSelect,
  onDelete,
  onNew,
  newLabel = "New chat",
}: {
  conversations: AiConversation[];
  isLoading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
  newLabel?: string;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <Button variant="brand" className="w-full" onClick={onNew}>
          <Plus className="size-4" />
          {newLabel}
        </Button>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto px-3 pb-3">
        {isLoading && (
          <>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </>
        )}

        {!isLoading && conversations.length === 0 && (
          <p className="p-4 text-center text-xs text-muted-foreground">
            No conversations yet.
          </p>
        )}

        {!isLoading &&
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={cn(
                "group flex w-full items-start gap-2 rounded-md p-2 text-left text-sm transition-colors",
                selectedId === conv.id
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/60"
              )}
            >
              <MessageSquare className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{conv.title}</p>
                <p className="text-xs text-muted-foreground">{timeAgo(conv.updatedAt)}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(conv.id);
                }}
                className="shrink-0 opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                aria-label="Delete conversation"
              >
                <Trash2 className="size-3.5" />
              </button>
            </button>
          ))}
      </div>
    </div>
  );
}
