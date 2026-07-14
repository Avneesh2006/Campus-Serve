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
import { useClubs } from "@/hooks/use-clubs";
import { ClubCard, CLUB_CATEGORY_LABELS } from "@/components/community/club-card";
import { NewClubDialog } from "@/components/community/new-club-dialog";

export function ClubsTab() {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const { clubs, isLoading, createClub, toggleJoin } = useClubs({
    q: query || undefined,
    category: category !== "all" ? (category as never) : undefined,
  });

  const [newOpen, setNewOpen] = React.useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search clubs..."
              className="pl-8"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="sm:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {Object.entries(CLUB_CATEGORY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="brand" className="shrink-0" onClick={() => setNewOpen(true)}>
          <Plus className="size-4" />
          New club
        </Button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      )}

      {!isLoading && clubs.length === 0 && (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">No clubs found.</p>
          <Button variant="brand" size="sm" className="mt-4" onClick={() => setNewOpen(true)}>
            <Plus className="size-4" />
            Create the first club
          </Button>
        </div>
      )}

      {!isLoading && clubs.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clubs.map((club) => (
            <ClubCard key={club.id} club={club} onToggleJoin={(c) => toggleJoin(c.id)} />
          ))}
        </div>
      )}

      <NewClubDialog open={newOpen} onOpenChange={setNewOpen} onSubmit={createClub} />
    </div>
  );
}
