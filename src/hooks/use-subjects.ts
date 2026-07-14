"use client";

import * as React from "react";
import { toast } from "sonner";
import type { SubjectInput, UpdateSubjectInput } from "@/lib/validations/attendance";

export interface Subject {
  id: string;
  userId: string;
  name: string;
  code: string | null;
  color: string;
  targetPercent: number;
  createdAt: string;
  updatedAt: string;
}

export function useSubjects() {
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/subjects");
      const json = await res.json();
      if (res.ok) setSubjects(json.subjects ?? []);
    } catch {
      toast.error("Failed to load subjects");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  async function createSubject(data: SubjectInput) {
    const res = await fetch("/api/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to add subject");
      return null;
    }
    toast.success("Subject added");
    await refresh();
    return json.subject as Subject;
  }

  async function updateSubject(id: string, data: UpdateSubjectInput) {
    const res = await fetch(`/api/subjects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to update subject");
      return null;
    }
    toast.success("Subject updated");
    await refresh();
    return json.subject as Subject;
  }

  async function deleteSubject(id: string) {
    const res = await fetch(`/api/subjects/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to delete subject");
      return false;
    }
    toast.success("Subject deleted");
    await refresh();
    return true;
  }

  return {
    subjects,
    isLoading,
    refresh,
    createSubject,
    updateSubject,
    deleteSubject,
  };
}
