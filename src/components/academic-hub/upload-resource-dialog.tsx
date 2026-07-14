"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UploadCloud } from "lucide-react";

import { resourceSchema, type ResourceInput } from "@/lib/validations/academic-hub";
import type { ResourceType } from "@/hooks/use-resources";
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

const TYPE_LABEL: Record<ResourceType, string> = {
  NOTE: "note",
  PYQ: "previous year paper",
  BOOK: "book",
  RESOURCE: "resource",
};

export function UploadResourceDialog({
  open,
  onOpenChange,
  type,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: ResourceType;
  onSubmit: (data: ResourceInput) => Promise<unknown>;
}) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ResourceInput>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      type,
      title: "",
      description: "",
      subjectName: "",
      semester: undefined,
      author: "",
      year: undefined,
      fileUrl: "",
      fileKind: "PDF",
      fileSizeKb: undefined,
    },
  });

  React.useEffect(() => {
    if (open) {
      setSelectedFile(null);
      reset({
        type,
        title: "",
        description: "",
        subjectName: "",
        semester: undefined,
        author: "",
        year: undefined,
        fileUrl: "",
        fileKind: "PDF",
        fileSizeKb: undefined,
      });
    }
  }, [open, type, reset]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);

    // No real object storage is wired up yet, so we simulate the "uploaded"
    // file with a local object URL + its metadata. In production this would
    // be replaced by an actual upload to S3/Cloud storage, setting fileUrl
    // to the returned public URL.
    const objectUrl = URL.createObjectURL(file);
    setValue("fileUrl", objectUrl, { shouldValidate: true });
    setValue("fileSizeKb", Math.round(file.size / 1024));

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "pdf") setValue("fileKind", "PDF");
    else if (["doc", "docx"].includes(ext ?? "")) setValue("fileKind", "DOC");
    else if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext ?? ""))
      setValue("fileKind", "IMAGE");
    else setValue("fileKind", "OTHER");
  }

  function handleLinkChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value) {
      setValue("fileKind", "LINK");
      setSelectedFile(null);
    }
  }

  async function handleFormSubmit(data: ResourceInput) {
    setIsSubmitting(true);
    try {
      const result = await onSubmit(data);
      if (result !== null) onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  const showAuthor = type === "BOOK";
  const showYear = type === "PYQ";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload {TYPE_LABEL[type]}</DialogTitle>
          <DialogDescription>
            Share this {TYPE_LABEL[type]} with other students.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="max-h-[70vh] space-y-4 overflow-y-auto pr-1"
        >
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder={
                type === "PYQ"
                  ? "Mid-Semester Exam 2024"
                  : type === "BOOK"
                  ? "Introduction to Algorithms"
                  : "Binary Trees & Traversals"
              }
              aria-invalid={!!errors.title}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subjectName">Subject</Label>
            <Input
              id="subjectName"
              placeholder="Data Structures"
              aria-invalid={!!errors.subjectName}
              {...register("subjectName")}
            />
            {errors.subjectName && (
              <p className="text-sm text-destructive">
                {errors.subjectName.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="semester">Semester (optional)</Label>
              <Input
                id="semester"
                type="number"
                min={1}
                max={12}
                {...register("semester", {
                  setValueAs: (v) => (v === "" ? undefined : Number(v)),
                })}
              />
            </div>

            {showAuthor && (
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input id="author" placeholder="Thomas H. Cormen" {...register("author")} />
              </div>
            )}

            {showYear && (
              <div className="space-y-2">
                <Label htmlFor="year">Exam year</Label>
                <Input
                  id="year"
                  type="number"
                  min={1990}
                  max={new Date().getFullYear() + 1}
                  {...register("year", {
                    setValueAs: (v) => (v === "" ? undefined : Number(v)),
                  })}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="A short description to help others find this..."
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <Label>File</Label>
            <label
              htmlFor="file-upload"
              className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed p-6 text-center transition-colors hover:bg-accent"
            >
              <UploadCloud className="size-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {selectedFile
                  ? selectedFile.name
                  : "Click to choose a file (PDF, DOC, image)"}
              </span>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                onChange={handleFileChange}
              />
            </label>
            {errors.fileUrl && (
              <p className="text-sm text-destructive">{errors.fileUrl.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fileUrl">Or paste a link instead</Label>
            <Input
              id="fileUrl"
              placeholder="https://drive.google.com/..."
              {...register("fileUrl", { onChange: handleLinkChange })}
            />
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
              Upload
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
