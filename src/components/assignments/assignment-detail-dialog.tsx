"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Paperclip,
  Download,
  Send,
  CheckCircle2,
  Pencil,
  Clock,
  FileText,
} from "lucide-react";
import {
  priorityBadgeVariant,
  statusBadgeVariant,
  statusLabel,
  formatDueLabel,
} from "@/lib/assignments";
import type { Assignment } from "@/hooks/use-assignments";

export function AssignmentDetailDialog({
  assignment,
  open,
  onOpenChange,
  onEdit,
  onSubmit,
  onComplete,
}: {
  assignment: Assignment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (a: Assignment) => void;
  onSubmit: (a: Assignment) => void;
  onComplete: (a: Assignment) => void;
}) {
  if (!assignment) return null;

  const isDone =
    assignment.effectiveStatus === "COMPLETED" ||
    assignment.effectiveStatus === "SUBMITTED";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{assignment.title}</DialogTitle>
          <DialogDescription>{assignment.subjectName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={priorityBadgeVariant(assignment.priority)}>
              {assignment.priority.charAt(0) + assignment.priority.slice(1).toLowerCase()}{" "}
              priority
            </Badge>
            <Badge variant={statusBadgeVariant(assignment.effectiveStatus)}>
              {statusLabel(assignment.effectiveStatus)}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Clock className="size-3" />
              {formatDueLabel(assignment.dueDate, assignment.status)}
            </Badge>
          </div>

          {assignment.description && (
            <p className="text-sm text-muted-foreground">
              {assignment.description}
            </p>
          )}

          <div className="space-y-2">
            <p className="flex items-center gap-1.5 text-sm font-medium">
              <Paperclip className="size-3.5" />
              Attachments ({assignment.attachments.length})
            </p>
            {assignment.attachments.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No attachments added.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {assignment.attachments.map((att) => (
                  <li
                    key={att.id}
                    className="flex items-center justify-between gap-2 rounded-md border p-2 text-sm"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <FileText className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">{att.name}</span>
                    </span>
                    <a
                      href={att.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-muted-foreground hover:text-foreground"
                      aria-label="Download attachment"
                    >
                      <Download className="size-3.5" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <DialogFooter className="flex-wrap">
          <Button variant="outline" onClick={() => onEdit(assignment)}>
            <Pencil className="size-3.5" />
            Edit
          </Button>
          {!isDone && (
            <>
              <Button variant="outline" onClick={() => onSubmit(assignment)}>
                <Send className="size-3.5" />
                Submit
              </Button>
              <Button variant="brand" onClick={() => onComplete(assignment)}>
                <CheckCircle2 className="size-3.5" />
                Complete
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
