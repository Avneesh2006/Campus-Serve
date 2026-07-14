"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Download, ExternalLink, Loader2 } from "lucide-react";
import { StarRatingDisplay, StarRatingInput } from "@/components/academic-hub/star-rating";
import type { Resource } from "@/hooks/use-resources";

export function ResourcePreviewDialog({
  resource,
  open,
  onOpenChange,
  onDownload,
  onRate,
}: {
  resource: Resource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (resource: Resource) => void;
  onRate: (resource: Resource, value: number, comment?: string) => Promise<boolean>;
}) {
  const [ratingValue, setRatingValue] = React.useState(0);
  const [comment, setComment] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setRatingValue(0);
      setComment("");
    }
  }, [open, resource?.id]);

  if (!resource) return null;

  const canEmbed =
    resource.fileKind === "PDF" ||
    resource.fileKind === "IMAGE" ||
    resource.fileKind === "LINK";

  async function handleSubmitRating() {
    if (!resource || ratingValue === 0) return;
    setIsSubmitting(true);
    try {
      await onRate(resource, ratingValue, comment);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{resource.title}</DialogTitle>
          <DialogDescription>
            {resource.subjectName}
            {resource.semester ? ` · Semester ${resource.semester}` : ""}
            {resource.author ? ` · by ${resource.author}` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {resource.description && (
            <p className="text-sm text-muted-foreground">
              {resource.description}
            </p>
          )}

          <div className="flex items-center gap-2">
            <Badge variant="outline">{resource.fileKind}</Badge>
            <StarRatingDisplay
              value={resource.avgRating}
              count={resource.ratingCount}
              size="md"
            />
          </div>

          <div className="overflow-hidden rounded-lg border bg-muted/30">
            {canEmbed ? (
              resource.fileKind === "IMAGE" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resource.fileUrl}
                  alt={resource.title}
                  className="h-64 w-full object-contain"
                />
              ) : (
                <iframe
                  src={resource.fileUrl}
                  title={resource.title}
                  className="h-72 w-full"
                />
              )
            ) : (
              <div className="flex h-40 flex-col items-center justify-center gap-2 p-6 text-center">
                <ExternalLink className="size-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Preview isn&apos;t available for this file type. Download to
                  view it.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2 rounded-lg border p-3">
            <p className="text-sm font-medium">Rate this resource</p>
            <StarRatingInput value={ratingValue} onChange={setRatingValue} />
            <Textarea
              placeholder="Add an optional comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-16"
            />
            <Button
              size="sm"
              variant="brand"
              disabled={ratingValue === 0 || isSubmitting}
              onClick={handleSubmitRating}
            >
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Submit rating
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button variant="brand" onClick={() => onDownload(resource)}>
            <Download className="size-4" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
