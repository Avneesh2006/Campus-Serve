"use client";

import Link from "next/link";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarCheck, ArrowRight } from "lucide-react";
import { useAttendanceStats } from "@/hooks/use-attendance-stats";

export function AttendanceSummaryCard() {
  const { data, isLoading } = useAttendanceStats();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <CalendarCheck className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base">Attendance Summary</CardTitle>
            <CardDescription>This semester, by subject</CardDescription>
          </div>
        </div>
        <CardAction>
          {!isLoading && (
            <Badge
              variant={
                data && data.overall.percent >= 75
                  ? "success"
                  : data && data.overall.percent >= 65
                  ? "warning"
                  : "destructive"
              }
            >
              {data?.overall.percent ?? 0}% overall
            </Badge>
          )}
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </>
        )}

        {!isLoading && (data?.perSubject.length ?? 0) === 0 && (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No subjects yet. Add subjects in the Attendance module to see your
            summary here.
          </p>
        )}

        {!isLoading &&
          data?.perSubject.slice(0, 4).map((subject) => (
            <div key={subject.subjectId} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{subject.subjectName}</span>
                <span className="text-muted-foreground">
                  {subject.attended}/{subject.totalHeld} · {subject.percent}%
                </span>
              </div>
              <Progress
                value={subject.percent}
                indicatorClassName={
                  subject.status === "danger"
                    ? "bg-destructive"
                    : subject.status === "warning"
                    ? "bg-amber-500"
                    : undefined
                }
              />
            </div>
          ))}

        <Button variant="ghost" size="sm" className="w-full justify-between" asChild>
          <Link href="/dashboard/attendance">
            View full attendance
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
