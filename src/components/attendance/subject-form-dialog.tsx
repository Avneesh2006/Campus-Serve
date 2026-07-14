"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { subjectSchema, type SubjectInput } from "@/lib/validations/attendance";
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
import type { Subject } from "@/hooks/use-subjects";

const SWATCHES = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
];

export function SubjectFormDialog({
  open,
  onOpenChange,
  subject,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject?: Subject | null;
  onSubmit: (data: SubjectInput) => Promise<unknown>;
}) {
  const isEdit = !!subject;
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SubjectInput>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: "",
      code: "",
      color: SWATCHES[0],
      targetPercent: 75,
    },
  });

  const selectedColor = watch("color");

  React.useEffect(() => {
    if (open) {
      reset({
        name: subject?.name ?? "",
        code: subject?.code ?? "",
        color: subject?.color ?? SWATCHES[0],
        targetPercent: subject?.targetPercent ?? 75,
      });
    }
  }, [open, subject, reset]);

  async function handleFormSubmit(data: SubjectInput) {
    setIsSubmitting(true);
    try {
      const result = await onSubmit(data);
      if (result !== null) {
        onOpenChange(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit subject" : "Add subject"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details for this subject."
              : "Add a subject to start tracking its attendance."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Subject name</Label>
            <Input
              id="name"
              placeholder="Data Structures"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Subject code (optional)</Label>
            <Input id="code" placeholder="CS201" {...register("code")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetPercent">Target attendance %</Label>
            <Input
              id="targetPercent"
              type="number"
              min={1}
              max={100}
              aria-invalid={!!errors.targetPercent}
              {...register("targetPercent", { valueAsNumber: true })}
            />
            {errors.targetPercent && (
              <p className="text-sm text-destructive">
                {errors.targetPercent.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {SWATCHES.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => setValue("color", swatch, { shouldValidate: true })}
                  className="flex size-7 items-center justify-center rounded-full ring-offset-2 ring-offset-background transition-all"
                  style={{
                    backgroundColor: swatch,
                    boxShadow:
                      selectedColor === swatch
                        ? `0 0 0 2px ${swatch}`
                        : undefined,
                  }}
                  aria-label={`Select color ${swatch}`}
                >
                  {selectedColor === swatch && (
                    <span className="size-2 rounded-full bg-white" />
                  )}
                </button>
              ))}
            </div>
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
              {isEdit ? "Save changes" : "Add subject"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
