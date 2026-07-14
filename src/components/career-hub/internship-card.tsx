"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark as BookmarkIcon, MapPin, Clock, ExternalLink, Trash2, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Internship } from "@/hooks/use-internships";
import { INTERNSHIP_CATEGORY_LABELS, MODE_LABELS } from "@/components/career-hub/internship-filter-bar";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHrs < 1) return "Just now";
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

export function InternshipCard({
  internship,
  onToggleBookmark,
  onDelete,
}: {
  internship: Internship;
  onToggleBookmark: (internship: Internship) => void;
  onDelete?: (internship: Internship) => void;
}) {
  const deadlineSoon =
    internship.deadline &&
    new Date(internship.deadline).getTime() - Date.now() < 1000 * 60 * 60 * 24 * 3;

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <Briefcase className="size-4.5" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium leading-snug">{internship.title}</p>
              <p className="truncate text-xs text-muted-foreground">{internship.company}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            onClick={() => onToggleBookmark(internship)}
            aria-label={internship.isBookmarked ? "Remove bookmark" : "Bookmark"}
          >
            <BookmarkIcon
              className={cn("size-4", internship.isBookmarked && "fill-brand text-brand")}
            />
          </Button>
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">{internship.description}</p>

        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline">{INTERNSHIP_CATEGORY_LABELS[internship.category]}</Badge>
          <Badge variant="secondary">{MODE_LABELS[internship.mode]}</Badge>
          {internship.stipend && <Badge variant="outline">{internship.stipend}</Badge>}
        </div>

        <div className="space-y-1 text-xs text-muted-foreground">
          {internship.location && (
            <p className="flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              {internship.location}
            </p>
          )}
          {internship.durationWeeks && (
            <p className="flex items-center gap-1.5">
              <Clock className="size-3.5" />
              {internship.durationWeeks} weeks
            </p>
          )}
          {internship.deadline && (
            <p
              className={cn(
                "flex items-center gap-1.5",
                deadlineSoon && "font-medium text-destructive"
              )}
            >
              <Clock className="size-3.5" />
              Apply by {new Date(internship.deadline).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-xs text-muted-foreground">{timeAgo(internship.createdAt)}</span>
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="brand" asChild>
              <a href={internship.applyUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-3.5" />
                Apply
              </a>
            </Button>
            {internship.isOwn && onDelete && (
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => onDelete(internship)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
