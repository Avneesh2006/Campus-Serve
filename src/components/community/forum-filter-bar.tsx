"use client";

import { Search, ArrowUpDown, Bookmark as BookmarkIcon } from "lucide-react";
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

export interface ForumFilterState {
  q: string;
  category: string; // "all" | ForumCategory
  sort: "recent" | "popular";
  bookmarkedOnly: boolean;
}

export const defaultForumFilters: ForumFilterState = {
  q: "",
  category: "all",
  sort: "recent",
  bookmarkedOnly: false,
};

const CATEGORY_LABELS: Record<string, string> = {
  all: "All categories",
  GENERAL: "General",
  ACADEMICS: "Academics",
  CAREER: "Career",
  EVENTS: "Events",
  CONFESSIONS: "Confessions",
  TECH: "Tech",
  OFF_TOPIC: "Off Topic",
};

export function ForumFilterBar({
  filters,
  onChange,
}: {
  filters: ForumFilterState;
  onChange: (filters: ForumFilterState) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.q}
          onChange={(e) => onChange({ ...filters, q: e.target.value })}
          placeholder="Search discussions..."
          className="pl-8"
        />
      </div>

      <Select
        value={filters.category}
        onValueChange={(v) => onChange({ ...filters, category: v })}
      >
        <SelectTrigger className="sm:w-[160px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.sort}
        onValueChange={(v) => onChange({ ...filters, sort: v as ForumFilterState["sort"] })}
      >
        <SelectTrigger className="sm:w-[140px]">
          <ArrowUpDown className="size-3.5" />
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent">Most recent</SelectItem>
          <SelectItem value="popular">Most liked</SelectItem>
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

export { CATEGORY_LABELS };
