"use client";

import * as React from "react";
import { toast } from "sonner";
import type { Announcement } from "@/hooks/use-admin-announcements";

export function useAnnouncements() {
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/announcements");
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

  return { announcements, isLoading, refresh };
}
