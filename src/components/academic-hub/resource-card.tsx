"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  Bookmark as BookmarkIcon,
  Eye,
  Trash2,
  User,
  FileType,
  Link as LinkIcon,
  Image as ImageIcon,
} from "lucide-react";
import { StarRatingDisplay } from "@/components/academic-hub/star-rating";
import { cn } from "@/lib/utils";
import type { Resource } from "@/hooks/use-resources";

const FILE_ICON = {
  PDF: FileText,
  DOC: FileType,
  IMAGE: ImageIcon,
  LINK: LinkIcon,
  OTHER: FileText,
};

function formatSize(kb: number | null) {
  if (!kb) return null;
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function ResourceCard({
  resource,
  currentUserId,
  onPreview,
  onDownload,
  onToggleBookmark,
  onDelete,
}: {
  resource: Resource;
  currentUserId?: string;
  onPreview: (resource: Resource) => void;
  onDownload: (resource: Resource) => void;
  onToggleBookmark: (resource: Resource) => void;
  onDelete?: (resource: Resource) => void;
}) {
  const FileIcon = FILE_ICON[resource.fileKind] ?? FileText;
  const isOwner = currentUserId && resource.uploader.id === currentUserId;
  const size = formatSize(resource.fileSizeKb);

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <FileIcon className="size-4.5" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium leading-snug">
                {resource.title}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {resource.subjectName}
                {resource.semester ? ` · Sem ${resource.semester}` : ""}
                {resource.author ? ` · by ${resource.author}` : ""}
                {resource.year ? ` · ${resource.year}` : ""}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            onClick={() => onToggleBookmark(resource)}
            aria-label={resource.isBookmarked ? "Remove bookmark" : "Bookmark"}
          >
            <BookmarkIcon
              className={cn(
                "size-4",
                resource.isBookmarked && "fill-brand text-brand"
              )}
            />
          </Button>
        </div>

        {resource.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {resource.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{resource.fileKind}</Badge>
          {size && <Badge variant="outline">{size}</Badge>}
          <Badge variant="secondary" className="gap-1">
            <Download className="size-3" />
            {resource.downloadCount}
          </Badge>
        </div>

        <div className="flex items-center justify-between gap-2">
          <StarRatingDisplay value={resource.avgRating} count={resource.ratingCount} />
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="size-3" />
            <span className="max-w-[100px] truncate">
              {resource.uploader.name ?? "Unknown"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onPreview(resource)}
          >
            <Eye className="size-3.5" />
            Preview
          </Button>
          <Button
            variant="brand"
            size="sm"
            className="flex-1"
            onClick={() => onDownload(resource)}
          >
            <Download className="size-3.5" />
            Download
          </Button>
          {isOwner && onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 text-destructive hover:text-destructive"
              onClick={() => onDelete(resource)}
              aria-label="Delete resource"
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
