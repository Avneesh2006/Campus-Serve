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
import type { ListingType } from "@/hooks/use-listings";

export const CATEGORY_LABELS: Record<string, string> = {
  BOOKS_STUDY_MATERIAL: "Books & Study Material",
  ELECTRONICS: "Electronics",
  FURNITURE: "Furniture",
  COSTUMES_ACCESSORIES: "Costumes & Accessories",
  BICYCLES_VEHICLES: "Bicycles & Vehicles",
  SPORTS_FITNESS: "Sports & Fitness",
  OTHER_ITEMS: "Other",
  LOST_ITEM: "Lost Item",
  FOUND_ITEM: "Found Item",
  TUTORING: "Tutoring",
  PROJECT_MENTORING: "Project Mentoring",
  CAD_GUIDANCE: "CAD Guidance",
  CODING_HELP: "Coding Help",
  RESUME_REVIEW: "Resume Review",
};

export const CATEGORIES_BY_TYPE: Record<ListingType, string[]> = {
  BUY_SELL: [
    "BOOKS_STUDY_MATERIAL",
    "ELECTRONICS",
    "FURNITURE",
    "COSTUMES_ACCESSORIES",
    "BICYCLES_VEHICLES",
    "SPORTS_FITNESS",
    "OTHER_ITEMS",
  ],
  LOST_FOUND: ["LOST_ITEM", "FOUND_ITEM"],
  ACADEMIC_ASSISTANCE: [
    "TUTORING",
    "PROJECT_MENTORING",
    "CAD_GUIDANCE",
    "CODING_HELP",
    "RESUME_REVIEW",
  ],
};

export interface ListingFilterState {
  q: string;
  category: string; // "all" | ListingCategory
  sort: "recent" | "priceLow" | "priceHigh";
}

export const defaultListingFilters: ListingFilterState = {
  q: "",
  category: "all",
  sort: "recent",
};

export function ListingFilterBar({
  filters,
  onChange,
  listingType,
  showPriceSort = true,
}: {
  filters: ListingFilterState;
  onChange: (filters: ListingFilterState) => void;
  listingType: ListingType;
  showPriceSort?: boolean;
}) {
  const categories = CATEGORIES_BY_TYPE[listingType];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.q}
          onChange={(e) => onChange({ ...filters, q: e.target.value })}
          placeholder="Search listings..."
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
          {categories.map((c) => (
            <SelectItem key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showPriceSort && (
        <Select
          value={filters.sort}
          onValueChange={(v) =>
            onChange({ ...filters, sort: v as ListingFilterState["sort"] })
          }
        >
          <SelectTrigger className="sm:w-[150px]">
            <ArrowUpDown className="size-3.5" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most recent</SelectItem>
            <SelectItem value="priceLow">Price: low to high</SelectItem>
            <SelectItem value="priceHigh">Price: high to low</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
