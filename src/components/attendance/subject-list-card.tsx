"use client";

import * as React from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import { useSubjects, type Subject } from "@/hooks/use-subjects";
import { useAttendanceStats } from "@/hooks/use-attendance-stats";
import { statusToBadgeVariant } from "@/lib/attendance";
import { SubjectFormDialog } from "@/components/attendance/subject-form-dialog";
import { DeleteConfirmDialog } from "@/components/attendance/delete-confirm-dialog";

export function SubjectListCard() {
  const { subjects, isLoading, createSubject, updateSubject, deleteSubject } =
    useSubjects();
  const { data: stats, refresh: refreshStats } = useAttendanceStats();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingSubject, setEditingSubject] = React.useState<Subject | null>(null);
  const [deletingSubject, setDeletingSubject] = React.useState<Subject | null>(null);

  function openAdd() {
    setEditingSubject(null);
    setFormOpen(true);
  }

  function openEdit(subject: Subject) {
    setEditingSubject(subject);
    setFormOpen(true);
  }

  async function handleSubmit(data: Parameters<typeof createSubject>[0]) {
    const result = editingSubject
      ? await updateSubject(editingSubject.id, data)
      : await createSubject(data);
    if (result) await refreshStats();
    return result;
  }

  async function handleDelete() {
    if (!deletingSubject) return;
    await deleteSubject(deletingSubject.id);
    await refreshStats();
    setDeletingSubject(null);
  }

  const statsMap = new Map(
    (stats?.perSubject ?? []).map((s) => [s.subjectId, s])
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <BookOpen className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base">Your Subjects</CardTitle>
            <CardDescription>Manage the subjects you track</CardDescription>
          </div>
        </div>
        <CardAction>
          <Button size="sm" variant="brand" onClick={openAdd}>
            <Plus className="size-4" />
            Add subject
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && (
          <>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </>
        )}

        {!isLoading && subjects.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No subjects yet. Add your first subject to start tracking
              attendance.
            </p>
            <Button variant="brand" size="sm" className="mt-4" onClick={openAdd}>
              <Plus className="size-4" />
              Add subject
            </Button>
          </div>
        )}

        {!isLoading &&
          subjects.map((subject) => {
            const subjectStats = statsMap.get(subject.id);
            const percent = subjectStats?.percent ?? 0;

            return (
              <div key={subject.id} className="space-y-2 rounded-lg border p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: subject.color }}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {subject.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {subject.code || "No code"} · Target {subject.targetPercent}%
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {subjectStats && (
                      <Badge variant={statusToBadgeVariant(subjectStats.status)}>
                        {percent}%
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => openEdit(subject)}
                      aria-label="Edit subject"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive hover:text-destructive"
                      onClick={() => setDeletingSubject(subject)}
                      aria-label="Delete subject"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
                <Progress value={percent} />
              </div>
            );
          })}
      </CardContent>

      <SubjectFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        subject={editingSubject}
        onSubmit={handleSubmit}
      />

      <DeleteConfirmDialog
        open={!!deletingSubject}
        onOpenChange={(open) => !open && setDeletingSubject(null)}
        title="Delete subject?"
        description={`This will permanently delete "${deletingSubject?.name}" and all its attendance records. This action cannot be undone.`}
        onConfirm={handleDelete}
      />
    </Card>
  );
}
