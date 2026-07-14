"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImageIcon, MapPin, Eye, MessageCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MarketplaceListing } from "@/hooks/use-listings";
import { CATEGORY_LABELS } from "@/components/marketplace/listing-filter-bar";

const CONDITION_LABELS: Record<string, string> = {
  NEW: "New",
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
  WORN: "Worn",
};

const STATUS_VARIANT: Record<string, "success" | "warning" | "destructive" | "outline"> = {
  ACTIVE: "success",
  RESERVED: "warning",
  SOLD: "destructive",
  RESOLVED: "destructive",
  EXPIRED: "outline",
};

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHrs < 1) return "Just now";
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

export function ListingCard({
  listing,
  onOpen,
  onContact,
  onDelete,
}: {
  listing: MarketplaceListing;
  onOpen: (listing: MarketplaceListing) => void;
  onContact: (listing: MarketplaceListing) => void;
  onDelete?: (listing: MarketplaceListing) => void;
}) {
  const coverImage = listing.images[0]?.url;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <button onClick={() => onOpen(listing)} className="block w-full text-left">
        <div className="flex aspect-video items-center justify-center bg-muted">
          {coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverImage} alt={listing.title} className="size-full object-cover" />
          ) : (
            <ImageIcon className="size-8 text-muted-foreground/40" />
          )}
        </div>
      </button>
      <CardContent className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <button onClick={() => onOpen(listing)} className="min-w-0 text-left">
            <p className="truncate font-medium leading-snug hover:underline">
              {listing.title}
            </p>
          </button>
          {listing.status !== "ACTIVE" && (
            <Badge variant={STATUS_VARIANT[listing.status]} className="shrink-0">
              {listing.status.charAt(0) + listing.status.slice(1).toLowerCase()}
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline">{CATEGORY_LABELS[listing.category]}</Badge>
          {listing.condition && (
            <Badge variant="secondary">{CONDITION_LABELS[listing.condition]}</Badge>
          )}
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">{listing.description}</p>

        <div className="flex items-center justify-between">
          {listing.price !== null ? (
            <p className="font-semibold">
              ₹{listing.price.toLocaleString()}
              {listing.isNegotiable && (
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  (negotiable)
                </span>
              )}
            </p>
          ) : (
            <p className="text-sm font-medium text-muted-foreground">Free / N.A.</p>
          )}
          <span className="text-xs text-muted-foreground">{timeAgo(listing.createdAt)}</span>
        </div>

        {listing.location && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3" />
            {listing.location}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="size-3.5" />
            {listing.viewCount}
          </span>
          <div className="flex items-center gap-1.5">
            {!listing.isOwnListing && (
              <Button size="sm" variant="brand" onClick={() => onContact(listing)}>
                <MessageCircle className="size-3.5" />
                Contact
              </Button>
            )}
            {listing.isOwnListing && onDelete && (
              <Button
                size="sm"
                variant="ghost"
                className={cn("text-destructive hover:text-destructive")}
                onClick={() => onDelete(listing)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { timeAgo };
