"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart,
  MessageCircle,
  Bookmark as BookmarkIcon,
  Eye,
  Pin,
  Trash2,
  VenetianMask,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ForumPost } from "@/hooks/use-forum-posts";
import { CATEGORY_LABELS } from "@/components/community/forum-filter-bar";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHrs < 1) return "Just now";
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

export function ForumPostCard({
  post,
  onOpen,
  onToggleLike,
  onToggleBookmark,
  onDelete,
}: {
  post: ForumPost;
  onOpen: (post: ForumPost) => void;
  onToggleLike: (post: ForumPost) => void;
  onToggleBookmark: (post: ForumPost) => void;
  onDelete?: (post: ForumPost) => void;
}) {
  const initials =
    post.author.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar className="size-8">
              {!post.isAnonymous && (
                <AvatarImage src={post.author.image ?? undefined} alt={post.author.name ?? ""} />
              )}
              <AvatarFallback>
                {post.isAnonymous ? <VenetianMask className="size-4" /> : initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{post.author.name}</p>
              <p className="text-xs text-muted-foreground">{timeAgo(post.createdAt)}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {post.isPinned && (
              <Badge variant="brand" className="gap-1">
                <Pin className="size-3" />
                Pinned
              </Badge>
            )}
            <Badge variant="outline">{CATEGORY_LABELS[post.category]}</Badge>
          </div>
        </div>

        <button onClick={() => onOpen(post)} className="block w-full text-left">
          <p className="font-medium leading-snug hover:underline">{post.title}</p>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{post.body}</p>
        </button>

        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-7 gap-1.5 px-2", post.isLiked && "text-destructive")}
              onClick={() => onToggleLike(post)}
            >
              <Heart className={cn("size-3.5", post.isLiked && "fill-current")} />
              {post.likeCount}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 px-2"
              onClick={() => onOpen(post)}
            >
              <MessageCircle className="size-3.5" />
              {post.commentCount}
            </Button>
            <span className="flex items-center gap-1 px-2 text-xs text-muted-foreground">
              <Eye className="size-3.5" />
              {post.viewCount}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => onToggleBookmark(post)}
              aria-label={post.isBookmarked ? "Remove bookmark" : "Bookmark"}
            >
              <BookmarkIcon
                className={cn("size-3.5", post.isBookmarked && "fill-brand text-brand")}
              />
            </Button>
            {post.isOwnPost && onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-destructive hover:text-destructive"
                onClick={() => onDelete(post)}
                aria-label="Delete post"
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { timeAgo };
