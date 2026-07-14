"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calculator, ShieldCheck, TrendingUp } from "lucide-react";
import { useAttendanceStats } from "@/hooks/use-attendance-stats";
import { statusToBadgeVariant } from "@/lib/attendance";

export function AttendanceCalculatorCard() {
  const { data, isLoading } = useAttendanceStats();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <Calculator className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base">Attendance Calculator</CardTitle>
            <CardDescription>
              Safe bunks &amp; classes required per subject
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && (
          <>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </>
        )}

        {!isLoading && (data?.perSubject.length ?? 0) === 0 && (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Add subjects and mark attendance to see calculations here.
          </p>
        )}

        {!isLoading &&
          data?.perSubject.map((subject) => (
            <div key={subject.subjectId} className="rounded-lg border p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: subject.color }}
                  />
                  <span className="truncate text-sm font-medium">
                    {subject.subjectName}
                  </span>
                </div>
                <Badge variant={statusToBadgeVariant(subject.status)}>
                  {subject.percent}% (target {subject.target}%)
                </Badge>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 p-2">
                  <ShieldCheck className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {subject.safeBunks}
                    </p>
                    <p className="text-xs text-muted-foreground">safe bunks</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-md bg-amber-500/10 p-2">
                  <TrendingUp className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div>
                    <p className="font-semibold text-amber-600 dark:text-amber-400">
                      {subject.classesRequired}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      classes needed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}
