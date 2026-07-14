"use client";

import * as React from "react";
import { toast } from "sonner";

export interface ReportPost {
  id: string;
  title: string;
  category: string;
  isAnonymous: boolean;
  author: { id: string; name: string | null; email: string | null };
  commentCount: number;
  likeCount: number;
  createdAt: string;
}

export interface ReportListing {
  id: string;
  title: string;
  listingType: string;
  status: string;
  seller: { id: string; name: string | null; email: string };
  createdAt: string;
}

export interface ReportGuidance {
  id: string;
  title: string;
  isAnonymous: boolean;
  author: { id: string; name: string | null; email: string | null };
  isAnswered: boolean;
  createdAt: string;
}

export function useAdminReports() {
  const [recentPosts, setRecentPosts] = React.useState<ReportPost[]>([]);
  const [recentListings, setRecentListings] = React.useState<ReportListing[]>([]);
  const [recentGuidance, setRecentGuidance] = React.useState<ReportGuidance[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/reports");
      const json = await res.json();
      if (res.ok) {
        setRecentPosts(json.recentPosts ?? []);
        setRecentListings(json.recentListings ?? []);
        setRecentGuidance(json.recentGuidance ?? []);
      }
    } catch {
      toast.error("Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  return { recentPosts, recentListings, recentGuidance, isLoading, refresh };
}
