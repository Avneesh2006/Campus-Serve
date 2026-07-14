"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { internshipSchema, type InternshipInput } from "@/lib/validations/career-hub";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { INTERNSHIP_CATEGORY_LABELS, MODE_LABELS } from "@/components/career-hub/internship-filter-bar";

export function NewInternshipDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: InternshipInput) => Promise<unknown>;
}) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<InternshipInput>({
    resolver: zodResolver(internshipSchema),
    defaultValues: {
      title: "",
      company: "",
      category: "SOFTWARE_DEV",
      mode: "ONSITE",
      location: "",
      stipend: "",
      durationWeeks: undefined,
      applyUrl: "",
      description: "",
      deadline: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        title: "",
        company: "",
        category: "SOFTWARE_DEV",
        mode: "ONSITE",
        location: "",
        stipend: "",
        durationWeeks: undefined,
        applyUrl: "",
        description: "",
        deadline: "",
      });
    }
  }, [open, reset]);

  async function handleFormSubmit(data: InternshipInput) {
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Post an internship</DialogTitle>
          <DialogDescription>Share an opportunity with fellow students.</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="max-h-[70vh] space-y-4 overflow-y-auto pr-1"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Frontend Developer Intern"
                aria-invalid={!!errors.title}
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                placeholder="Acme Corp"
                aria-invalid={!!errors.company}
                {...register("company")}
              />
              {errors.company && (
                <p className="text-sm text-destructive">{errors.company.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Category</Label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(INTERNSHIP_CATEGORY_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Mode</Label>
              <Controller
                control={control}
                name="mode"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(MODE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Responsibilities, requirements, etc."
              className="min-h-24"
              aria-invalid={!!errors.description}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="location">Location (optional)</Label>
              <Input id="location" placeholder="Bangalore" {...register("location")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stipend">Stipend (optional)</Label>
              <Input id="stipend" placeholder="₹15,000/month" {...register("stipend")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="durationWeeks">Duration (weeks, optional)</Label>
              <Input
                id="durationWeeks"
                type="number"
                min={1}
                {...register("durationWeeks", {
                  setValueAs: (v) => (v === "" ? undefined : Number(v)),
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Application deadline (optional)</Label>
              <Input id="deadline" type="date" {...register("deadline")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="applyUrl">Application link</Label>
            <Input
              id="applyUrl"
              placeholder="https://company.com/careers/apply"
              aria-invalid={!!errors.applyUrl}
              {...register("applyUrl")}
            />
            {errors.applyUrl && (
              <p className="text-sm text-destructive">{errors.applyUrl.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="brand" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Post internship
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
