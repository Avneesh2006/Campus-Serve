"use client";

import * as React from "react";
import { toast } from "sonner";
import type { InternshipInput } from "@/lib/validations/career-hub";

export type InternshipCategory =
  | "SOFTWARE_DEV"
  | "DATA_SCIENCE"
  | "DESIGN"
  | "MARKETING"
  | "FINANCE"
  | "CORE_ENGINEERING"
  | "RESEARCH"
  | "OTHER";

export type InternshipMode = "REMOTE" | "ONSITE" | "HYBRID";

export interface Internship {
  id: string;
  postedById: string;
  title: string;
  company: string;
  category: InternshipCategory;
  mode: InternshipMode;
  location: string | null;
  stipend: string | null;
  durationWeeks: number | null;
  applyUrl: string;
  description: string;
  deadline: string | null;
  createdAt: string;
  isBookmarked: boolean;
  bookmarkCount: number;
  isOwn: boolean;
}

export interface InternshipFilters {
  category?: InternshipCategory;
  mode?: InternshipMode;
  q?: string;
  bookmarked?: boolean;
}

export function useInternships(filters: InternshipFilters = {}) {
  const [internships, setInternships] = React.useState<Internship[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const filterKey = JSON.stringify(filters);

  const refresh = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const search = new URLSearchParams();
      if (filters.category) search.set("category", filters.category);
      if (filters.mode) search.set("mode", filters.mode);
      if (filters.q) search.set("q", filters.q);
      if (filters.bookmarked) search.set("bookmarked", "true");

      const res = await fetch(`/api/internships?${search.toString()}`);
      const json = await res.json();
      if (res.ok) setInternships(json.internships ?? []);
    } catch {
      toast.error("Failed to load internships");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  async function createInternship(data: InternshipInput) {
    const res = await fetch("/api/internships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to post internship");
      return null;
    }
    toast.success("Internship posted");
    await refresh();
    return json.internship as Internship;
  }

  async function deleteInternship(id: string) {
    const res = await fetch(`/api/internships/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to delete internship");
      return false;
    }
    toast.success("Internship deleted");
    await refresh();
    return true;
  }

  async function toggleBookmark(id: string) {
    const res = await fetch(`/api/internships/${id}/bookmark`, { method: "POST" });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to update bookmark");
      return null;
    }
    setInternships((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              isBookmarked: json.bookmarked,
              bookmarkCount: i.bookmarkCount + (json.bookmarked ? 1 : -1),
            }
          : i
      )
    );
    toast.success(json.bookmarked ? "Bookmarked" : "Bookmark removed");
    return json.bookmarked as boolean;
  }

  return { internships, isLoading, refresh, createInternship, deleteInternship, toggleBookmark };
}
