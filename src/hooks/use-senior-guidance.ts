"use client";

import * as React from "react";
import { toast } from "sonner";
import type { SeniorGuidanceInput } from "@/lib/validations/community";

export interface SeniorGuidancePost {
  id: string;
  authorId: string;
  title: string;
  body: string;
  tags: string[];
  isAnonymous: boolean;
  isAnswered: boolean;
  createdAt: string;
  author: { id: string; name: string | null; image: string | null };
  isOwnPost: boolean;
}

export function useSeniorGuidance(filters: { q?: string; answered?: boolean; tag?: string } = {}) {
  const [posts, setPosts] = React.useState<SeniorGuidancePost[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const filterKey = JSON.stringify(filters);

  const refresh = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const search = new URLSearchParams();
      if (filters.q) search.set("q", filters.q);
      if (filters.answered !== undefined) search.set("answered", String(filters.answered));
      if (filters.tag) search.set("tag", filters.tag);

      const res = await fetch(`/api/senior-guidance?${search.toString()}`);
      const json = await res.json();
      if (res.ok) setPosts(json.posts ?? []);
    } catch {
      toast.error("Failed to load senior guidance posts");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  async function createPost(data: SeniorGuidanceInput) {
    const res = await fetch("/api/senior-guidance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to post question");
      return null;
    }
    toast.success("Question posted");
    await refresh();
    return json.post as SeniorGuidancePost;
  }

  async function deletePost(id: string) {
    const res = await fetch(`/api/senior-guidance/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to delete post");
      return false;
    }
    toast.success("Post deleted");
    await refresh();
    return true;
  }

  async function markAnswered(id: string, isAnswered: boolean) {
    const res = await fetch(`/api/senior-guidance/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAnswered }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to update");
      return null;
    }
    await refresh();
    return json.post as SeniorGuidancePost;
  }

  return { posts, isLoading, refresh, createPost, deletePost, markAnswered };
}
