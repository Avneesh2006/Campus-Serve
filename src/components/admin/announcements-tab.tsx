"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, Pin, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  useAdminAnnouncements,
  type Announcement,
} from "@/hooks/use-admin-announcements";
import { AnnouncementFormDialog } from "@/components/admin/announcement-form-dialog";
import { DeleteConfirmDialog } from "@/components/attendance/delete-confirm-dialog";
import { cn } from "@/lib/utils";

const PRIORITY_VARIANT: Record<string, "outline" | "warning" | "destructive"> = {
  LOW: "outline",
  NORMAL: "warning",
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

export function AnnouncementsTab() {
  const { announcements, isLoading, createAnnouncement, updateAnnouncement, deleteAnnouncement } =
    useAdminAnnouncements();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Announcement | null>(null);
  const [deleting, setDeleting] = React.useState<Announcement | null>(null);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(announcement: Announcement) {
    setEditing(announcement);
    setFormOpen(true);
  }

  async function handleSubmit(data: Parameters<typeof createAnnouncement>[0]) {
    return editing ? await updateAnnouncement(editing.id, data) : await createAnnouncement(data);
  }

  async function handleDelete() {
    if (!deleting) return;
    await deleteAnnouncement(deleting.id);
    setDeleting(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button variant="brand" onClick={openAdd}>
          <Plus className="size-4" />
          New announcement
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {!isLoading && announcements.length === 0 && (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">No announcements yet.</p>
          <Button variant="brand" size="sm" className="mt-4" onClick={openAdd}>
            <Plus className="size-4" />
            Post the first one
          </Button>
        </div>
      )}

      {!isLoading && announcements.length > 0 && (
        <div className="space-y-3">
          {announcements.map((a) => (
            <Card key={a.id} className={cn(a.isPinned && "border-brand/40")}>
              <CardContent className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-start gap-2.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                      <Megaphone className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        {a.isPinned && <Pin className="size-3 shrink-0 text-brand" />}
                        <p className="truncate font-medium">{a.title}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {a.author.name ?? "Admin"} · {timeAgo(a.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Badge variant={PRIORITY_VARIANT[a.priority]}>{a.priority}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => openEdit(a)}
                      aria-label="Edit announcement"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive hover:text-destructive"
                      onClick={() => setDeleting(a)}
                      aria-label="Delete announcement"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{a.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AnnouncementFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        announcement={editing}
        onSubmit={handleSubmit}
      />

      <DeleteConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this announcement?"
        description={`This will permanently delete "${deleting?.title}". This action cannot be undone.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
