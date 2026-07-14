"use client";

import * as React from "react";
import { UploadCloud, Loader2, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Assignment, FileKind } from "@/hooks/use-assignments";

export function SubmissionDialog({
  assignment,
  open,
  onOpenChange,
  onSubmit,
}: {
  assignment: Assignment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    id: string,
    attachment?: { name: string; fileUrl: string; fileKind: FileKind; fileSizeKb?: number }
  ) => Promise<unknown>;
}) {
  const [file, setFile] = React.useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) setFile(null);
  }, [open]);

  if (!assignment) return null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  }

  async function handleSubmit() {
    if (!assignment) return;
    setIsSubmitting(true);
    try {
      let attachment:
        | { name: string; fileUrl: string; fileKind: FileKind; fileSizeKb?: number }
        | undefined;

      if (file) {
        const ext = file.name.split(".").pop()?.toLowerCase();
        const fileKind: FileKind =
          ext === "pdf"
            ? "PDF"
            : ["doc", "docx"].includes(ext ?? "")
            ? "DOC"
            : ["png", "jpg", "jpeg", "webp", "gif"].includes(ext ?? "")
            ? "IMAGE"
            : "OTHER";

        attachment = {
          name: file.name,
          fileUrl: URL.createObjectURL(file),
          fileKind,
          fileSizeKb: Math.round(file.size / 1024),
        };
      }

      await onSubmit(assignment.id, attachment);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit assignment</DialogTitle>
          <DialogDescription>
            Mark &quot;{assignment.title}&quot; as submitted, optionally
            attaching your final file.
          </DialogDescription>
        </DialogHeader>

        <label
          htmlFor="submission-file-upload"
          className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed p-6 text-center transition-colors hover:bg-accent"
        >
          <UploadCloud className="size-6 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {file ? file.name : "Attach your submission file (optional)"}
          </span>
          <input
            id="submission-file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="brand" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Mark as submitted
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
