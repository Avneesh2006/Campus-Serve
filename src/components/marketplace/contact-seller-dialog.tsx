"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, Loader2 } from "lucide-react";

export interface ContactInfo {
  seller: { id: string; name: string | null; email: string; image: string | null };
  contactPhone: string | null;
  listingTitle: string;
}

export function ContactSellerDialog({
  open,
  onOpenChange,
  contactInfo,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactInfo: ContactInfo | null;
  isLoading: boolean;
}) {
  const initials =
    contactInfo?.seller.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Contact seller</DialogTitle>
          <DialogDescription>
            {contactInfo
              ? `Reach out about "${contactInfo.listingTitle}"`
              : "Loading contact details..."}
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex justify-center py-6">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && contactInfo && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Avatar className="size-10">
                <AvatarImage
                  src={contactInfo.seller.image ?? undefined}
                  alt={contactInfo.seller.name ?? ""}
                />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{contactInfo.seller.name}</p>
                <p className="text-xs text-muted-foreground">Listing owner</p>
              </div>
            </div>

            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href={`mailto:${contactInfo.seller.email}`}>
                  <Mail className="size-4" />
                  {contactInfo.seller.email}
                </a>
              </Button>
              {contactInfo.contactPhone && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={`tel:${contactInfo.contactPhone}`}>
                    <Phone className="size-4" />
                    {contactInfo.contactPhone}
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
