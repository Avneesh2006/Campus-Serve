"use client";

import * as React from "react";
import { toast } from "sonner";

export interface PostComment {
  id: string;
  postId: string;
  parentId: string | null;
  body: string;
  isAnonymous: boolean;
  createdAt: string;
  author: { id: string; name: string | null; image: string | null };
  likeCount: number;
  isLiked: boolean;
  isOwnComment: boolean;
}

export function useComments(postId: string | null) {
  const [comments, setComments] = React.useState<PostComment[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    if (!postId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/forum/posts/${postId}/comments`);
      const json = await res.json();
      if (res.ok) setComments(json.comments ?? []);
    } catch {
      toast.error("Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  async function addComment(body: string, isAnonymous: boolean, parentId?: string | null) {
    if (!postId) return null;
    const res = await fetch(`/api/forum/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, isAnonymous, parentId }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to post comment");
      return null;
    }
    toast.success(parentId ? "Reply posted" : "Comment posted");
    await refresh();
    return json.comment as PostComment;
  }

  async function deleteComment(commentId: string) {
    if (!postId) return false;
    const res = await fetch(`/api/forum/posts/${postId}/comments/${commentId}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to delete comment");
      return false;
    }
    toast.success("Comment deleted");
    await refresh();
    return true;
  }

  async function toggleLike(commentId: string) {
    if (!postId) return null;
    const res = await fetch(
      `/api/forum/posts/${postId}/comments/${commentId}/like`,
      { method: "POST" }
    );
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to update like");
      return null;
    }
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, isLiked: json.liked, likeCount: c.likeCount + (json.liked ? 1 : -1) }
          : c
      )
    );
    return json.liked as boolean;
  }

  return { comments, isLoading, refresh, addComment, deleteComment, toggleLike };
}
