"use client";

import * as React from "react";
import { Plus, FileText, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useResumes, type Resume } from "@/hooks/use-resumes";
import { ResumeBuilderForm } from "@/components/career-hub/resume-builder-form";
import { DeleteConfirmDialog } from "@/components/attendance/delete-confirm-dialog";

const EMPTY_RESUME_DATA = {
  title: "My Resume",
  fullName: "",
  email: "",
  phone: "",
  location: "",
  summary: "",
  education: [],
  experience: [],
  projects: [],
  skills: [],
};

export function ResumeBuilderTab() {
  const { resumes, isLoading, createResume, updateResume, deleteResume } = useResumes();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [deleting, setDeleting] = React.useState<Resume | null>(null);

  React.useEffect(() => {
    if (!selectedId && resumes.length > 0) {
      setSelectedId(resumes[0].id);
    }
  }, [resumes, selectedId]);

  const selected = resumes.find((r) => r.id === selectedId) ?? null;

  async function handleCreate() {
    setIsCreating(true);
    try {
      const resume = await createResume(EMPTY_RESUME_DATA);
      if (resume) setSelectedId(resume.id);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleSave(data: Parameters<typeof updateResume>[1]) {
    if (!selected) return null;
    return updateResume(selected.id, data);
  }

  async function handleDelete() {
    if (!deleting) return;
    await deleteResume(deleting.id);
    if (selectedId === deleting.id) setSelectedId(null);
    setDeleting(null);
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Skeleton className="h-40 w-full lg:col-span-1" />
        <Skeleton className="h-96 w-full lg:col-span-3" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
      <div className="space-y-3 lg:col-span-1">
        <Button variant="brand" className="w-full" onClick={handleCreate} disabled={isCreating}>
          {isCreating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          New resume
        </Button>

        {resumes.length === 0 && (
          <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            Create your first resume to get started.
          </p>
        )}

        {resumes.map((resume) => (
          <Card
            key={resume.id}
            className={cn(
              "cursor-pointer transition-colors hover:bg-accent",
              selectedId === resume.id && "border-brand bg-brand/5"
            )}
            onClick={() => setSelectedId(resume.id)}
          >
            <CardContent className="flex items-center justify-between gap-2 p-3">
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <p className="truncate text-sm font-medium">{resume.title}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 shrink-0 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleting(resume);
                }}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="lg:col-span-3">
        {selected ? (
          <ResumeBuilderForm key={selected.id} resume={selected} onSave={handleSave} />
        ) : (
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground">
              Select or create a resume to start editing.
            </p>
          </div>
        )}
      </div>

      <DeleteConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this resume?"
        description={`This will permanently delete "${deleting?.title}". This action cannot be undone.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
