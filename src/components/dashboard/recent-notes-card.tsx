"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { NotebookText, ArrowRight } from "lucide-react";
import { useResources } from "@/hooks/use-resources";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHrs < 1) return "Just now";
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

export function RecentNotesCard() {
  const { resources, isLoading } = useResources({ type: "NOTE", sort: "recent" });
  const recent = resources.slice(0, 4);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <NotebookText className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base">Recent Notes</CardTitle>
            <CardDescription>Latest uploads from the community</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && (
          <>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </>
        )}

        {!isLoading && recent.length === 0 && (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No notes uploaded yet.
          </p>
        )}

        {!isLoading &&
          recent.map((note) => (
            <Link
              key={note.id}
              href="/dashboard/notes"
              className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{note.title}</p>
                <p className="text-xs text-muted-foreground">
                  {note.subjectName}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {timeAgo(note.createdAt)}
              </span>
            </Link>
          ))}

        <Button variant="ghost" size="sm" className="w-full justify-between" asChild>
          <Link href="/dashboard/notes">
            View all notes
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
