"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, ShoppingBag, HelpCircle } from "lucide-react";
import { useAdminReports } from "@/hooks/use-admin-reports";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHrs < 1) return "Just now";
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

export function ReportsTab() {
  const { recentPosts, recentListings, recentGuidance, isLoading } = useAdminReports();

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <MessageSquare className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base">Recent Forum Posts</CardTitle>
              <CardDescription>Latest community discussions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading && <Skeleton className="h-32 w-full" />}
          {!isLoading && recentPosts.length === 0 && (
            <p className="text-sm text-muted-foreground">No posts yet.</p>
          )}
          {!isLoading &&
            recentPosts.map((post) => (
              <div key={post.id} className="rounded-lg border p-2.5 text-sm">
                <p className="truncate font-medium">{post.title}</p>
                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="truncate">{post.author.name ?? "Unknown"}</span>
                  <span>{timeAgo(post.createdAt)}</span>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <ShoppingBag className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base">Recent Listings</CardTitle>
              <CardDescription>Latest marketplace activity</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading && <Skeleton className="h-32 w-full" />}
          {!isLoading && recentListings.length === 0 && (
            <p className="text-sm text-muted-foreground">No listings yet.</p>
          )}
          {!isLoading &&
            recentListings.map((listing) => (
              <div key={listing.id} className="rounded-lg border p-2.5 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-medium">{listing.title}</p>
                  <Badge variant="outline" className="shrink-0 text-xs">
                    {listing.status}
                  </Badge>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="truncate">{listing.seller.name ?? "Unknown"}</span>
                  <span>{timeAgo(listing.createdAt)}</span>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <HelpCircle className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base">Senior Guidance</CardTitle>
              <CardDescription>Latest questions asked</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading && <Skeleton className="h-32 w-full" />}
          {!isLoading && recentGuidance.length === 0 && (
            <p className="text-sm text-muted-foreground">No questions yet.</p>
          )}
          {!isLoading &&
            recentGuidance.map((g) => (
              <div key={g.id} className="rounded-lg border p-2.5 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-medium">{g.title}</p>
                  <Badge variant={g.isAnswered ? "success" : "outline"} className="shrink-0 text-xs">
                    {g.isAnswered ? "Answered" : "Open"}
                  </Badge>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="truncate">{g.author.name ?? "Unknown"}</span>
                  <span>{timeAgo(g.createdAt)}</span>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
