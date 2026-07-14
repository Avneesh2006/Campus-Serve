"use client";

import * as React from "react";
import { toast } from "sonner";
import type { AnnouncementInput, UpdateAnnouncementInput } from "@/lib/validations/admin";

export type AnnouncementPriority = "LOW" | "NORMAL" | "HIGH";

export interface Announcement {
  id: string;
  authorId: string;
  title: string;
  body: string;
  priority: AnnouncementPriority;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  author: { id: string; name: string | null; image: string | null };
}

export function useAdminAnnouncements() {
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/announcements");
      const json = await res.json();
      if (res.ok) setAnnouncements(json.announcements ?? []);
    } catch {
      toast.error("Failed to load announcements");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  async function createAnnouncement(data: AnnouncementInput) {
    const res = await fetch("/api/admin/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to post announcement");
      return null;
    }
    toast.success("Announcement posted");
    await refresh();
    return json.announcement as Announcement;
  }

  async function updateAnnouncement(id: string, data: UpdateAnnouncementInput) {
    const res = await fetch(`/api/admin/announcements/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to update announcement");
      return null;
    }
    toast.success("Announcement updated");
    await refresh();
    return json.announcement as Announcement;
  }

  async function deleteAnnouncement(id: string) {
    const res = await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to delete announcement");
      return false;
    }
    toast.success("Announcement deleted");
    await refresh();
    return true;
  }

  return {
    announcements,
    isLoading,
    refresh,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
  };
}
