"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useInternships, type Internship } from "@/hooks/use-internships";
import {
  InternshipFilterBar,
  defaultInternshipFilters,
  type InternshipFilterState,
} from "@/components/career-hub/internship-filter-bar";
import { InternshipCard } from "@/components/career-hub/internship-card";
import { NewInternshipDialog } from "@/components/career-hub/new-internship-dialog";
import { DeleteConfirmDialog } from "@/components/attendance/delete-confirm-dialog";

export function InternshipsTab() {
  const [filters, setFilters] = React.useState<InternshipFilterState>(defaultInternshipFilters);

  const { internships, isLoading, createInternship, deleteInternship, toggleBookmark } =
    useInternships({
      category: filters.category !== "all" ? (filters.category as never) : undefined,
      mode: filters.mode !== "all" ? (filters.mode as never) : undefined,
      q: filters.q || undefined,
      bookmarked: filters.bookmarkedOnly || undefined,
    });

  const [newOpen, setNewOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState<Internship | null>(null);

  async function handleDelete() {
    if (!deleting) return;
    await deleteInternship(deleting.id);
    setDeleting(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <InternshipFilterBar filters={filters} onChange={setFilters} />
        <Button variant="brand" className="shrink-0" onClick={() => setNewOpen(true)}>
          <Plus className="size-4" />
          Post internship
        </Button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      )}

      {!isLoading && internships.length === 0 && (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No internships match these filters yet.
          </p>
          <Button variant="brand" size="sm" className="mt-4" onClick={() => setNewOpen(true)}>
            <Plus className="size-4" />
            Post the first one
          </Button>
        </div>
      )}

      {!isLoading && internships.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {internships.map((internship) => (
            <InternshipCard
              key={internship.id}
              internship={internship}
              onToggleBookmark={(i) => toggleBookmark(i.id)}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      <NewInternshipDialog open={newOpen} onOpenChange={setNewOpen} onSubmit={createInternship} />

      <DeleteConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this internship?"
        description={`This will permanently delete "${deleting?.title}". This action cannot be undone.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
