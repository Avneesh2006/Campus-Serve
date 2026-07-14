"use client";

import * as React from "react";
import { toast } from "sonner";
import type { AttendanceStats } from "@/lib/attendance";

export interface SubjectPrediction {
  subjectId: string;
  subjectName: string;
  color: string;
  target: number;
  current: AttendanceStats;
  upcomingClasses: number;
  bestCase: AttendanceStats;
  worstCase: AttendanceStats;
}

export function useAttendancePredictor() {
  const [predictions, setPredictions] = React.useState<SubjectPrediction[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [insight, setInsight] = React.useState<string | null>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = React.useState(false);

  const refresh = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/attendance-predictor");
      const json = await res.json();
      if (res.ok) setPredictions(json.predictions ?? []);
    } catch {
      toast.error("Failed to load predictions");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  async function generateInsight() {
    setIsGeneratingInsight(true);
    try {
      const res = await fetch("/api/ai/attendance-predictor", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to generate insight");
        return;
      }
      setInsight(json.insight);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsGeneratingInsight(false);
    }
  }

  return { predictions, isLoading, refresh, insight, generateInsight, isGeneratingInsight };
}
