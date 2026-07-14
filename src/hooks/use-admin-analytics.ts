"use client";

import * as React from "react";
import { toast } from "sonner";

export interface DayCount {
  day: string;
  count: number;
}

export interface AdminAnalytics {
  newUsersByDay: DayCount[];
  newAssignmentsByDay: DayCount[];
  newResourcesByDay: DayCount[];
  newForumPostsByDay: DayCount[];
  usersByRole: { role: string; count: number }[];
}

export function useAdminAnalytics() {
  const [data, setData] = React.useState<AdminAnalytics | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/analytics");
      const json = await res.json();
      if (res.ok) setData(json);
    } catch {
      toast.error("Failed to load analytics");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, isLoading, refresh };
}
