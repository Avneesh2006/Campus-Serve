"use client";

import { Search, Bookmark as BookmarkIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const INTERNSHIP_CATEGORY_LABELS: Record<string, string> = {
  SOFTWARE_DEV: "Software Development",
  DATA_SCIENCE: "Data Science",
  DESIGN: "Design",
  MARKETING: "Marketing",
  FINANCE: "Finance",
  CORE_ENGINEERING: "Core Engineering",
  RESEARCH: "Research",
  OTHER: "Other",
};

export const MODE_LABELS: Record<string, string> = {
  REMOTE: "Remote",
  ONSITE: "Onsite",
  HYBRID: "Hybrid",
};

export interface InternshipFilterState {
  q: string;
  category: string;
  mode: string;
  bookmarkedOnly: boolean;
}

export const defaultInternshipFilters: InternshipFilterState = {
  q: "",
  category: "all",
  mode: "all",
  bookmarkedOnly: false,
};

export function InternshipFilterBar({
  filters,
  onChange,
}: {
  filters: InternshipFilterState;
  onChange: (filters: InternshipFilterState) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.q}
          onChange={(e) => onChange({ ...filters, q: e.target.value })}
          placeholder="Search internships..."
          className="pl-8"
        />
      </div>

      <Select
        value={filters.category}
        onValueChange={(v) => onChange({ ...filters, category: v })}
      >
        <SelectTrigger className="sm:w-[190px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {Object.entries(INTERNSHIP_CATEGORY_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.mode} onValueChange={(v) => onChange({ ...filters, mode: v })}>
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

      <Button
        type="button"
        variant={filters.bookmarkedOnly ? "default" : "outline"}
        size="icon"
        className={cn(filters.bookmarkedOnly && "bg-brand text-brand-foreground")}
        onClick={() => onChange({ ...filters, bookmarkedOnly: !filters.bookmarkedOnly })}
        aria-label="Show bookmarked only"
        title="Show bookmarked only"
      >
        <BookmarkIcon className={cn("size-4", filters.bookmarkedOnly && "fill-current")} />
      </Button>
    </div>
  );
}
