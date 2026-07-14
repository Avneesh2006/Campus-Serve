"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarCheck, ShieldCheck, TrendingDown, BookOpen } from "lucide-react";
import { useAttendanceStats } from "@/hooks/use-attendance-stats";
import { useSubjects } from "@/hooks/use-subjects";
import { cn } from "@/lib/utils";

export function AttendanceOverviewStats() {
  const { data, isLoading } = useAttendanceStats();
  const { subjects } = useSubjects();

  const totalSafeBunks = (data?.perSubject ?? []).reduce(
    (sum, s) => sum + s.safeBunks,
    0
  );
  const subjectsAtRisk = (data?.perSubject ?? []).filter(
    (s) => s.status === "danger"
  ).length;

  const cards = [
    {
      icon: CalendarCheck,
      label: "Overall attendance",
      value: isLoading ? null : `${data?.overall.percent ?? 0}%`,
      sub: isLoading
        ? null
        : `${data?.overall.attended ?? 0}/${data?.overall.totalHeld ?? 0} classes attended`,
    },
    {
      icon: ShieldCheck,
      label: "Total safe bunks",
      value: isLoading ? null : totalSafeBunks,
      sub: "Classes you can skip across subjects",
    },
    {
      icon: TrendingDown,
      label: "Subjects at risk",
      value: isLoading ? null : subjectsAtRisk,
      sub: "Below safe threshold",
      danger: subjectsAtRisk > 0,
    },
    {
      icon: BookOpen,
      label: "Subjects tracked",
      value: isLoading ? null : subjects.length,
      sub: "Active this semester",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-lg",
                card.danger
                  ? "bg-destructive/10 text-destructive"
                  : "bg-brand/10 text-brand"
              )}
            >
              <card.icon className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{card.label}</p>
              {card.value === null ? (
                <Skeleton className="mt-1 h-6 w-12" />
              ) : (
                <p className="text-xl font-bold">{card.value}</p>
              )}
              {card.sub && (
                <p className="truncate text-xs text-muted-foreground">
                  {card.sub}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
