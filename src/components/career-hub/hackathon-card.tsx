"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark as BookmarkIcon, MapPin, Trophy, ExternalLink, Trash2, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Hackathon } from "@/hooks/use-hackathons";
import { MODE_LABELS } from "@/components/career-hub/internship-filter-bar";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function HackathonCard({
  hackathon,
  onToggleBookmark,
  onDelete,
}: {
  hackathon: Hackathon;
  onToggleBookmark: (hackathon: Hackathon) => void;
  onDelete?: (hackathon: Hackathon) => void;
}) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <Trophy className="size-4.5" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium leading-snug">{hackathon.title}</p>
              <p className="truncate text-xs text-muted-foreground">{hackathon.organizer}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            onClick={() => onToggleBookmark(hackathon)}
            aria-label={hackathon.isBookmarked ? "Remove bookmark" : "Bookmark"}
          >
            <BookmarkIcon
              className={cn("size-4", hackathon.isBookmarked && "fill-brand text-brand")}
            />
          </Button>
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">{hackathon.description}</p>

        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary">{MODE_LABELS[hackathon.mode]}</Badge>
          {hackathon.prizePool && <Badge variant="outline">{hackathon.prizePool}</Badge>}
        </div>

        <div className="space-y-1 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            {formatDate(hackathon.startsAt)}
            {hackathon.endsAt ? ` – ${formatDate(hackathon.endsAt)}` : ""}
          </p>
          {hackathon.location && (
            <p className="flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              {hackathon.location}
            </p>
          )}
          {hackathon.regDeadline && (
            <p className="font-medium text-amber-600 dark:text-amber-400">
              Register by {formatDate(hackathon.regDeadline)}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-1.5 pt-1">
          <Button size="sm" variant="brand" asChild>
            <a href={hackathon.registerUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-3.5" />
              Register
            </a>
          </Button>
          {hackathon.isOwn && onDelete && (
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(hackathon)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
