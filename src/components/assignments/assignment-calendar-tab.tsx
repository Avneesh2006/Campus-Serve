"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAssignments, type Assignment } from "@/hooks/use-assignments";
import { priorityBadgeVariant, statusBadgeVariant, statusLabel } from "@/lib/assignments";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export function AssignmentCalendarTab({
  onSelectAssignment,
}: {
  onSelectAssignment: (a: Assignment) => void;
}) {
  const [cursor, setCursor] = React.useState(() => new Date());
  const [selectedDay, setSelectedDay] = React.useState<number | null>(
    new Date().getDate()
  );
  const { assignments, isLoading } = useAssignments({ sort: "dueDate" });

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const today = new Date();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const assignmentsByDay = React.useMemo(() => {
    const map = new Map<number, Assignment[]>();
    for (const a of assignments) {
      const due = new Date(a.dueDate);
      if (due.getFullYear() === year && due.getMonth() === month) {
        const day = due.getDate();
        map.set(day, [...(map.get(day) ?? []), a]);
      }
    }
    return map;
  }, [assignments, year, month]);

  const cells: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthLabel = cursor.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  function changeMonth(delta: number) {
    setCursor(new Date(year, month + delta, 1));
    setSelectedDay(null);
  }

  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const selectedAssignments =
    selectedDay !== null ? assignmentsByDay.get(selectedDay) ?? [] : [];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <CalendarDays className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base">Assignment Calendar</CardTitle>
              <CardDescription>{monthLabel}</CardDescription>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => changeMonth(-1)}
              aria-label="Previous month"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => changeMonth(1)}
              aria-label="Next month"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-80 w-full" />
          ) : (
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
              {WEEKDAYS.map((day, i) => (
                <div key={`${day}-${i}`} className="py-1 font-medium">
                  {day}
                </div>
              ))}
              {cells.map((day, i) => {
                const isToday = isCurrentMonth && day !== null && day === today.getDate();
                const dayAssignments = day !== null ? assignmentsByDay.get(day) ?? [] : [];
                const hasHighPriority = dayAssignments.some((a) => a.priority === "HIGH");
                const isSelected = day !== null && day === selectedDay;

                return (
                  <button
                    key={i}
                    disabled={day === null}
                    onClick={() => setSelectedDay(day)}
                    className={cn(
                      "relative flex aspect-square flex-col items-center justify-center gap-0.5 rounded-md text-sm transition-colors",
                      day === null && "invisible",
                      isToday && !isSelected && "font-semibold text-brand",
                      isSelected && "bg-brand text-brand-foreground font-semibold",
                      !isSelected && day !== null && "hover:bg-accent"
                    )}
                  >
                    {day}
                    {dayAssignments.length > 0 && (
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          isSelected
                            ? "bg-brand-foreground"
                            : hasHighPriority
                            ? "bg-destructive"
                            : "bg-brand"
                        )}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {selectedDay !== null
              ? new Date(year, month, selectedDay).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })
              : "Select a day"}
          </CardTitle>
          <CardDescription>
            {selectedAssignments.length} assignment
            {selectedAssignments.length === 1 ? "" : "s"} due
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {selectedAssignments.length === 0 && (
            <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              Nothing due on this day.
            </p>
          )}
          {selectedAssignments.map((a) => (
            <button
              key={a.id}
              onClick={() => onSelectAssignment(a)}
              className="w-full space-y-1.5 rounded-lg border p-3 text-left transition-colors hover:bg-accent"
            >
              <p className="truncate text-sm font-medium">{a.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {a.subjectName}
              </p>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant={priorityBadgeVariant(a.priority)}>
                  {a.priority.charAt(0) + a.priority.slice(1).toLowerCase()}
                </Badge>
                <Badge variant={statusBadgeVariant(a.effectiveStatus)}>
                  {statusLabel(a.effectiveStatus)}
                </Badge>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
