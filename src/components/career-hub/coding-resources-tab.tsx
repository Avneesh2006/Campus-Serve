"use client";

import * as React from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCodingResources, type CodingResource } from "@/hooks/use-coding-resources";
import {
  CodingResourceCard,
  CODING_CATEGORY_LABELS,
  DIFFICULTY_LABELS,
} from "@/components/career-hub/coding-resource-card";
import { NewCodingResourceDialog } from "@/components/career-hub/new-coding-resource-dialog";
import { ProgressTrackingCard } from "@/components/career-hub/progress-tracking-card";
import { DeleteConfirmDialog } from "@/components/attendance/delete-confirm-dialog";

export function CodingResourcesTab() {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const [difficulty, setDifficulty] = React.useState("all");

  const { resources, isLoading, createResource, deleteResource, toggleBookmark, updateProgress } =
    useCodingResources({
      q: query || undefined,
      category: category !== "all" ? (category as never) : undefined,
      difficulty: difficulty !== "all" ? (difficulty as never) : undefined,
    });

  const [newOpen, setNewOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState<CodingResource | null>(null);

  async function handleDelete() {
    if (!deleting) return;
    await deleteResource(deleting.id);
    setDeleting(null);
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search resources..."
                className="pl-8"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="sm:w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {Object.entries(CODING_CATEGORY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="sm:w-[150px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All levels</SelectItem>
                {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="brand" className="shrink-0" onClick={() => setNewOpen(true)}>
            <Plus className="size-4" />
            Add resource
          </Button>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-52 w-full" />
            ))}
          </div>
        )}

        {!isLoading && resources.length === 0 && (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-sm text-muted-foreground">No resources found.</p>
            <Button variant="brand" size="sm" className="mt-4" onClick={() => setNewOpen(true)}>
              <Plus className="size-4" />
              Add the first one
            </Button>
          </div>
        )}

        {!isLoading && resources.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {resources.map((resource) => (
              <CodingResourceCard
                key={resource.id}
                resource={resource}
                onToggleBookmark={(r) => toggleBookmark(r.id)}
                onUpdateProgress={(r, status) => updateProgress(r.id, status)}
                onDelete={setDeleting}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <ProgressTrackingCard />
      </div>

      <NewCodingResourceDialog open={newOpen} onOpenChange={setNewOpen} onSubmit={createResource} />

      <DeleteConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this resource?"
        description={`This will permanently delete "${deleting?.title}". This action cannot be undone.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
