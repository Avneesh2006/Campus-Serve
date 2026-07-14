"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useListings,
  type MarketplaceListing,
  type ListingType,
  type ListingStatus,
} from "@/hooks/use-listings";
import {
  ListingFilterBar,
  defaultListingFilters,
  type ListingFilterState,
} from "@/components/marketplace/listing-filter-bar";
import { ListingCard } from "@/components/marketplace/listing-card";
import { NewListingDialog } from "@/components/marketplace/new-listing-dialog";
import { ListingDetailDialog } from "@/components/marketplace/listing-detail-dialog";
import { ContactSellerDialog, type ContactInfo } from "@/components/marketplace/contact-seller-dialog";
import { DeleteConfirmDialog } from "@/components/attendance/delete-confirm-dialog";

export function ListingBrowser({
  listingType,
  emptyMessage,
  postLabel,
  showPriceSort = true,
}: {
  listingType: ListingType;
  emptyMessage: string;
  postLabel: string;
  showPriceSort?: boolean;
}) {
  const [filters, setFilters] = React.useState<ListingFilterState>(defaultListingFilters);

  const { listings, isLoading, createListing, updateStatus, deleteListing, getContactInfo } =
    useListings({
      type: listingType,
      category: filters.category !== "all" ? (filters.category as never) : undefined,
      q: filters.q || undefined,
      sort: filters.sort,
    });

  const [newOpen, setNewOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<MarketplaceListing | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState<MarketplaceListing | null>(null);
  const [contactOpen, setContactOpen] = React.useState(false);
  const [contactInfo, setContactInfo] = React.useState<ContactInfo | null>(null);
  const [contactLoading, setContactLoading] = React.useState(false);

  function openDetail(listing: MarketplaceListing) {
    setSelected(listing);
    setDetailOpen(true);
  }

  async function handleContact(listing: MarketplaceListing) {
    setContactOpen(true);
    setContactLoading(true);
    setContactInfo(null);
    const info = await getContactInfo(listing.id);
    setContactInfo(info);
    setContactLoading(false);
  }

  async function handleDelete() {
    if (!deleting) return;
    await deleteListing(deleting.id);
    setDeleting(null);
  }

  async function handleUpdateStatus(listing: MarketplaceListing, status: ListingStatus) {
    await updateStatus(listing.id, status);
    setDetailOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ListingFilterBar
          filters={filters}
          onChange={setFilters}
          listingType={listingType}
          showPriceSort={showPriceSort}
        />
        <Button variant="brand" className="shrink-0" onClick={() => setNewOpen(true)}>
          <Plus className="size-4" />
          {postLabel}
        </Button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full" />
          ))}
        </div>
      )}

      {!isLoading && listings.length === 0 && (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          <Button variant="brand" size="sm" className="mt-4" onClick={() => setNewOpen(true)}>
            <Plus className="size-4" />
            {postLabel}
          </Button>
        </div>
      )}

      {!isLoading && listings.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onOpen={openDetail}
              onContact={handleContact}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      <NewListingDialog
        open={newOpen}
        onOpenChange={setNewOpen}
        listingType={listingType}
        onSubmit={createListing}
      />

      <ListingDetailDialog
        listing={selected}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onContact={handleContact}
        onUpdateStatus={handleUpdateStatus}
      />

      <ContactSellerDialog
        open={contactOpen}
        onOpenChange={setContactOpen}
        contactInfo={contactInfo}
        isLoading={contactLoading}
      />

      <DeleteConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this listing?"
        description={`This will permanently delete "${deleting?.title}". This action cannot be undone.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
