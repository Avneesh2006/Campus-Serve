"use client";

import * as React from "react";
import { toast } from "sonner";
import type { Assignment } from "@/hooks/use-assignments";

export interface AssignmentStats {
  counts: {
    total: number;
    pending: number;
    inProgress: number;
    submitted: number;
    completed: number;
    overdue: number;
  };
  dueSoon: Assignment[];
  byPriority: { high: number; medium: number; low: number };
}

export function useAssignmentStats() {
  const [data, setData] = React.useState<AssignmentStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/assignments/stats");
      const json = await res.json();
      if (res.ok) setData(json);
    } catch {
      toast.error("Failed to load assignment stats");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, isLoading, refresh };
}
