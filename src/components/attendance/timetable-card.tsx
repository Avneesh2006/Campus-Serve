"use client";

import * as React from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList, Plus, Pencil, Trash2, MapPin } from "lucide-react";
import { useTimetable, type TimetableSlot } from "@/hooks/use-timetable";
import { useSubjects } from "@/hooks/use-subjects";
import { TimetableSlotFormDialog } from "@/components/attendance/timetable-slot-form-dialog";
import { DeleteConfirmDialog } from "@/components/attendance/delete-confirm-dialog";
import type { TimetableSlotInput } from "@/lib/validations/attendance";

const DAYS: { value: TimetableSlot["dayOfWeek"]; label: string; short: string }[] = [
  { value: "MONDAY", label: "Monday", short: "Mon" },
  { value: "TUESDAY", label: "Tuesday", short: "Tue" },
  { value: "WEDNESDAY", label: "Wednesday", short: "Wed" },
  { value: "THURSDAY", label: "Thursday", short: "Thu" },
  { value: "FRIDAY", label: "Friday", short: "Fri" },
  { value: "SATURDAY", label: "Saturday", short: "Sat" },
  { value: "SUNDAY", label: "Sunday", short: "Sun" },
];

export function TimetableCard() {
  const { slots, isLoading, createSlot, updateSlot, deleteSlot } = useTimetable();
  const { subjects } = useSubjects();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingSlot, setEditingSlot] = React.useState<TimetableSlot | null>(null);
  const [deletingSlot, setDeletingSlot] = React.useState<TimetableSlot | null>(null);
  const [activeDay, setActiveDay] = React.useState<TimetableSlot["dayOfWeek"]>(
    DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1].value
  );

  function openAdd() {
    setEditingSlot(null);
    setFormOpen(true);
  }

  function openEdit(slot: TimetableSlot) {
    setEditingSlot(slot);
    setFormOpen(true);
  }

  async function handleSubmit(data: TimetableSlotInput) {
    return editingSlot
      ? await updateSlot(editingSlot.id, data)
      : await createSlot(data);
  }

  async function handleDelete() {
    if (!deletingSlot) return;
    await deleteSlot(deletingSlot.id);
    setDeletingSlot(null);
  }

  const slotsForDay = slots
    .filter((s) => s.dayOfWeek === activeDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <ClipboardList className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base">Timetable</CardTitle>
            <CardDescription>Your weekly class schedule</CardDescription>
          </div>
        </div>
        <CardAction>
          <Button size="sm" variant="brand" onClick={openAdd}>
            <Plus className="size-4" />
            Add class
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-1 overflow-x-auto pb-1">
          {DAYS.map((day) => (
            <button
              key={day.value}
              onClick={() => setActiveDay(day.value)}
              className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeDay === day.value
                  ? "bg-brand text-brand-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {day.short}
            </button>
          ))}
        </div>

        {isLoading && (
          <>
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </>
        )}

        {!isLoading && slotsForDay.length === 0 && (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No classes scheduled for{" "}
            {DAYS.find((d) => d.value === activeDay)?.label}.
          </p>
        )}

        {!isLoading &&
          slotsForDay.map((slot) => (
            <div
              key={slot.id}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              <div className="w-24 shrink-0 text-sm font-medium text-muted-foreground">
                {slot.startTime}–{slot.endTime}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: slot.subject.color }}
                  />
                  <p className="truncate text-sm font-medium">
                    {slot.subject.name}
                  </p>
                </div>
                {slot.room && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3" />
                    {slot.room}
                  </p>
                )}
              </div>
              <Badge variant={slot.type === "LAB" ? "secondary" : "outline"}>
                {slot.type}
              </Badge>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => openEdit(slot)}
                  aria-label="Edit class"
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-destructive hover:text-destructive"
                  onClick={() => setDeletingSlot(slot)}
                  aria-label="Delete class"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
      </CardContent>

      <TimetableSlotFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        subjects={subjects}
        slot={editingSlot}
        defaultDay={activeDay}
        onSubmit={handleSubmit}
      />

      <DeleteConfirmDialog
        open={!!deletingSlot}
        onOpenChange={(open) => !open && setDeletingSlot(null)}
        title="Remove class?"
        description={`This will remove "${deletingSlot?.subject.name}" from your timetable.`}
        onConfirm={handleDelete}
      />
    </Card>
  );
}
