"use client";

import * as React from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { History, Trash2, Check, X, MinusCircle } from "lucide-react";
import { useAttendanceRecords } from "@/hooks/use-attendance-records";
import { useSubjects } from "@/hooks/use-subjects";
import { cn } from "@/lib/utils";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

const STATUS_CONFIG = {
  PRESENT: { label: "Present", icon: Check, className: "text-emerald-600 dark:text-emerald-400" },
  ABSENT: { label: "Absent", icon: X, className: "text-destructive" },
  CANCELLED: { label: "Cancelled", icon: MinusCircle, className: "text-muted-foreground" },
} as const;

export function AttendanceHistoryCard() {
  const { subjects } = useSubjects();
  const [subjectId, setSubjectId] = React.useState<string>("all");
  const { records, isLoading, deleteRecord } = useAttendanceRecords({
    subjectId: subjectId === "all" ? undefined : subjectId,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <History className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base">Attendance History</CardTitle>
            <CardDescription>All recorded classes</CardDescription>
          </div>
        </div>
        <CardAction>
          <Select value={subjectId} onValueChange={setSubjectId}>
            <SelectTrigger className="w-[160px]" size="sm">
              <SelectValue placeholder="All subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All subjects</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}

        {!isLoading && records.length === 0 && (
          <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No attendance records yet.
          </p>
        )}

        {!isLoading && records.length > 0 && (
          <div className="max-h-96 space-y-1 overflow-y-auto">
            {records.map((record) => {
              const config = STATUS_CONFIG[record.status];
              const Icon = config.icon;
              return (
                <div
                  key={record.id}
                  className="flex items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-accent"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: record.subject.color }}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {record.subject.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(record.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="outline" className={cn("gap-1", config.className)}>
                      <Icon className="size-3" />
                      {config.label}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteRecord(record.id)}
                      aria-label="Delete record"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
