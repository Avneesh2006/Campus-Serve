"use client";

import * as React from "react";
import { toast } from "sonner";
import type { ListingInput } from "@/lib/validations/marketplace";

export type ListingType = "BUY_SELL" | "LOST_FOUND" | "ACADEMIC_ASSISTANCE";

export type ListingCategory =
  | "BOOKS_STUDY_MATERIAL"
  | "ELECTRONICS"
  | "FURNITURE"
  | "COSTUMES_ACCESSORIES"
  | "BICYCLES_VEHICLES"
  | "SPORTS_FITNESS"
  | "OTHER_ITEMS"
  | "LOST_ITEM"
  | "FOUND_ITEM"
  | "TUTORING"
  | "PROJECT_MENTORING"
  | "CAD_GUIDANCE"
  | "CODING_HELP"
  | "RESUME_REVIEW";

export type ListingCondition = "NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "WORN";
export type ListingStatus = "ACTIVE" | "RESERVED" | "SOLD" | "RESOLVED" | "EXPIRED";

export interface ListingImage {
  id: string;
  listingId: string;
  url: string;
  position: number;
}

export interface MarketplaceListing {
  id: string;
  sellerId: string;
  listingType: ListingType;
  category: ListingCategory;
  title: string;
  description: string;
  price: number | null;
  isNegotiable: boolean;
  condition: ListingCondition | null;
  location: string | null;
  contactPhone: string | null;
  status: ListingStatus;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  seller: { id: string; name: string | null; image: string | null; email: string };
  images: ListingImage[];
  isOwnListing: boolean;
}

export interface ListingFilters {
  type?: ListingType;
  category?: ListingCategory;
  status?: ListingStatus;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  mine?: boolean;
  sort?: "recent" | "priceLow" | "priceHigh";
}

export function useListings(filters: ListingFilters = {}) {
  const [listings, setListings] = React.useState<MarketplaceListing[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const filterKey = JSON.stringify(filters);

  const refresh = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const search = new URLSearchParams();
      if (filters.type) search.set("type", filters.type);
      if (filters.category) search.set("category", filters.category);
      if (filters.status) search.set("status", filters.status);
      if (filters.q) search.set("q", filters.q);
      if (filters.minPrice !== undefined) search.set("minPrice", String(filters.minPrice));
      if (filters.maxPrice !== undefined) search.set("maxPrice", String(filters.maxPrice));
      if (filters.mine) search.set("mine", "true");
      if (filters.sort) search.set("sort", filters.sort);

      const res = await fetch(`/api/marketplace/listings?${search.toString()}`);
      const json = await res.json();
      if (res.ok) setListings(json.listings ?? []);
    } catch {
      toast.error("Failed to load listings");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  async function createListing(data: ListingInput) {
    const res = await fetch("/api/marketplace/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to create listing");
      return null;
    }
    toast.success("Listing posted");
    await refresh();
    return json.listing as MarketplaceListing;
  }

  async function updateStatus(id: string, status: ListingStatus) {
    const res = await fetch(`/api/marketplace/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to update listing");
      return null;
    }
    toast.success("Listing updated");
    await refresh();
    return json.listing as MarketplaceListing;
  }

  async function deleteListing(id: string) {
    const res = await fetch(`/api/marketplace/listings/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to delete listing");
      return false;
    }
    toast.success("Listing deleted");
    await refresh();
    return true;
  }

  async function getContactInfo(id: string) {
    const res = await fetch(`/api/marketplace/listings/${id}/contact`);
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to load contact info");
      return null;
    }
    return json as {
      seller: { id: string; name: string | null; email: string; image: string | null };
      contactPhone: string | null;
      listingTitle: string;
    };
  }

  return {
    listings,
    isLoading,
    refresh,
    createListing,
    updateStatus,
    deleteListing,
    getContactInfo,
  };
}
