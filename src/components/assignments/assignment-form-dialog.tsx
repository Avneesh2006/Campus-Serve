"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UploadCloud, X } from "lucide-react";

import {
  assignmentSchema,
  type AssignmentInput,
  type AttachmentInput,
} from "@/lib/validations/assignments";
import type { Assignment } from "@/hooks/use-assignments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function toDateTimeLocal(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function toDateInput(iso?: string | null) {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 10);
}

export function AssignmentFormDialog({
  open,
  onOpenChange,
  assignment,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment?: Assignment | null;
  onSubmit: (data: AssignmentInput) => Promise<unknown>;
}) {
  const isEdit = !!assignment;
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [attachments, setAttachments] = React.useState<AttachmentInput[]>([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AssignmentInput>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: "",
      description: "",
      subjectName: "",
      dueDate: "",
      priority: "MEDIUM",
      status: "PENDING",
      reminderAt: "",
      attachments: [],
    },
  });

  React.useEffect(() => {
    if (open) {
      const initialAttachments: AttachmentInput[] =
        assignment?.attachments.map((a) => ({
          name: a.name,
          fileUrl: a.fileUrl,
          fileKind: a.fileKind,
          fileSizeKb: a.fileSizeKb,
        })) ?? [];
      setAttachments(initialAttachments);

      reset({
        title: assignment?.title ?? "",
        description: assignment?.description ?? "",
        subjectName: assignment?.subjectName ?? "",
        dueDate:
          toDateInput(assignment?.dueDate) || toDateInput(new Date().toISOString()),
        priority: assignment?.priority ?? "MEDIUM",
        status: assignment?.status ?? "PENDING",
        reminderAt: toDateTimeLocal(assignment?.reminderAt),
        attachments: initialAttachments,
      });
    }
  }, [open, assignment, reset]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // No cloud storage wired up yet, so we simulate the "uploaded" attachment
    // using a local object URL + its metadata, same convention as the
    // Academic Hub upload flow. In production this becomes a real upload.
    const objectUrl = URL.createObjectURL(file);
    const ext = file.name.split(".").pop()?.toLowerCase();
    const fileKind =
      ext === "pdf"
        ? "PDF"
        : ["doc", "docx"].includes(ext ?? "")
        ? "DOC"
        : ["png", "jpg", "jpeg", "webp", "gif"].includes(ext ?? "")
        ? "IMAGE"
        : "OTHER";

    setAttachments((prev) => [
      ...prev,
      {
        name: file.name,
        fileUrl: objectUrl,
        fileKind,
        fileSizeKb: Math.round(file.size / 1024),
      },
    ]);
    e.target.value = "";
  }

  function removeAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleFormSubmit(data: AssignmentInput) {
    setIsSubmitting(true);
    try {
      const result = await onSubmit({ ...data, attachments });
      if (result !== null) onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit assignment" : "New assignment"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details of this assignment."
              : "Add a new assignment to track."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="max-h-[70vh] space-y-4 overflow-y-auto pr-1"
        >
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="OS Scheduling Algorithms Report"
              aria-invalid={!!errors.title}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subjectName">Subject</Label>
            <Input
              id="subjectName"
              placeholder="Operating Systems"
              aria-invalid={!!errors.subjectName}
              {...register("subjectName")}
            />
            {errors.subjectName && (
              <p className="text-sm text-destructive">
                {errors.subjectName.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due date</Label>
              <Input
                id="dueDate"
                type="date"
                aria-invalid={!!errors.dueDate}
                {...register("dueDate")}
              />
              {errors.dueDate && (
                <p className="text-sm text-destructive">{errors.dueDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminderAt">Reminder (optional)</Label>
              <Input id="reminderAt" type="datetime-local" {...register("reminderAt")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="SUBMITTED">Submitted</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Any extra details or instructions..."
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <Label>Attachments</Label>
            <label
              htmlFor="assignment-file-upload"
              className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed p-5 text-center transition-colors hover:bg-accent"
            >
              <UploadCloud className="size-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Click to attach a file
              </span>
              <input
                id="assignment-file-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {attachments.length > 0 && (
              <ul className="space-y-1.5">
                {attachments.map((a, i) => (
                  <li
                    key={`${a.name}-${i}`}
                    className="flex items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-sm"
                  >
                    <span className="truncate">{a.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(i)}
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      aria-label="Remove attachment"
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="brand" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "Save changes" : "Create assignment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
