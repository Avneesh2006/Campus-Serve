"use client";

import * as React from "react";
import { toast } from "sonner";

export interface AttendanceRecord {
  id: string;
  userId: string;
  subjectId: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "CANCELLED";
  note: string | null;
  createdAt: string;
  updatedAt: string;
  subject: {
    id: string;
    name: string;
    color: string;
    code: string | null;
  };
}

export function useAttendanceRecords(params?: {
  subjectId?: string;
  from?: string;
  to?: string;
}) {
  const [records, setRecords] = React.useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const search = new URLSearchParams();
      if (params?.subjectId) search.set("subjectId", params.subjectId);
      if (params?.from) search.set("from", params.from);
      if (params?.to) search.set("to", params.to);

      const res = await fetch(`/api/attendance?${search.toString()}`);
      const json = await res.json();
      if (res.ok) setRecords(json.records ?? []);
    } catch {
      toast.error("Failed to load attendance history");
    } finally {
      setIsLoading(false);
    }
  }, [params?.subjectId, params?.from, params?.to]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  async function markAttendance(
    subjectId: string,
    date: string,
    status: "PRESENT" | "ABSENT" | "CANCELLED"
  ) {
    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjectId, date, status }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to mark attendance");
      return null;
    }
    await refresh();
    return json.record as AttendanceRecord;
  }

  async function markBulk(
    date: string,
    entries: { subjectId: string; status: "PRESENT" | "ABSENT" | "CANCELLED" }[]
  ) {
    const res = await fetch("/api/attendance/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, records: entries }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to save attendance");
      return false;
    }
    toast.success("Attendance saved");
    await refresh();
    return true;
  }

  async function deleteRecord(id: string) {
    const res = await fetch(`/api/attendance/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to delete record");
      return false;
    }
    toast.success("Record deleted");
    await refresh();
    return true;
  }

  return { records, isLoading, refresh, markAttendance, markBulk, deleteRecord };
}
