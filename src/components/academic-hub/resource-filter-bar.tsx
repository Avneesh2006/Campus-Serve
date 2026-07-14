"use client";

import { Search, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Bookmark as BookmarkIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ResourceFilterState {
  q: string;
  subject: string;
  semester: string; // "all" or number as string
  sort: "recent" | "rating" | "downloads";
  bookmarkedOnly: boolean;
}

export function ResourceFilterBar({
  filters,
  onChange,
  placeholder = "Search by title, subject, or author...",
}: {
  filters: ResourceFilterState;
  onChange: (filters: ResourceFilterState) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.q}
          onChange={(e) => onChange({ ...filters, q: e.target.value })}
          placeholder={placeholder}
          className="pl-8"
        />
      </div>

      <Input
        value={filters.subject}
        onChange={(e) => onChange({ ...filters, subject: e.target.value })}
        placeholder="Filter by subject"
        className="sm:w-[180px]"
      />

      <Select
        value={filters.semester}
        onValueChange={(v) => onChange({ ...filters, semester: v })}
      >
        <SelectTrigger className="sm:w-[130px]">
          <SelectValue placeholder="Semester" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All semesters</SelectItem>
          {Array.from({ length: 8 }, (_, i) => i + 1).map((s) => (
            <SelectItem key={s} value={String(s)}>
              Semester {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.sort}
        onValueChange={(v) =>
          onChange({ ...filters, sort: v as ResourceFilterState["sort"] })
        }
      >
        <SelectTrigger className="sm:w-[150px]">
          <ArrowUpDown className="size-3.5" />
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent">Most recent</SelectItem>
          <SelectItem value="rating">Top rated</SelectItem>
          <SelectItem value="downloads">Most downloaded</SelectItem>
        </SelectContent>
      </Select>

      <Button
        type="button"
        variant={filters.bookmarkedOnly ? "default" : "outline"}
        size="icon"
        className={cn(filters.bookmarkedOnly && "bg-brand text-brand-foreground")}
        onClick={() =>
          onChange({ ...filters, bookmarkedOnly: !filters.bookmarkedOnly })
        }
        aria-label="Show bookmarked only"
        title="Show bookmarked only"
      >
        <BookmarkIcon
          className={cn("size-4", filters.bookmarkedOnly && "fill-current")}
        />
      </Button>
    </div>
  );
}

export const defaultFilterState: ResourceFilterState = {
  q: "",
  subject: "",
  semester: "all",
  sort: "recent",
  bookmarkedOnly: false,
};
