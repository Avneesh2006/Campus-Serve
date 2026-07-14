"use client";

import * as React from "react";
import { toast } from "sonner";
import type { ForumPostInput } from "@/lib/validations/community";

export type ForumCategory =
  | "GENERAL"
  | "ACADEMICS"
  | "CAREER"
  | "EVENTS"
  | "CONFESSIONS"
  | "TECH"
  | "OFF_TOPIC";

export interface ForumPost {
  id: string;
  category: ForumCategory;
  title: string;
  body: string;
  isAnonymous: boolean;
  isPinned: boolean;
  viewCount: number;
  createdAt: string;
  author: { id: string; name: string | null; image: string | null };
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  isOwnPost: boolean;
}

export interface ForumFilters {
  category?: ForumCategory;
  q?: string;
  bookmarked?: boolean;
  mine?: boolean;
  sort?: "recent" | "popular";
}

export function useForumPosts(filters: ForumFilters = {}) {
  const [posts, setPosts] = React.useState<ForumPost[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const filterKey = JSON.stringify(filters);

  const refresh = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const search = new URLSearchParams();
      if (filters.category) search.set("category", filters.category);
      if (filters.q) search.set("q", filters.q);
      if (filters.bookmarked) search.set("bookmarked", "true");
      if (filters.mine) search.set("mine", "true");
      if (filters.sort) search.set("sort", filters.sort);

      const res = await fetch(`/api/forum/posts?${search.toString()}`);
      const json = await res.json();
      if (res.ok) setPosts(json.posts ?? []);
    } catch {
      toast.error("Failed to load discussion posts");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  async function createPost(data: ForumPostInput) {
    const res = await fetch("/api/forum/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to create post");
      return null;
    }
    toast.success("Posted to the forum");
    await refresh();
    return json.post as ForumPost;
  }

  async function deletePost(id: string) {
    const res = await fetch(`/api/forum/posts/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to delete post");
      return false;
    }
    toast.success("Post deleted");
    await refresh();
    return true;
  }

  async function toggleLike(id: string) {
    const res = await fetch(`/api/forum/posts/${id}/like`, { method: "POST" });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to update like");
      return null;
    }
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, isLiked: json.liked, likeCount: p.likeCount + (json.liked ? 1 : -1) }
          : p
      )
    );
    return json.liked as boolean;
  }

  async function toggleBookmark(id: string) {
    const res = await fetch(`/api/forum/posts/${id}/bookmark`, { method: "POST" });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to update bookmark");
      return null;
    }
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              isBookmarked: json.bookmarked,
              bookmarkCount: p.bookmarkCount + (json.bookmarked ? 1 : -1),
            }
          : p
      )
    );
    toast.success(json.bookmarked ? "Bookmarked" : "Bookmark removed");
    return json.bookmarked as boolean;
  }

  return {
    posts,
    isLoading,
    refresh,
    createPost,
    deletePost,
    toggleLike,
    toggleBookmark,
  };
}
