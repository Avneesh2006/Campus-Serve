"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Reply, Trash2, VenetianMask, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PostComment } from "@/hooks/use-comments";
import { timeAgo } from "@/components/community/forum-post-card";

export function CommentThread({
  comments,
  onReply,
  onLike,
  onDelete,
}: {
  comments: PostComment[];
  onReply: (parentId: string, body: string, isAnonymous: boolean) => Promise<unknown>;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const topLevel = comments.filter((c) => !c.parentId);
  const repliesByParent = new Map<string, PostComment[]>();
  for (const c of comments) {
    if (c.parentId) {
      repliesByParent.set(c.parentId, [...(repliesByParent.get(c.parentId) ?? []), c]);
    }
  }

  if (topLevel.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        No comments yet. Be the first to share your thoughts.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {topLevel.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          replies={repliesByParent.get(comment.id) ?? []}
          onReply={onReply}
          onLike={onLike}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function CommentItem({
  comment,
  replies,
  onReply,
  onLike,
  onDelete,
}: {
  comment: PostComment;
  replies: PostComment[];
  onReply: (parentId: string, body: string, isAnonymous: boolean) => Promise<unknown>;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [replying, setReplying] = React.useState(false);
  const [replyBody, setReplyBody] = React.useState("");
  const [replyAnon, setReplyAnon] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const initials =
    comment.author.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  async function handleReplySubmit() {
    if (!replyBody.trim()) return;
    setIsSubmitting(true);
    try {
      await onReply(comment.id, replyBody, replyAnon);
      setReplyBody("");
      setReplying(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2.5">
        <Avatar className="size-7 shrink-0">
          {!comment.isAnonymous && (
            <AvatarImage src={comment.author.image ?? undefined} alt={comment.author.name ?? ""} />
          )}
          <AvatarFallback className="text-xs">
            {comment.isAnonymous ? <VenetianMask className="size-3.5" /> : initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="rounded-lg bg-muted/50 px-3 py-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{comment.author.name}</p>
              <span className="text-xs text-muted-foreground">
                {timeAgo(comment.createdAt)}
              </span>
            </div>
            <p className="text-sm">{comment.body}</p>
          </div>
          <div className="flex items-center gap-1 pl-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-6 gap-1 px-1.5 text-xs", comment.isLiked && "text-destructive")}
              onClick={() => onLike(comment.id)}
            >
              <Heart className={cn("size-3", comment.isLiked && "fill-current")} />
              {comment.likeCount > 0 && comment.likeCount}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 px-1.5 text-xs"
              onClick={() => setReplying((v) => !v)}
            >
              <Reply className="size-3" />
              Reply
            </Button>
            {comment.isOwnComment && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 gap-1 px-1.5 text-xs text-destructive hover:text-destructive"
                onClick={() => onDelete(comment.id)}
              >
                <Trash2 className="size-3" />
              </Button>
            )}
          </div>

          {replying && (
            <div className="space-y-2 pl-1 pt-1">
              <Textarea
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Write a reply..."
                className="min-h-16 text-sm"
              />
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setReplyAnon((v) => !v)}
                  className={cn(
                    "flex items-center gap-1.5 text-xs text-muted-foreground",
                    replyAnon && "text-brand"
                  )}
                >
                  <VenetianMask className="size-3.5" />
                  Reply anonymously
                </button>
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setReplying(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="brand"
                    disabled={!replyBody.trim() || isSubmitting}
                    onClick={handleReplySubmit}
                  >
                    {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
                    Reply
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {replies.length > 0 && (
        <div className="ml-9 space-y-3 border-l pl-3">
          {replies.map((reply) => (
            <div key={reply.id} className="flex gap-2.5">
              <Avatar className="size-6 shrink-0">
                {!reply.isAnonymous && (
                  <AvatarImage src={reply.author.image ?? undefined} alt={reply.author.name ?? ""} />
                )}
                <AvatarFallback className="text-xs">
                  {reply.isAnonymous ? (
                    <VenetianMask className="size-3" />
                  ) : (
                    reply.author.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() || "?"
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="rounded-lg bg-muted/50 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{reply.author.name}</p>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(reply.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm">{reply.body}</p>
                </div>
                <div className="flex items-center gap-1 pl-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn("h-6 gap-1 px-1.5 text-xs", reply.isLiked && "text-destructive")}
                    onClick={() => onLike(reply.id)}
                  >
                    <Heart className={cn("size-3", reply.isLiked && "fill-current")} />
                    {reply.likeCount > 0 && reply.likeCount}
                  </Button>
                  {reply.isOwnComment && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 gap-1 px-1.5 text-xs text-destructive hover:text-destructive"
                      onClick={() => onDelete(reply.id)}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
