"use client";

import * as React from "react";
import { toast } from "sonner";
import type { ResumeInput, UpdateResumeInput } from "@/lib/validations/career-hub";

export interface ResumeEducationItem {
  school: string;
  degree: string;
  startYear?: string;
  endYear?: string;
  notes?: string;
}

export interface ResumeExperienceItem {
  company: string;
  role: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface ResumeProjectItem {
  name: string;
  description?: string;
  link?: string;
  techStack?: string;
}

export interface Resume {
  id: string;
  userId: string;
  title: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  summary: string | null;
  education: ResumeEducationItem[];
  experience: ResumeExperienceItem[];
  projects: ResumeProjectItem[];
  skills: string[];
  createdAt: string;
  updatedAt: string;
}

export function useResumes() {
  const [resumes, setResumes] = React.useState<Resume[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/resume");
      const json = await res.json();
      if (res.ok) setResumes(json.resumes ?? []);
    } catch {
      toast.error("Failed to load resumes");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  async function createResume(data: ResumeInput) {
    const res = await fetch("/api/resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to create resume");
      return null;
    }
    toast.success("Resume created");
    await refresh();
    return json.resume as Resume;
  }

  async function updateResume(id: string, data: UpdateResumeInput) {
    const res = await fetch(`/api/resume/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to save resume");
      return null;
    }
    await refresh();
    return json.resume as Resume;
  }

  async function deleteResume(id: string) {
    const res = await fetch(`/api/resume/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to delete resume");
      return false;
    }
    toast.success("Resume deleted");
    await refresh();
    return true;
  }

  return { resumes, isLoading, refresh, createResume, updateResume, deleteResume };
}
