"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { hackathonSchema, type HackathonInput } from "@/lib/validations/career-hub";
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
import { MODE_LABELS } from "@/components/career-hub/internship-filter-bar";

export function NewHackathonDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: HackathonInput) => Promise<unknown>;
}) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<HackathonInput>({
    resolver: zodResolver(hackathonSchema),
    defaultValues: {
      title: "",
      organizer: "",
      mode: "ONSITE",
      location: "",
      prizePool: "",
      registerUrl: "",
      description: "",
      startsAt: "",
      endsAt: "",
      regDeadline: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        title: "",
        organizer: "",
        mode: "ONSITE",
        location: "",
        prizePool: "",
        registerUrl: "",
        description: "",
        startsAt: "",
        endsAt: "",
        regDeadline: "",
      });
    }
  }, [open, reset]);

  async function handleFormSubmit(data: HackathonInput) {
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
          <DialogTitle>Post a hackathon</DialogTitle>
          <DialogDescription>Share a hackathon or competition.</DialogDescription>
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
                placeholder="HackCampus 2026"
                aria-invalid={!!errors.title}
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="organizer">Organizer</Label>
              <Input
                id="organizer"
                placeholder="Tech Club"
                aria-invalid={!!errors.organizer}
                {...register("organizer")}
              />
              {errors.organizer && (
                <p className="text-sm text-destructive">{errors.organizer.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Theme, tracks, eligibility, etc."
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
            <div className="space-y-2">
              <Label htmlFor="prizePool">Prize pool (optional)</Label>
              <Input id="prizePool" placeholder="₹50,000 + goodies" {...register("prizePool")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location (optional)</Label>
            <Input id="location" placeholder="Auditorium, Block A" {...register("location")} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="startsAt">Starts</Label>
              <Input
                id="startsAt"
                type="date"
                aria-invalid={!!errors.startsAt}
                {...register("startsAt")}
              />
              {errors.startsAt && (
                <p className="text-xs text-destructive">{errors.startsAt.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endsAt">Ends (optional)</Label>
              <Input id="endsAt" type="date" {...register("endsAt")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="regDeadline">Reg. deadline</Label>
              <Input id="regDeadline" type="date" {...register("regDeadline")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="registerUrl">Registration link</Label>
            <Input
              id="registerUrl"
              placeholder="https://hackathon.dev/register"
              aria-invalid={!!errors.registerUrl}
              {...register("registerUrl")}
            />
            {errors.registerUrl && (
              <p className="text-sm text-destructive">{errors.registerUrl.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="brand" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Post hackathon
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
