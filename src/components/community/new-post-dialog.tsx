"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, VenetianMask } from "lucide-react";

import { forumPostSchema, type ForumPostInput } from "@/lib/validations/community";
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
import { CATEGORY_LABELS } from "@/components/community/forum-filter-bar";

export function NewPostDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ForumPostInput) => Promise<unknown>;
}) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<ForumPostInput>({
    resolver: zodResolver(forumPostSchema),
    defaultValues: {
      category: "GENERAL",
      title: "",
      body: "",
      isAnonymous: false,
    },
  });

  const isAnonymous = watch("isAnonymous");

  React.useEffect(() => {
    if (open) {
      reset({ category: "GENERAL", title: "", body: "", isAnonymous: false });
    }
  }, [open, reset]);

  async function handleFormSubmit(data: ForumPostInput) {
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
          <DialogTitle>Start a discussion</DialogTitle>
          <DialogDescription>
            Share something with the community.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
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
                    {Object.entries(CATEGORY_LABELS)
                      .filter(([value]) => value !== "all")
                      .map(([value, label]) => (
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
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="What's on your mind?"
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
              placeholder="Share more context..."
              className="min-h-28"
              aria-invalid={!!errors.body}
              {...register("body")}
            />
            {errors.body && (
              <p className="text-sm text-destructive">{errors.body.message}</p>
            )}
          </div>

          <Controller
            control={control}
            name="isAnonymous"
            render={({ field }) => (
              <button
                type="button"
                onClick={() => field.onChange(!field.value)}
                className={`flex w-full items-center justify-between gap-2 rounded-lg border p-3 text-left transition-colors ${
                  field.value ? "border-brand bg-brand/5" : ""
                }`}
              >
                <span className="flex items-center gap-2 text-sm">
                  <VenetianMask className="size-4 text-muted-foreground" />
                  Post anonymously
                </span>
                <span
                  className={`flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors ${
                    field.value ? "bg-brand justify-end" : "bg-muted justify-start"
                  }`}
                >
                  <span className="size-4 rounded-full bg-white shadow" />
                </span>
              </button>
            )}
          />
          {isAnonymous && (
            <p className="text-xs text-muted-foreground">
              Your name won&apos;t be shown on this post or its comments unless you choose to reveal it individually.
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="brand" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Post
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
