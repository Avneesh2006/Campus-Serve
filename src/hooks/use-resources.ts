"use client";

import * as React from "react";
import { toast } from "sonner";
import type { ResourceInput } from "@/lib/validations/academic-hub";

export type ResourceType = "NOTE" | "PYQ" | "BOOK" | "RESOURCE";
export type FileKind = "PDF" | "DOC" | "IMAGE" | "LINK" | "OTHER";

export interface Resource {
  id: string;
  type: ResourceType;
  title: string;
  description: string | null;
  subjectName: string;
  semester: number | null;
  author: string | null;
  year: number | null;
  fileUrl: string;
  fileKind: FileKind;
  fileSizeKb: number | null;
  downloadCount: number;
  createdAt: string;
  uploader: { id: string; name: string | null; image: string | null };
  avgRating: number;
  ratingCount: number;
  bookmarkCount?: number;
  isBookmarked: boolean;
}

export interface ResourceFilters {
  type?: ResourceType;
  q?: string;
  subject?: string;
  semester?: number;
  mine?: boolean;
  bookmarked?: boolean;
  sort?: "recent" | "rating" | "downloads";
}

export function useResources(filters: ResourceFilters = {}) {
  const [resources, setResources] = React.useState<Resource[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const filterKey = JSON.stringify(filters);

  const refresh = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const search = new URLSearchParams();
      if (filters.type) search.set("type", filters.type);
      if (filters.q) search.set("q", filters.q);
      if (filters.subject) search.set("subject", filters.subject);
      if (filters.semester) search.set("semester", String(filters.semester));
      if (filters.mine) search.set("mine", "true");
      if (filters.bookmarked) search.set("bookmarked", "true");
      if (filters.sort) search.set("sort", filters.sort);

      const res = await fetch(`/api/resources?${search.toString()}`);
      const json = await res.json();
      if (res.ok) setResources(json.resources ?? []);
    } catch {
      toast.error("Failed to load resources");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  async function uploadResource(data: ResourceInput) {
    const res = await fetch("/api/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to upload");
      return null;
    }
    toast.success("Uploaded successfully");
    await refresh();
    return json.resource as Resource;
  }

  async function deleteResource(id: string) {
    const res = await fetch(`/api/resources/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to delete");
      return false;
    }
    toast.success("Deleted");
    await refresh();
    return true;
  }

  async function toggleBookmark(id: string) {
    const res = await fetch(`/api/resources/${id}/bookmark`, {
      method: "POST",
    });
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
              bookmarkCount:
                (r.bookmarkCount ?? 0) + (json.bookmarked ? 1 : -1),
            }
          : r
      )
    );
    toast.success(json.bookmarked ? "Bookmarked" : "Bookmark removed");
    return json.bookmarked as boolean;
  }

  async function downloadResource(id: string) {
    const res = await fetch(`/api/resources/${id}/download`, {
      method: "POST",
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Download failed");
      return null;
    }
    setResources((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, downloadCount: json.downloadCount } : r
      )
    );
    return json.fileUrl as string;
  }

  async function rateResource(id: string, value: number, comment?: string) {
    const res = await fetch(`/api/resources/${id}/rating`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value, comment }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to submit rating");
      return false;
    }
    setResources((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, avgRating: json.avgRating, ratingCount: json.ratingCount }
          : r
      )
    );
    toast.success("Rating submitted");
    return true;
  }

  return {
    resources,
    isLoading,
    refresh,
    uploadResource,
    deleteResource,
    toggleBookmark,
    downloadResource,
    rateResource,
  };
}
