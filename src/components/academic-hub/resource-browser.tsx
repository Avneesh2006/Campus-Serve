"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useResources, type Resource, type ResourceType } from "@/hooks/use-resources";
import {
  ResourceFilterBar,
  defaultFilterState,
  type ResourceFilterState,
} from "@/components/academic-hub/resource-filter-bar";
import { ResourceCard } from "@/components/academic-hub/resource-card";
import { ResourcePreviewDialog } from "@/components/academic-hub/resource-preview-dialog";
import { UploadResourceDialog } from "@/components/academic-hub/upload-resource-dialog";
import { DeleteConfirmDialog } from "@/components/attendance/delete-confirm-dialog";

export function ResourceBrowser({
  type,
  emptyMessage,
  uploadLabel,
}: {
  type: ResourceType;
  emptyMessage: string;
  uploadLabel: string;
}) {
  const { data: session } = useSession();
  const [filters, setFilters] = React.useState<ResourceFilterState>(defaultFilterState);

  const {
    resources,
    isLoading,
    uploadResource,
    deleteResource,
    toggleBookmark,
    downloadResource,
    rateResource,
    refresh,
  } = useResources({
    type,
    q: filters.q || undefined,
    subject: filters.subject || undefined,
    semester: filters.semester !== "all" ? Number(filters.semester) : undefined,
    bookmarked: filters.bookmarkedOnly || undefined,
    sort: filters.sort,
  });

  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [previewResource, setPreviewResource] = React.useState<Resource | null>(null);
  const [deletingResource, setDeletingResource] = React.useState<Resource | null>(null);

  async function handleDownload(resource: Resource) {
    const fileUrl = await downloadResource(resource.id);
    if (fileUrl) {
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    }
  }

  async function handleDelete() {
    if (!deletingResource) return;
    await deleteResource(deletingResource.id);
    setDeletingResource(null);
  }

  async function handleRate(resource: Resource, value: number, comment?: string) {
    const ok = await rateResource(resource.id, value, comment);
    if (ok) await refresh();
    return ok;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ResourceFilterBar filters={filters} onChange={setFilters} />
        <Button variant="brand" className="shrink-0" onClick={() => setUploadOpen(true)}>
          <Plus className="size-4" />
          {uploadLabel}
        </Button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full" />
          ))}
        </div>
      )}

      {!isLoading && resources.length === 0 && (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          <Button variant="brand" size="sm" className="mt-4" onClick={() => setUploadOpen(true)}>
            <Plus className="size-4" />
            {uploadLabel}
          </Button>
        </div>
      )}

      {!isLoading && resources.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              currentUserId={session?.user?.id}
              onPreview={setPreviewResource}
              onDownload={handleDownload}
              onToggleBookmark={(r) => toggleBookmark(r.id)}
              onDelete={setDeletingResource}
            />
          ))}
        </div>
      )}

      <UploadResourceDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        type={type}
        onSubmit={uploadResource}
      />

      <ResourcePreviewDialog
        resource={previewResource}
        open={!!previewResource}
        onOpenChange={(open) => !open && setPreviewResource(null)}
        onDownload={handleDownload}
        onRate={handleRate}
      />

      <DeleteConfirmDialog
        open={!!deletingResource}
        onOpenChange={(open) => !open && setDeletingResource(null)}
        title="Delete this resource?"
        description={`This will permanently delete "${deletingResource?.title}". This action cannot be undone.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
