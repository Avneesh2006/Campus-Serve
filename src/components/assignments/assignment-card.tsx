"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Paperclip,
  Pencil,
  Trash2,
  CheckCircle2,
  Send,
  Clock,
} from "lucide-react";
import {
  priorityBadgeVariant,
  statusBadgeVariant,
  statusLabel,
  formatDueLabel,
} from "@/lib/assignments";
import type { Assignment } from "@/hooks/use-assignments";
import { cn } from "@/lib/utils";

export function AssignmentCard({
  assignment,
  onEdit,
  onDelete,
  onSubmit,
  onComplete,
}: {
  assignment: Assignment;
  onEdit: (a: Assignment) => void;
  onDelete: (a: Assignment) => void;
  onSubmit: (a: Assignment) => void;
  onComplete: (a: Assignment) => void;
}) {
  const isDone =
    assignment.effectiveStatus === "COMPLETED" ||
    assignment.effectiveStatus === "SUBMITTED";
  const isOverdue = assignment.effectiveStatus === "OVERDUE";

  return (
    <Card className={cn(isOverdue && "border-destructive/40")}>
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium leading-snug">{assignment.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {assignment.subjectName}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => onEdit(assignment)}
              aria-label="Edit assignment"
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-destructive hover:text-destructive"
              onClick={() => onDelete(assignment)}
              aria-label="Delete assignment"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>

        {assignment.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {assignment.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={priorityBadgeVariant(assignment.priority)}>
            {assignment.priority.charAt(0) + assignment.priority.slice(1).toLowerCase()}{" "}
            priority
          </Badge>
          <Badge variant={statusBadgeVariant(assignment.effectiveStatus)}>
            {statusLabel(assignment.effectiveStatus)}
          </Badge>
          {assignment.attachments.length > 0 && (
            <Badge variant="outline" className="gap-1">
              <Paperclip className="size-3" />
              {assignment.attachments.length}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              isOverdue ? "text-destructive" : "text-muted-foreground"
            )}
          >
            <Clock className="size-3" />
            {formatDueLabel(assignment.dueDate, assignment.status)}
          </span>

          {!isDone && (
            <div className="flex gap-1.5">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSubmit(assignment)}
              >
                <Send className="size-3.5" />
                Submit
              </Button>
              <Button size="sm" variant="brand" onClick={() => onComplete(assignment)}>
                <CheckCircle2 className="size-3.5" />
                Complete
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
