"use client";

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
import { Bell, Send, CheckCircle2 } from "lucide-react";
import { useAssignmentStats } from "@/hooks/use-assignment-stats";
import { useAssignments, type Assignment } from "@/hooks/use-assignments";
import {
  priorityBadgeVariant,
  statusBadgeVariant,
  statusLabel,
  formatDueLabel,
} from "@/lib/assignments";
import { cn } from "@/lib/utils";

export function AssignmentRemindersTab() {
  const { data, isLoading } = useAssignmentStats();
  const { submitAssignment, updateStatus, refresh: refreshList } = useAssignments();

  async function handleSubmit(a: Assignment) {
    await submitAssignment(a.id);
    await refreshList();
  }

  async function handleComplete(a: Assignment) {
    await updateStatus(a.id, "COMPLETED");
    await refreshList();
  }

  const dueSoon = data?.dueSoon ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <Bell className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base">Reminders</CardTitle>
            <CardDescription>
              Assignments due within the next 3 days
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

        {!isLoading && dueSoon.length === 0 && (
          <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            Nothing urgent right now. You&apos;re all caught up.
          </p>
        )}

        {!isLoading &&
          dueSoon.map((a) => {
            const isOverdue = a.effectiveStatus === "OVERDUE";
            return (
              <div
                key={a.id}
                className={cn(
                  "flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between",
                  isOverdue && "border-destructive/40 bg-destructive/5"
                )}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{a.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {a.subjectName}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <Badge variant={priorityBadgeVariant(a.priority)}>
                      {a.priority.charAt(0) + a.priority.slice(1).toLowerCase()}
                    </Badge>
                    <Badge variant={statusBadgeVariant(a.effectiveStatus)}>
                      {statusLabel(a.effectiveStatus)}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(isOverdue && "border-destructive text-destructive")}
                    >
                      {formatDueLabel(a.dueDate, a.status)}
                    </Badge>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <Button size="sm" variant="outline" onClick={() => handleSubmit(a)}>
                    <Send className="size-3.5" />
                    Submit
                  </Button>
                  <Button size="sm" variant="brand" onClick={() => handleComplete(a)}>
                    <CheckCircle2 className="size-3.5" />
                    Complete
                  </Button>
                </div>
              </div>
            );
          })}
      </CardContent>
    </Card>
  );
}
