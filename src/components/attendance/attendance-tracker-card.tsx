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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarCheck, Check, X, MinusCircle, Loader2 } from "lucide-react";
import { useSubjects } from "@/hooks/use-subjects";
import { useAttendanceRecords } from "@/hooks/use-attendance-records";
import { cn } from "@/lib/utils";

type MarkStatus = "PRESENT" | "ABSENT" | "CANCELLED";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function AttendanceTrackerCard() {
  const { subjects, isLoading: subjectsLoading } = useSubjects();
  const [date, setDate] = React.useState(todayISO());
  const { records, markBulk, refresh } = useAttendanceRecords({
    from: date,
    to: date,
  });
  const [draft, setDraft] = React.useState<Record<string, MarkStatus | undefined>>({});
  const [isSaving, setIsSaving] = React.useState(false);

  // Seed draft from existing records whenever date or records change
  React.useEffect(() => {
    const seeded: Record<string, MarkStatus | undefined> = {};
    for (const r of records) {
      seeded[r.subjectId] = r.status;
    }
    setDraft(seeded);
  }, [records]);

  function setMark(subjectId: string, status: MarkStatus) {
    setDraft((prev) => ({
      ...prev,
      [subjectId]: prev[subjectId] === status ? undefined : status,
    }));
  }

  async function handleSave() {
    const entries = Object.entries(draft)
      .filter(([, status]) => !!status)
      .map(([subjectId, status]) => ({ subjectId, status: status! }));

    if (entries.length === 0) return;

    setIsSaving(true);
    try {
      await markBulk(date, entries);
      await refresh();
    } finally {
      setIsSaving(false);
    }
  }

  const hasChanges = subjects.some((s) => draft[s.id]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <CalendarCheck className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base">Attendance Tracker</CardTitle>
            <CardDescription>Mark today&apos;s classes</CardDescription>
          </div>
        </div>
        <CardAction>
          <Input
            type="date"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value)}
            className="h-8 w-[150px]"
          />
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        {subjectsLoading && (
          <>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </>
        )}

        {!subjectsLoading && subjects.length === 0 && (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Add a subject first to start marking attendance.
          </p>
        )}

        {!subjectsLoading &&
          subjects.map((subject) => {
            const current = draft[subject.id];
            return (
              <div
                key={subject.id}
                className="flex items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: subject.color }}
                  />
                  <span className="truncate text-sm font-medium">
                    {subject.name}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Button
                    type="button"
                    size="icon"
                    variant={current === "PRESENT" ? "default" : "outline"}
                    className={cn(
                      "size-8",
                      current === "PRESENT" &&
                        "bg-emerald-600 text-white hover:bg-emerald-600/90"
                    )}
                    onClick={() => setMark(subject.id, "PRESENT")}
                    aria-label="Mark present"
                  >
                    <Check className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant={current === "ABSENT" ? "default" : "outline"}
                    className={cn(
                      "size-8",
                      current === "ABSENT" &&
                        "bg-destructive text-white hover:bg-destructive/90"
                    )}
                    onClick={() => setMark(subject.id, "ABSENT")}
                    aria-label="Mark absent"
                  >
                    <X className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant={current === "CANCELLED" ? "default" : "outline"}
                    className={cn(
                      "size-8",
                      current === "CANCELLED" && "bg-muted-foreground text-background"
                    )}
                    onClick={() => setMark(subject.id, "CANCELLED")}
                    aria-label="Mark class cancelled"
                  >
                    <MinusCircle className="size-4" />
                  </Button>
                </div>
              </div>
            );
          })}

        {subjects.length > 0 && (
          <Button
            className="w-full"
            variant="brand"
            disabled={!hasChanges || isSaving}
            onClick={handleSave}
          >
            {isSaving && <Loader2 className="size-4 animate-spin" />}
            Save attendance
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
