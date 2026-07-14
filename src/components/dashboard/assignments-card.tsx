"use client";

import Link from "next/link";
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
import { FileText, ArrowRight, Clock, AlertTriangle } from "lucide-react";
import { useAssignmentStats } from "@/hooks/use-assignment-stats";
import { formatDueLabel } from "@/lib/assignments";
import { cn } from "@/lib/utils";

export function AssignmentsCard() {
  const { data, isLoading } = useAssignmentStats();
  const dueSoon = data?.dueSoon.slice(0, 4) ?? [];
  const pendingCount = (data?.counts.pending ?? 0) + (data?.counts.inProgress ?? 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <FileText className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base">Assignments</CardTitle>
            <CardDescription>
              {isLoading ? "Loading..." : `${pendingCount} pending`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && (
          <>
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </>
        )}

        {!isLoading && dueSoon.length === 0 && (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Nothing due soon. You&apos;re all caught up.
          </p>
        )}

        {!isLoading &&
          dueSoon.map((assignment) => {
            const isOverdue = assignment.effectiveStatus === "OVERDUE";
            return (
              <div
                key={assignment.id}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <div
                  className={cn(
                    "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
                    isOverdue
                      ? "bg-destructive/15 text-destructive"
                      : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                  )}
                >
                  {isOverdue ? (
                    <AlertTriangle className="size-3.5" />
                  ) : (
                    <Clock className="size-3.5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{assignment.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {assignment.subjectName}
                  </p>
                </div>
                <Badge
                  variant={isOverdue ? "destructive" : "warning"}
                  className="shrink-0"
                >
                  {formatDueLabel(assignment.dueDate, assignment.status)}
                </Badge>
              </div>
            );
          })}
        <Button variant="ghost" size="sm" className="w-full justify-between" asChild>
          <Link href="/dashboard/assignments">
            View all assignments
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
