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
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockCalendarEvents } from "@/lib/mock-data/dashboard";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export function CalendarCard() {
  const [cursor, setCursor] = React.useState(() => new Date());

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const today = new Date();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventDates = new Set(mockCalendarEvents.map((e) => e.date));

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
  }

  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <CalendarDays className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base">Calendar</CardTitle>
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
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
          {WEEKDAYS.map((day, i) => (
            <div key={`${day}-${i}`} className="py-1 font-medium">
              {day}
            </div>
          ))}
          {cells.map((day, i) => {
            const isToday =
              isCurrentMonth && day !== null && day === today.getDate();
            const hasEvent = day !== null && eventDates.has(day);

            return (
              <div
                key={i}
                className={cn(
                  "relative flex aspect-square items-center justify-center rounded-md text-sm",
                  day === null && "invisible",
                  isToday && "bg-brand text-brand-foreground font-semibold",
                  !isToday && day !== null && "hover:bg-accent"
                )}
              >
                {day}
                {hasEvent && !isToday && (
                  <span className="absolute bottom-1 size-1 rounded-full bg-brand" />
                )}
              </div>
            );
          })}
        </div>

        {mockCalendarEvents.length > 0 && (
          <div className="mt-4 space-y-2 border-t pt-4">
            {mockCalendarEvents.map((event) => (
              <div key={event.label} className="flex items-center gap-2 text-sm">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-brand/10 text-xs font-semibold text-brand">
                  {event.date}
                </span>
                <span className="truncate text-muted-foreground">
                  {event.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
