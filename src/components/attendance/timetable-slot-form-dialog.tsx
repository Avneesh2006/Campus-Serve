"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import {
  timetableSlotSchema,
  type TimetableSlotInput,
} from "@/lib/validations/attendance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Subject } from "@/hooks/use-subjects";
import type { TimetableSlot } from "@/hooks/use-timetable";

const DAYS: { value: TimetableSlotInput["dayOfWeek"]; label: string }[] = [
  { value: "MONDAY", label: "Monday" },
  { value: "TUESDAY", label: "Tuesday" },
  { value: "WEDNESDAY", label: "Wednesday" },
  { value: "THURSDAY", label: "Thursday" },
  { value: "FRIDAY", label: "Friday" },
  { value: "SATURDAY", label: "Saturday" },
  { value: "SUNDAY", label: "Sunday" },
];

const TYPES: { value: TimetableSlotInput["type"]; label: string }[] = [
  { value: "LECTURE", label: "Lecture" },
  { value: "LAB", label: "Lab" },
  { value: "TUTORIAL", label: "Tutorial" },
  { value: "SEMINAR", label: "Seminar" },
];

export function TimetableSlotFormDialog({
  open,
  onOpenChange,
  subjects,
  slot,
  defaultDay,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Subject[];
  slot?: TimetableSlot | null;
  defaultDay?: TimetableSlotInput["dayOfWeek"];
  onSubmit: (data: TimetableSlotInput) => Promise<unknown>;
}) {
  const isEdit = !!slot;
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TimetableSlotInput>({
    resolver: zodResolver(timetableSlotSchema),
    defaultValues: {
      subjectId: "",
      dayOfWeek: defaultDay ?? "MONDAY",
      startTime: "09:00",
      endTime: "10:00",
      room: "",
      type: "LECTURE",
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        subjectId: slot?.subjectId ?? subjects[0]?.id ?? "",
        dayOfWeek: slot?.dayOfWeek ?? defaultDay ?? "MONDAY",
        startTime: slot?.startTime ?? "09:00",
        endTime: slot?.endTime ?? "10:00",
        room: slot?.room ?? "",
        type: slot?.type ?? "LECTURE",
      });
    }
  }, [open, slot, defaultDay, subjects, reset]);

  async function handleFormSubmit(data: TimetableSlotInput) {
    setIsSubmitting(true);
    try {
      const result = await onSubmit(data);
      if (result !== null) onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit class" : "Add class"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this timetable slot."
              : "Add a recurring class to your weekly timetable."}
          </DialogDescription>
        </DialogHeader>

        {subjects.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Add a subject first before creating a timetable slot.
          </p>
        ) : (
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Controller
                control={control}
                name="subjectId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.subjectId && (
                <p className="text-sm text-destructive">
                  {errors.subjectId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Day</Label>
              <Controller
                control={control}
                name="dayOfWeek"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start time</Label>
                <Input
                  id="startTime"
                  type="time"
                  aria-invalid={!!errors.startTime}
                  {...register("startTime")}
                />
                {errors.startTime && (
                  <p className="text-sm text-destructive">
                    {errors.startTime.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End time</Label>
                <Input
                  id="endTime"
                  type="time"
                  aria-invalid={!!errors.endTime}
                  {...register("endTime")}
                />
                {errors.endTime && (
                  <p className="text-sm text-destructive">
                    {errors.endTime.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Session type</Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="room">Room (optional)</Label>
              <Input id="room" placeholder="Room 204" {...register("room")} />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="brand" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {isEdit ? "Save changes" : "Add class"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
