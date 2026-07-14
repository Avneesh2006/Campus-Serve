"use client";

import * as React from "react";
import { toast } from "sonner";
import type { HackathonInput } from "@/lib/validations/career-hub";

export type HackathonMode = "REMOTE" | "ONSITE" | "HYBRID";

export interface Hackathon {
  id: string;
  postedById: string;
  title: string;
  organizer: string;
  mode: HackathonMode;
  location: string | null;
  prizePool: string | null;
  registerUrl: string;
  description: string;
  startsAt: string;
  endsAt: string | null;
  regDeadline: string | null;
  createdAt: string;
  isBookmarked: boolean;
  bookmarkCount: number;
  isOwn: boolean;
}

export interface HackathonFilters {
  mode?: HackathonMode;
  q?: string;
  bookmarked?: boolean;
  upcoming?: boolean;
}

export function useHackathons(filters: HackathonFilters = {}) {
  const [hackathons, setHackathons] = React.useState<Hackathon[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const filterKey = JSON.stringify(filters);

  const refresh = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const search = new URLSearchParams();
      if (filters.mode) search.set("mode", filters.mode);
      if (filters.q) search.set("q", filters.q);
      if (filters.bookmarked) search.set("bookmarked", "true");
      if (filters.upcoming) search.set("upcoming", "true");

      const res = await fetch(`/api/hackathons?${search.toString()}`);
      const json = await res.json();
      if (res.ok) setHackathons(json.hackathons ?? []);
    } catch {
      toast.error("Failed to load hackathons");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  async function createHackathon(data: HackathonInput) {
    const res = await fetch("/api/hackathons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to post hackathon");
      return null;
    }
    toast.success("Hackathon posted");
    await refresh();
    return json.hackathon as Hackathon;
  }

  async function deleteHackathon(id: string) {
    const res = await fetch(`/api/hackathons/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to delete hackathon");
      return false;
    }
    toast.success("Hackathon deleted");
    await refresh();
    return true;
  }

  async function toggleBookmark(id: string) {
    const res = await fetch(`/api/hackathons/${id}/bookmark`, { method: "POST" });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to update bookmark");
      return null;
    }
    setHackathons((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              isBookmarked: json.bookmarked,
              bookmarkCount: h.bookmarkCount + (json.bookmarked ? 1 : -1),
            }
          : h
      )
    );
    toast.success(json.bookmarked ? "Bookmarked" : "Bookmark removed");
    return json.bookmarked as boolean;
  }

  return { hackathons, isLoading, refresh, createHackathon, deleteHackathon, toggleBookmark };
}
