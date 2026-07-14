"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAssignments,
  type Assignment,
} from "@/hooks/use-assignments";
import {
  AssignmentFilterBar,
  defaultAssignmentFilters,
  type AssignmentFilterState,
} from "@/components/assignments/assignment-filter-bar";
import { AssignmentCard } from "@/components/assignments/assignment-card";
import { AssignmentFormDialog } from "@/components/assignments/assignment-form-dialog";
import { DeleteConfirmDialog } from "@/components/attendance/delete-confirm-dialog";
import type { AssignmentInput } from "@/lib/validations/assignments";

export function AssignmentDashboardTab() {
  const [filters, setFilters] = React.useState<AssignmentFilterState>(
    defaultAssignmentFilters
  );

  const {
    assignments,
    isLoading,
    createAssignment,
    updateAssignment,
    updateStatus,
    submitAssignment,
    deleteAssignment,
  } = useAssignments({
    status: filters.status !== "all" ? (filters.status as never) : undefined,
    priority: filters.priority !== "all" ? (filters.priority as never) : undefined,
    q: filters.q || undefined,
    sort: filters.sort,
  });

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Assignment | null>(null);
  const [deleting, setDeleting] = React.useState<Assignment | null>(null);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(assignment: Assignment) {
    setEditing(assignment);
    setFormOpen(true);
  }

  async function handleSubmitForm(data: AssignmentInput) {
    return editing ? await updateAssignment(editing.id, data) : await createAssignment(data);
  }

  async function handleDelete() {
    if (!deleting) return;
    await deleteAssignment(deleting.id);
    setDeleting(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <AssignmentFilterBar filters={filters} onChange={setFilters} />
        <Button variant="brand" className="shrink-0" onClick={openAdd}>
          <Plus className="size-4" />
          New assignment
        </Button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      )}

      {!isLoading && assignments.length === 0 && (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No assignments match these filters yet.
          </p>
          <Button variant="brand" size="sm" className="mt-4" onClick={openAdd}>
            <Plus className="size-4" />
            New assignment
          </Button>
        </div>
      )}

      {!isLoading && assignments.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              onEdit={openEdit}
              onDelete={setDeleting}
              onSubmit={(a) => submitAssignment(a.id)}
              onComplete={(a) => updateStatus(a.id, "COMPLETED")}
            />
          ))}
        </div>
      )}

      <AssignmentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        assignment={editing}
        onSubmit={handleSubmitForm}
      />

      <DeleteConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this assignment?"
        description={`This will permanently delete "${deleting?.title}" and its attachments. This action cannot be undone.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
