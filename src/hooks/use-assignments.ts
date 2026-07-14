"use client";

import * as React from "react";
import { toast } from "sonner";
import type { AssignmentInput, UpdateAssignmentInput } from "@/lib/validations/assignments";

export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type Status = "PENDING" | "IN_PROGRESS" | "SUBMITTED" | "COMPLETED" | "OVERDUE";
export type FileKind = "PDF" | "DOC" | "IMAGE" | "LINK" | "OTHER";

export interface Attachment {
  id: string;
  assignmentId: string;
  name: string;
  fileUrl: string;
  fileKind: FileKind;
  fileSizeKb: number | null;
  createdAt: string;
}

export interface Assignment {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  subjectName: string;
  dueDate: string;
  priority: Priority;
  status: Status;
  reminderAt: string | null;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  attachments: Attachment[];
  effectiveStatus: Status;
}

export interface AssignmentFilters {
  status?: Status;
  priority?: Priority;
  subject?: string;
  q?: string;
  from?: string;
  to?: string;
  sort?: "dueDate" | "priority" | "createdAt";
}

export function useAssignments(filters: AssignmentFilters = {}) {
  const [assignments, setAssignments] = React.useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const filterKey = JSON.stringify(filters);

  const refresh = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const search = new URLSearchParams();
      if (filters.status) search.set("status", filters.status);
      if (filters.priority) search.set("priority", filters.priority);
      if (filters.subject) search.set("subject", filters.subject);
      if (filters.q) search.set("q", filters.q);
      if (filters.from) search.set("from", filters.from);
      if (filters.to) search.set("to", filters.to);
      if (filters.sort) search.set("sort", filters.sort);

      const res = await fetch(`/api/assignments?${search.toString()}`);
      const json = await res.json();
      if (res.ok) setAssignments(json.assignments ?? []);
    } catch {
      toast.error("Failed to load assignments");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  async function createAssignment(data: AssignmentInput) {
    const res = await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to create assignment");
      return null;
    }
    toast.success("Assignment created");
    await refresh();
    return json.assignment as Assignment;
  }

  async function updateAssignment(id: string, data: UpdateAssignmentInput) {
    const res = await fetch(`/api/assignments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to update assignment");
      return null;
    }
    toast.success("Assignment updated");
    await refresh();
    return json.assignment as Assignment;
  }

  async function updateStatus(id: string, status: Status) {
    const res = await fetch(`/api/assignments/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to update status");
      return null;
    }
    toast.success("Status updated");
    await refresh();
    return json.assignment as Assignment;
  }

  async function submitAssignment(
    id: string,
    attachment?: { name: string; fileUrl: string; fileKind: FileKind; fileSizeKb?: number }
  ) {
    const res = await fetch(`/api/assignments/${id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(attachment ? { attachment } : {}),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to submit assignment");
      return null;
    }
    toast.success("Assignment marked as submitted");
    await refresh();
    return json.assignment as Assignment;
  }

  async function deleteAssignment(id: string) {
    const res = await fetch(`/api/assignments/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to delete assignment");
      return false;
    }
    toast.success("Assignment deleted");
    await refresh();
    return true;
  }

  async function deleteAttachment(assignmentId: string, attachmentId: string) {
    const res = await fetch(
      `/api/assignments/${assignmentId}/attachments/${attachmentId}`,
      { method: "DELETE" }
    );
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to remove attachment");
      return false;
    }
    toast.success("Attachment removed");
    await refresh();
    return true;
  }

  return {
    assignments,
    isLoading,
    refresh,
    createAssignment,
    updateAssignment,
    updateStatus,
    submitAssignment,
    deleteAssignment,
    deleteAttachment,
  };
}
