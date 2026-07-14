"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageIcon, MapPin, Eye, MessageCircle } from "lucide-react";
import type { MarketplaceListing, ListingStatus } from "@/hooks/use-listings";
import { CATEGORY_LABELS } from "@/components/marketplace/listing-filter-bar";

const CONDITION_LABELS: Record<string, string> = {
  NEW: "New",
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
  WORN: "Worn",
};

const STATUS_OPTIONS: Record<string, { value: ListingStatus; label: string }[]> = {
  BUY_SELL: [
    { value: "ACTIVE", label: "Active" },
    { value: "RESERVED", label: "Reserved" },
    { value: "SOLD", label: "Sold" },
  ],
  LOST_FOUND: [
    { value: "ACTIVE", label: "Active" },
    { value: "RESOLVED", label: "Resolved" },
  ],
  ACADEMIC_ASSISTANCE: [
    { value: "ACTIVE", label: "Active" },
    { value: "RESOLVED", label: "Closed" },
  ],
};

export function ListingDetailDialog({
  listing,
  open,
  onOpenChange,
  onContact,
  onUpdateStatus,
}: {
  listing: MarketplaceListing | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContact: (listing: MarketplaceListing) => void;
  onUpdateStatus: (listing: MarketplaceListing, status: ListingStatus) => void;
}) {
  const [activeImage, setActiveImage] = React.useState(0);

  React.useEffect(() => {
    if (open) setActiveImage(0);
  }, [open, listing?.id]);

  if (!listing) return null;

  const images = listing.images;
  const statusOptions = STATUS_OPTIONS[listing.listingType] ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{CATEGORY_LABELS[listing.category]}</Badge>
            {listing.condition && (
              <Badge variant="secondary">{CONDITION_LABELS[listing.condition]}</Badge>
            )}
          </div>
          <DialogTitle>{listing.title}</DialogTitle>
          <DialogDescription asChild>
            <p className="whitespace-pre-wrap text-sm text-foreground">
              {listing.description}
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="overflow-hidden rounded-lg border bg-muted">
            <div className="flex aspect-video items-center justify-center">
              {images.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={images[activeImage]?.url}
                  alt={listing.title}
                  className="size-full object-cover"
                />
              ) : (
                <ImageIcon className="size-10 text-muted-foreground/40" />
              )}
            </div>
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`size-14 shrink-0 overflow-hidden rounded-md border-2 ${
                    activeImage === i ? "border-brand" : "border-transparent"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            {listing.price !== null ? (
              <p className="text-lg font-semibold">
                ₹{listing.price.toLocaleString()}
                {listing.isNegotiable && (
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    (negotiable)
                  </span>
                )}
              </p>
            ) : (
              <p className="text-sm font-medium text-muted-foreground">Free / N.A.</p>
            )}
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="size-3.5" />
              {listing.viewCount} views
            </span>
          </div>

          {listing.location && (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4" />
              {listing.location}
            </p>
          )}

          {listing.isOwnListing && statusOptions.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <span className="text-sm font-medium">Status:</span>
              <Select
                value={listing.status}
                onValueChange={(v) => onUpdateStatus(listing, v as ListingStatus)}
              >
                <SelectTrigger className="h-8 flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {!listing.isOwnListing && (
            <Button variant="brand" onClick={() => onContact(listing)}>
              <MessageCircle className="size-4" />
              Contact seller
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
