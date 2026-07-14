"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, CheckCircle2, CircleDot, Circle } from "lucide-react";
import { useCodingProgressStats } from "@/hooks/use-coding-progress-stats";

export function ProgressTrackingCard() {
  const { data, isLoading } = useCodingProgressStats();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <TrendingUp className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base">Your Progress</CardTitle>
            <CardDescription>Coding resource completion</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Overall completion</span>
                <span className="text-muted-foreground">{data?.percentComplete ?? 0}%</span>
              </div>
              <Progress value={data?.percentComplete ?? 0} />
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg border p-3">
                <CheckCircle2 className="mx-auto mb-1 size-4 text-emerald-600 dark:text-emerald-400" />
                <p className="text-lg font-bold">{data?.completed ?? 0}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              <div className="rounded-lg border p-3">
                <CircleDot className="mx-auto mb-1 size-4 text-amber-600 dark:text-amber-400" />
                <p className="text-lg font-bold">{data?.inProgress ?? 0}</p>
                <p className="text-xs text-muted-foreground">In progress</p>
              </div>
              <div className="rounded-lg border p-3">
                <Circle className="mx-auto mb-1 size-4 text-muted-foreground" />
                <p className="text-lg font-bold">{data?.notStarted ?? 0}</p>
                <p className="text-xs text-muted-foreground">Not started</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
