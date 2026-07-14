"use client";

import * as React from "react";
import { toast } from "sonner";
import type {
  TimetableSlotInput,
  UpdateTimetableSlotInput,
} from "@/lib/validations/attendance";

export interface TimetableSlot {
  id: string;
  userId: string;
  subjectId: string;
  dayOfWeek:
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY";
  startTime: string;
  endTime: string;
  room: string | null;
  type: "LECTURE" | "LAB" | "TUTORIAL" | "SEMINAR";
  subject: {
    id: string;
    name: string;
    color: string;
    code: string | null;
  };
}

export function useTimetable() {
  const [slots, setSlots] = React.useState<TimetableSlot[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/timetable");
      const json = await res.json();
      if (res.ok) setSlots(json.slots ?? []);
    } catch {
      toast.error("Failed to load timetable");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  async function createSlot(data: TimetableSlotInput) {
    const res = await fetch("/api/timetable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to add class");
      return null;
    }
    toast.success("Class added to timetable");
    await refresh();
    return json.slot as TimetableSlot;
  }

  async function updateSlot(id: string, data: UpdateTimetableSlotInput) {
    const res = await fetch(`/api/timetable/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to update class");
      return null;
    }
    toast.success("Class updated");
    await refresh();
    return json.slot as TimetableSlot;
  }

  async function deleteSlot(id: string) {
    const res = await fetch(`/api/timetable/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to delete class");
      return false;
    }
    toast.success("Class removed");
    await refresh();
    return true;
  }

  return { slots, isLoading, refresh, createSlot, updateSlot, deleteSlot };
}
