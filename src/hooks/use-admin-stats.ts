"use client";

import * as React from "react";
import { toast } from "sonner";

export interface AdminStats {
  totalUsers: number;
  newUsersThisWeek: number;
  totalSubjects: number;
  totalAssignments: number;
  totalResources: number;
  totalForumPosts: number;
  totalListings: number;
  totalAnnouncements: number;
  totalAiConversations: number;
}

export function useAdminStats() {
  const [data, setData] = React.useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      const json = await res.json();
      if (res.ok) setData(json);
    } catch {
      toast.error("Failed to load admin stats");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, isLoading, refresh };
}
