"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Heart, Bookmark as BookmarkIcon, VenetianMask, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ForumPost } from "@/hooks/use-forum-posts";
import { useComments } from "@/hooks/use-comments";
import { CommentThread } from "@/components/community/comment-thread";
import { CATEGORY_LABELS } from "@/components/community/forum-filter-bar";
import { timeAgo } from "@/components/community/forum-post-card";

export function PostDetailDialog({
  post,
  open,
  onOpenChange,
  onToggleLike,
  onToggleBookmark,
}: {
  post: ForumPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleLike: (post: ForumPost) => void;
  onToggleBookmark: (post: ForumPost) => void;
}) {
  const { comments, isLoading, addComment, deleteComment, toggleLike } = useComments(
    open ? post?.id ?? null : null
  );
  const [newComment, setNewComment] = React.useState("");
  const [newCommentAnon, setNewCommentAnon] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setNewComment("");
      setNewCommentAnon(false);
    }
  }, [open, post?.id]);

  if (!post) return null;

  const initials =
    post.author.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  async function handleAddComment() {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      await addComment(newComment, newCommentAnon);
      setNewComment("");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReply(parentId: string, body: string, isAnonymous: boolean) {
    return addComment(body, isAnonymous, parentId);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Avatar className="size-8">
              {!post.isAnonymous && (
                <AvatarImage src={post.author.image ?? undefined} alt={post.author.name ?? ""} />
              )}
              <AvatarFallback>
                {post.isAnonymous ? <VenetianMask className="size-4" /> : initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium">{post.author.name}</p>
              <p className="text-xs text-muted-foreground">{timeAgo(post.createdAt)}</p>
            </div>
            <Badge variant="outline" className="ml-auto">
              {CATEGORY_LABELS[post.category]}
            </Badge>
          </div>
          <DialogTitle className="pt-2">{post.title}</DialogTitle>
          <DialogDescription asChild>
            <p className="whitespace-pre-wrap text-sm text-foreground">{post.body}</p>
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8 gap-1.5", post.isLiked && "text-destructive")}
            onClick={() => onToggleLike(post)}
          >
            <Heart className={cn("size-4", post.isLiked && "fill-current")} />
            {post.likeCount}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => onToggleBookmark(post)}
          >
            <BookmarkIcon
              className={cn("size-4", post.isBookmarked && "fill-brand text-brand")}
            />
            {post.isBookmarked ? "Bookmarked" : "Bookmark"}
          </Button>
        </div>

        <Separator />

        <div className="max-h-[45vh] space-y-4 overflow-y-auto pr-1">
          <p className="text-sm font-medium">
            {comments.length} comment{comments.length === 1 ? "" : "s"}
          </p>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : (
            <CommentThread
              comments={comments}
              onReply={handleReply}
              onLike={toggleLike}
              onDelete={deleteComment}
            />
          )}
        </div>

        <div className="space-y-2 border-t pt-4">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="min-h-16"
          />
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setNewCommentAnon((v) => !v)}
              className={cn(
                "flex items-center gap-1.5 text-xs text-muted-foreground",
                newCommentAnon && "text-brand"
              )}
            >
              <VenetianMask className="size-3.5" />
              Comment anonymously
            </button>
            <Button
              size="sm"
              variant="brand"
              disabled={!newComment.trim() || isSubmitting}
              onClick={handleAddComment}
            >
              {isSubmitting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Send className="size-3.5" />
              )}
              Comment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
