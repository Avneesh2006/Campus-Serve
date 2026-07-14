"use client";

import * as React from "react";
import { toast } from "sonner";
import type { CodingResourceInput } from "@/lib/validations/career-hub";

export type CodingResourceCategory =
  | "DSA"
  | "WEB_DEV"
  | "SYSTEM_DESIGN"
  | "COMPETITIVE_PROGRAMMING"
  | "INTERVIEW_PREP"
  | "LANGUAGES"
  | "OTHER";

export type CodingResourceDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type ProgressStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export interface CodingResource {
  id: string;
  addedById: string;
  title: string;
  provider: string | null;
  category: CodingResourceCategory;
  difficulty: CodingResourceDifficulty;
  url: string;
  description: string;
  createdAt: string;
  isBookmarked: boolean;
  bookmarkCount: number;
  myStatus: ProgressStatus;
  isOwn: boolean;
}

export interface CodingResourceFilters {
  category?: CodingResourceCategory;
  difficulty?: CodingResourceDifficulty;
  q?: string;
  bookmarked?: boolean;
  status?: ProgressStatus;
}

export function useCodingResources(filters: CodingResourceFilters = {}) {
  const [resources, setResources] = React.useState<CodingResource[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const filterKey = JSON.stringify(filters);

  const refresh = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const search = new URLSearchParams();
      if (filters.category) search.set("category", filters.category);
      if (filters.difficulty) search.set("difficulty", filters.difficulty);
      if (filters.q) search.set("q", filters.q);
      if (filters.bookmarked) search.set("bookmarked", "true");
      if (filters.status) search.set("status", filters.status);

      const res = await fetch(`/api/coding-resources?${search.toString()}`);
      const json = await res.json();
      if (res.ok) setResources(json.resources ?? []);
    } catch {
      toast.error("Failed to load coding resources");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  async function createResource(data: CodingResourceInput) {
    const res = await fetch("/api/coding-resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to add resource");
      return null;
    }
    toast.success("Resource added");
    await refresh();
    return json.resource as CodingResource;
  }

  async function deleteResource(id: string) {
    const res = await fetch(`/api/coding-resources/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to delete resource");
      return false;
    }
    toast.success("Resource deleted");
    await refresh();
    return true;
  }

  async function toggleBookmark(id: string) {
    const res = await fetch(`/api/coding-resources/${id}/bookmark`, { method: "POST" });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to update bookmark");
      return null;
    }
    setResources((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              isBookmarked: json.bookmarked,
              bookmarkCount: r.bookmarkCount + (json.bookmarked ? 1 : -1),
            }
          : r
      )
    );
    return json.bookmarked as boolean;
  }

  async function updateProgress(id: string, status: ProgressStatus) {
    const res = await fetch(`/api/coding-resources/${id}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to update progress");
      return null;
    }
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, myStatus: status } : r))
    );
    toast.success("Progress updated");
    return json.progress;
  }

  return {
    resources,
    isLoading,
    refresh,
    createResource,
    deleteResource,
    toggleBookmark,
    updateProgress,
  };
}
