"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AssignmentOverviewStats,
  AssignmentDashboardTab,
  AssignmentCalendarTab,
  AssignmentRemindersTab,
  AssignmentDetailDialog,
  AssignmentFormDialog,
  SubmissionDialog,
} from "@/components/assignments";
import { useAssignments, type Assignment } from "@/hooks/use-assignments";
import type { AssignmentInput } from "@/lib/validations/assignments";

export default function AssignmentsPage() {
  const { updateAssignment, updateStatus, submitAssignment, refresh } =
    useAssignments();

  const [selected, setSelected] = React.useState<Assignment | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [submitOpen, setSubmitOpen] = React.useState(false);

  function handleSelectFromCalendar(a: Assignment) {
    setSelected(a);
    setDetailOpen(true);
  }

  function openEditFromDetail(a: Assignment) {
    setSelected(a);
    setDetailOpen(false);
    setEditOpen(true);
  }

  function openSubmitFromDetail(a: Assignment) {
    setSelected(a);
    setDetailOpen(false);
    setSubmitOpen(true);
  }

  async function handleComplete(a: Assignment) {
    await updateStatus(a.id, "COMPLETED");
    setDetailOpen(false);
    await refresh();
  }

  async function handleEditSubmit(data: AssignmentInput) {
    if (!selected) return null;
    const result = await updateAssignment(selected.id, data);
    await refresh();
    return result;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Assignments</h1>
        <p className="text-muted-foreground">
          Track, schedule, and submit your assignments in one place.
        </p>
      </div>

      <AssignmentOverviewStats />

      <Tabs defaultValue="dashboard">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-4">
          <AssignmentDashboardTab />
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <AssignmentCalendarTab onSelectAssignment={handleSelectFromCalendar} />
        </TabsContent>

        <TabsContent value="reminders" className="mt-4">
          <AssignmentRemindersTab />
        </TabsContent>
      </Tabs>

      <AssignmentDetailDialog
        assignment={selected}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={openEditFromDetail}
        onSubmit={openSubmitFromDetail}
        onComplete={handleComplete}
      />

      <AssignmentFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        assignment={selected}
        onSubmit={handleEditSubmit}
      />

      <SubmissionDialog
        assignment={selected}
        open={submitOpen}
        onOpenChange={setSubmitOpen}
        onSubmit={async (id, attachment) => {
          const result = await submitAssignment(id, attachment);
          await refresh();
          return result;
        }}
      />
    </div>
  );
}
