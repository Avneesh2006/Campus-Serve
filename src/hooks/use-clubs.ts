"use client";

import * as React from "react";
import { toast } from "sonner";
import type { ClubInput } from "@/lib/validations/community";

export type ClubCategory =
  | "TECHNICAL"
  | "CULTURAL"
  | "SPORTS"
  | "SOCIAL_SERVICE"
  | "ARTS"
  | "ENTREPRENEURSHIP"
  | "OTHER";

export interface Club {
  id: string;
  name: string;
  description: string;
  category: ClubCategory;
  logoColor: string;
  createdAt: string;
  memberCount: number;
  eventCount: number;
  isJoined: boolean;
}

export function useClubs(filters: { category?: ClubCategory; q?: string; joined?: boolean } = {}) {
  const [clubs, setClubs] = React.useState<Club[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const filterKey = JSON.stringify(filters);

  const refresh = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const search = new URLSearchParams();
      if (filters.category) search.set("category", filters.category);
      if (filters.q) search.set("q", filters.q);
      if (filters.joined) search.set("joined", "true");

      const res = await fetch(`/api/clubs?${search.toString()}`);
      const json = await res.json();
      if (res.ok) setClubs(json.clubs ?? []);
    } catch {
      toast.error("Failed to load clubs");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  async function createClub(data: ClubInput) {
    const res = await fetch("/api/clubs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to create club");
      return null;
    }
    toast.success("Club created");
    await refresh();
    return json.club as Club;
  }

  async function toggleJoin(id: string) {
    const res = await fetch(`/api/clubs/${id}/join`, { method: "POST" });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to update membership");
      return null;
    }
    setClubs((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              isJoined: json.joined,
              memberCount: c.memberCount + (json.joined ? 1 : -1),
            }
          : c
      )
    );
    toast.success(json.joined ? "Joined club" : "Left club");
    return json.joined as boolean;
  }

  return { clubs, isLoading, refresh, createClub, toggleJoin };
}
