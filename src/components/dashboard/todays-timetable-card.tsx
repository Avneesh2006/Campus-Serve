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
import { ClipboardList, MapPin, ArrowRight } from "lucide-react";
import { useTimetable } from "@/hooks/use-timetable";

const DAY_MAP = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;

export function TodaysTimetableCard() {
  const { slots, isLoading } = useTimetable();
  const today = DAY_MAP[new Date().getDay()];

  const todaysSlots = slots
    .filter((s) => s.dayOfWeek === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <ClipboardList className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base">Today&apos;s Timetable</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString("en-US", { weekday: "long" })}&apos;s classes
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

        {!isLoading && todaysSlots.length === 0 && (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No classes scheduled for today.
          </p>
        )}

        {!isLoading &&
          todaysSlots.map((slot) => (
            <div
              key={slot.id}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              <div className="w-20 shrink-0 text-sm font-medium text-muted-foreground">
                {slot.startTime}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {slot.subject.name}
                </p>
                {slot.room && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3" />
                    {slot.room}
                  </p>
                )}
              </div>
              <Badge variant={slot.type === "LAB" ? "secondary" : "outline"}>
                {slot.type}
              </Badge>
            </div>
          ))}

        <Button variant="ghost" size="sm" className="w-full justify-between" asChild>
          <Link href="/dashboard/timetable">
            View full timetable
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
