"use client";

import * as React from "react";
import { toast } from "sonner";
import type { EventInput } from "@/lib/validations/community";

export type EventCategory =
  | "WORKSHOP"
  | "SEMINAR"
  | "FEST"
  | "COMPETITION"
  | "MEETUP"
  | "OTHER";

export type RsvpStatus = "GOING" | "INTERESTED" | "NOT_GOING";

export interface CommunityEvent {
  id: string;
  clubId: string | null;
  club: { id: string; name: string; logoColor: string } | null;
  title: string;
  description: string;
  category: EventCategory;
  location: string | null;
  startsAt: string;
  endsAt: string | null;
  rsvpCount: number;
  myRsvpStatus: RsvpStatus | null;
}

export function useEvents(
  filters: {
    category?: EventCategory;
    q?: string;
    clubId?: string;
    upcoming?: boolean;
    rsvped?: boolean;
  } = {}
) {
  const [events, setEvents] = React.useState<CommunityEvent[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const filterKey = JSON.stringify(filters);

  const refresh = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const search = new URLSearchParams();
      if (filters.category) search.set("category", filters.category);
      if (filters.q) search.set("q", filters.q);
      if (filters.clubId) search.set("clubId", filters.clubId);
      if (filters.upcoming) search.set("upcoming", "true");
      if (filters.rsvped) search.set("rsvped", "true");

      const res = await fetch(`/api/events?${search.toString()}`);
      const json = await res.json();
      if (res.ok) setEvents(json.events ?? []);
    } catch {
      toast.error("Failed to load events");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  async function createEvent(data: EventInput) {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to create event");
      return null;
    }
    toast.success("Event created");
    await refresh();
    return json.event as CommunityEvent;
  }

  async function deleteEvent(id: string) {
    const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to delete event");
      return false;
    }
    toast.success("Event deleted");
    await refresh();
    return true;
  }

  async function rsvp(id: string, status: RsvpStatus) {
    const res = await fetch(`/api/events/${id}/rsvp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to RSVP");
      return null;
    }
    await refresh();
    toast.success(
      status === "GOING"
        ? "You're going!"
        : status === "INTERESTED"
        ? "Marked as interested"
        : "RSVP removed"
    );
    return json.status as RsvpStatus;
  }

  return { events, isLoading, refresh, createEvent, deleteEvent, rsvp };
}
