"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListingBrowser } from "@/components/marketplace";

export default function MarketplacePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Marketplace</h1>
        <p className="text-muted-foreground">
          Buy and sell items, report lost or found belongings, and offer or find
          academic assistance from fellow students.
        </p>
      </div>

      <Tabs defaultValue="buy-sell">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="buy-sell">Buy &amp; Sell</TabsTrigger>
          <TabsTrigger value="lost-found">Lost &amp; Found</TabsTrigger>
          <TabsTrigger value="academic">Academic Assistance</TabsTrigger>
        </TabsList>

        <TabsContent value="buy-sell" className="mt-4">
          <ListingBrowser
            listingType="BUY_SELL"
            emptyMessage="No items listed yet. Be the first to sell something."
            postLabel="Sell an item"
          />
        </TabsContent>

        <TabsContent value="lost-found" className="mt-4">
          <ListingBrowser
            listingType="LOST_FOUND"
            emptyMessage="No lost or found reports yet."
            postLabel="Report an item"
            showPriceSort={false}
          />
        </TabsContent>

        <TabsContent value="academic" className="mt-4">
          <ListingBrowser
            listingType="ACADEMIC_ASSISTANCE"
            emptyMessage="No academic assistance offers yet. Offer tutoring, mentoring, or guidance to fellow students."
            postLabel="Offer assistance"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
