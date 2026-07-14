"use client";

import * as React from "react";
import { toast } from "sonner";
import type { AttendanceStats } from "@/lib/attendance";

export interface SubjectStats extends AttendanceStats {
  subjectId: string;
  subjectName: string;
  color: string;
}

export interface AttendanceStatsResponse {
  overall: { attended: number; totalHeld: number; percent: number };
  perSubject: SubjectStats[];
  weekly: { week: string; percent: number; attended: number; total: number }[];
  monthly: { month: string; percent: number; attended: number; total: number }[];
}

export function useAttendanceStats() {
  const [data, setData] = React.useState<AttendanceStatsResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/attendance/stats");
      const json = await res.json();
      if (res.ok) setData(json);
    } catch {
      toast.error("Failed to load attendance stats");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, isLoading, refresh };
}
