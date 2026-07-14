"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bookmark as BookmarkIcon, ExternalLink, Trash2, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CodingResource, ProgressStatus } from "@/hooks/use-coding-resources";

export const CODING_CATEGORY_LABELS: Record<string, string> = {
  DSA: "DSA",
  WEB_DEV: "Web Development",
  SYSTEM_DESIGN: "System Design",
  COMPETITIVE_PROGRAMMING: "Competitive Programming",
  INTERVIEW_PREP: "Interview Prep",
  LANGUAGES: "Languages",
  OTHER: "Other",
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

const PROGRESS_LABELS: Record<ProgressStatus, string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};

const PROGRESS_BADGE_VARIANT: Record<
  ProgressStatus,
  "outline" | "warning" | "success"
> = {
  NOT_STARTED: "outline",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
};

export function CodingResourceCard({
  resource,
  onToggleBookmark,
  onUpdateProgress,
  onDelete,
}: {
  resource: CodingResource;
  onToggleBookmark: (resource: CodingResource) => void;
  onUpdateProgress: (resource: CodingResource, status: ProgressStatus) => void;
  onDelete?: (resource: CodingResource) => void;
}) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <Code2 className="size-4.5" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium leading-snug">{resource.title}</p>
              {resource.provider && (
                <p className="truncate text-xs text-muted-foreground">{resource.provider}</p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            onClick={() => onToggleBookmark(resource)}
            aria-label={resource.isBookmarked ? "Remove bookmark" : "Bookmark"}
          >
            <BookmarkIcon
              className={cn("size-4", resource.isBookmarked && "fill-brand text-brand")}
            />
          </Button>
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">{resource.description}</p>

        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline">{CODING_CATEGORY_LABELS[resource.category]}</Badge>
          <Badge variant="secondary">{DIFFICULTY_LABELS[resource.difficulty]}</Badge>
          <Badge variant={PROGRESS_BADGE_VARIANT[resource.myStatus]}>
            {PROGRESS_LABELS[resource.myStatus]}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={resource.myStatus}
            onValueChange={(v) => onUpdateProgress(resource, v as ProgressStatus)}
          >
            <SelectTrigger className="h-8 flex-1" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PROGRESS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="brand" asChild>
            <a href={resource.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-3.5" />
              Open
            </a>
          </Button>
          {resource.isOwn && onDelete && (
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(resource)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
