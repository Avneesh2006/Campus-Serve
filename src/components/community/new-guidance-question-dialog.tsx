"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, VenetianMask, X } from "lucide-react";

import {
  seniorGuidanceSchema,
  type SeniorGuidanceInput,
} from "@/lib/validations/community";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function NewGuidanceQuestionDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SeniorGuidanceInput) => Promise<unknown>;
}) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [tagInput, setTagInput] = React.useState("");
  const [tags, setTags] = React.useState<string[]>([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<SeniorGuidanceInput>({
    resolver: zodResolver(seniorGuidanceSchema),
    defaultValues: { title: "", body: "", tags: [], isAnonymous: false },
  });

  const isAnonymous = watch("isAnonymous");

  React.useEffect(() => {
    if (open) {
      setTags([]);
      setTagInput("");
      reset({ title: "", body: "", tags: [], isAnonymous: false });
    }
  }, [open, reset]);

  function addTag() {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  async function handleFormSubmit(data: SeniorGuidanceInput) {
    setIsSubmitting(true);
    try {
      const result = await onSubmit({ ...data, tags });
      if (result !== null) onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ask for guidance</DialogTitle>
          <DialogDescription>
            Get advice from seniors who&apos;ve been through it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Question title</Label>
            <Input
              id="title"
              placeholder="How do I prepare for placements?"
              aria-invalid={!!errors.title}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Details</Label>
            <Textarea
              id="body"
              placeholder="Give some context about your situation..."
              className="min-h-28"
              aria-invalid={!!errors.body}
              {...register("body")}
            />
            {errors.body && (
              <p className="text-sm text-destructive">{errors.body.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="e.g. placements, internships"
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)}>
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Controller
            control={control}
            name="isAnonymous"
            render={({ field }) => (
              <button
                type="button"
                onClick={() => field.onChange(!field.value)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-lg border p-3 text-left transition-colors",
                  field.value && "border-brand bg-brand/5"
                )}
              >
                <span className="flex items-center gap-2 text-sm">
                  <VenetianMask className="size-4 text-muted-foreground" />
                  Ask anonymously
                </span>
                <span
                  className={cn(
                    "flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors",
                    field.value ? "bg-brand justify-end" : "bg-muted justify-start"
                  )}
                >
                  <span className="size-4 rounded-full bg-white shadow" />
                </span>
              </button>
            )}
          />
          {isAnonymous && (
            <p className="text-xs text-muted-foreground">
              Your name will be hidden on this question.
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="brand" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Post question
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
