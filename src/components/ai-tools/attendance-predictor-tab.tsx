"use client";

import ReactMarkdown from "react-markdown";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { useAttendancePredictor } from "@/hooks/use-attendance-predictor";
import { statusToBadgeVariant } from "@/lib/attendance";

export function AttendancePredictorTab() {
  const { predictions, isLoading, insight, generateInsight, isGeneratingInsight } =
    useAttendancePredictor();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <TrendingUp className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base">Attendance Predictor</CardTitle>
              <CardDescription>
                Projected outcomes over the next 4 weeks, based on your real attendance data.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && (
            <>
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </>
          )}

          {!isLoading && predictions.length === 0 && (
            <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              Add subjects and mark some attendance to see predictions here.
            </p>
          )}

          {!isLoading &&
            predictions.map((p) => (
              <div key={p.subjectId} className="space-y-3 rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="font-medium">{p.subjectName}</span>
                  </div>
                  <Badge variant={statusToBadgeVariant(p.current.status)}>
                    Now: {p.current.percent}%
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-md bg-emerald-500/10 p-2.5">
                    <p className="text-xs text-muted-foreground">
                      If you attend all {p.upcomingClasses} upcoming classes
                    </p>
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {p.bestCase.percent}%
                    </p>
                  </div>
                  <div className="rounded-md bg-destructive/10 p-2.5">
                    <p className="text-xs text-muted-foreground">
                      If you miss all {p.upcomingClasses} upcoming classes
                    </p>
                    <p className="text-lg font-bold text-destructive">
                      {p.worstCase.percent}%
                    </p>
                  </div>
                </div>

                {p.upcomingClasses === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No timetable slots found for this subject, so a forward
                    projection isn&apos;t available — add it to your timetable
                    to see one.
                  </p>
                )}
              </div>
            ))}
        </CardContent>
      </Card>

      {predictions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <Sparkles className="size-4" />
              </div>
              <div>
                <CardTitle className="text-base">AI Insight</CardTitle>
                <CardDescription>
                  A quick read on your numbers above, with practical suggestions.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {!insight && (
              <Button
                variant="brand"
                size="sm"
                onClick={generateInsight}
                disabled={isGeneratingInsight}
              >
                {isGeneratingInsight ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                Generate insight
              </Button>
            )}
            {insight && (
              <div className="space-y-2 rounded-lg bg-muted p-3.5 text-sm [&_li]:ml-4 [&_p]:leading-relaxed [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:space-y-1">
                <ReactMarkdown>{insight}</ReactMarkdown>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
