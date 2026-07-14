"use client";

import * as React from "react";
import { toast } from "sonner";

export interface CodingProgressStats {
  totalResources: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  percentComplete: number;
  byCategory: { category: string; total: number; completed: number }[];
}

export function useCodingProgressStats() {
  const [data, setData] = React.useState<CodingProgressStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/coding-resources/stats");
      const json = await res.json();
      if (res.ok) setData(json);
    } catch {
      toast.error("Failed to load progress stats");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, isLoading, refresh };
}
