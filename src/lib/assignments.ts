export type AssignmentPriority = "LOW" | "MEDIUM" | "HIGH";
export type AssignmentStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "COMPLETED"
  | "OVERDUE";

export function isOverdue(dueDate: string | Date, status: AssignmentStatus) {
  if (status === "COMPLETED" || status === "SUBMITTED") return false;
  return new Date(dueDate).getTime() < Date.now();
}

/** Returns the *effective* status, promoting PENDING/IN_PROGRESS to OVERDUE
 * once the due date has passed, without mutating the stored DB value. */
export function effectiveStatus(
  dueDate: string | Date,
  status: AssignmentStatus
): AssignmentStatus {
  if (isOverdue(dueDate, status)) return "OVERDUE";
  return status;
}

export function priorityWeight(priority: AssignmentPriority) {
  return priority === "HIGH" ? 3 : priority === "MEDIUM" ? 2 : 1;
}

export function priorityBadgeVariant(priority: AssignmentPriority) {
  if (priority === "HIGH") return "destructive" as const;
  if (priority === "MEDIUM") return "warning" as const;
  return "secondary" as const;
}

export function statusBadgeVariant(status: AssignmentStatus) {
  switch (status) {
    case "COMPLETED":
      return "success" as const;
    case "SUBMITTED":
      return "success" as const;
    case "IN_PROGRESS":
      return "warning" as const;
    case "OVERDUE":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

export function statusLabel(status: AssignmentStatus) {
  switch (status) {
    case "IN_PROGRESS":
      return "In Progress";
    default:
      return status.charAt(0) + status.slice(1).toLowerCase();
  }
}

export function daysUntil(dueDate: string | Date) {
  const diffMs = new Date(dueDate).setHours(23, 59, 59, 999) - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function formatDueLabel(dueDate: string | Date, status: AssignmentStatus) {
  const days = daysUntil(dueDate);
  const effective = effectiveStatus(dueDate, status);

  if (effective === "OVERDUE") {
    const overdueDays = Math.abs(days);
    return overdueDays === 0
      ? "Overdue today"
      : `${overdueDays}d overdue`;
  }
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days > 1) return `Due in ${days}d`;
  return "Due today";
}
