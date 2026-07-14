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
import { useHackathons, type Hackathon } from "@/hooks/use-hackathons";
import { HackathonCard } from "@/components/career-hub/hackathon-card";
import { NewHackathonDialog } from "@/components/career-hub/new-hackathon-dialog";
import { DeleteConfirmDialog } from "@/components/attendance/delete-confirm-dialog";
import { MODE_LABELS } from "@/components/career-hub/internship-filter-bar";

export function HackathonsTab() {
  const [query, setQuery] = React.useState("");
  const [mode, setMode] = React.useState("all");
  const { hackathons, isLoading, createHackathon, deleteHackathon, toggleBookmark } =
    useHackathons({
      q: query || undefined,
      mode: mode !== "all" ? (mode as never) : undefined,
      upcoming: true,
    });

  const [newOpen, setNewOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState<Hackathon | null>(null);

  async function handleDelete() {
    if (!deleting) return;
    await deleteHackathon(deleting.id);
    setDeleting(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search hackathons..."
              className="pl-8"
            />
          </div>
          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger className="sm:w-[140px]">
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All modes</SelectItem>
              {Object.entries(MODE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="brand" className="shrink-0" onClick={() => setNewOpen(true)}>
          <Plus className="size-4" />
          Post hackathon
        </Button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-60 w-full" />
          ))}
        </div>
      )}

      {!isLoading && hackathons.length === 0 && (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">No upcoming hackathons found.</p>
          <Button variant="brand" size="sm" className="mt-4" onClick={() => setNewOpen(true)}>
            <Plus className="size-4" />
            Post the first one
          </Button>
        </div>
      )}

      {!isLoading && hackathons.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hackathons.map((hackathon) => (
            <HackathonCard
              key={hackathon.id}
              hackathon={hackathon}
              onToggleBookmark={(h) => toggleBookmark(h.id)}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      <NewHackathonDialog open={newOpen} onOpenChange={setNewOpen} onSubmit={createHackathon} />

      <DeleteConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this hackathon?"
        description={`This will permanently delete "${deleting?.title}". This action cannot be undone.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
