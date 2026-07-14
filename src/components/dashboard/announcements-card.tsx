"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Megaphone, Pin } from "lucide-react";
import { useAnnouncements } from "@/hooks/use-announcements";

const PRIORITY_VARIANT: Record<string, "outline" | "warning" | "destructive"> = {
  LOW: "outline",
  NORMAL: "outline",
  HIGH: "destructive",
};

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHrs < 1) return "Just now";
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

export function AnnouncementsCard() {
  const { announcements, isLoading } = useAnnouncements();
  const shown = announcements.slice(0, 4);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <Megaphone className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base">Announcements</CardTitle>
            <CardDescription>From CampusOS admins</CardDescription>
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

        {!isLoading && shown.length === 0 && (
          <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            No announcements right now.
          </p>
        )}

        {!isLoading &&
          shown.map((announcement) => (
            <div key={announcement.id} className="rounded-lg border p-3">
              <div className="flex items-center gap-1.5">
                {announcement.isPinned && <Pin className="size-3 shrink-0 text-brand" />}
                <p className="truncate text-sm font-medium leading-snug">
                  {announcement.title}
                </p>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {announcement.body}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <Badge variant={PRIORITY_VARIANT[announcement.priority]}>
                  {announcement.priority}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {timeAgo(announcement.createdAt)}
                </span>
              </div>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}
