"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ListChecks, Clock, Send, AlertTriangle } from "lucide-react";
import { useAssignmentStats } from "@/hooks/use-assignment-stats";
import { cn } from "@/lib/utils";

export function AssignmentOverviewStats() {
  const { data, isLoading } = useAssignmentStats();

  const cards = [
    {
      icon: ListChecks,
      label: "Total assignments",
      value: data?.counts.total,
    },
    {
      icon: Clock,
      label: "Pending / in progress",
      value: (data?.counts.pending ?? 0) + (data?.counts.inProgress ?? 0),
    },
    {
      icon: Send,
      label: "Submitted / completed",
      value: (data?.counts.submitted ?? 0) + (data?.counts.completed ?? 0),
    },
    {
      icon: AlertTriangle,
      label: "Overdue",
      value: data?.counts.overdue,
      danger: (data?.counts.overdue ?? 0) > 0,
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
              {isLoading ? (
                <Skeleton className="mt-1 h-6 w-10" />
              ) : (
                <p className="text-xl font-bold">{card.value ?? 0}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
