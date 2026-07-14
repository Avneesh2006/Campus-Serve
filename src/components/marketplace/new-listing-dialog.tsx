"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UploadCloud, X } from "lucide-react";

import { listingSchema, type ListingInput } from "@/lib/validations/marketplace";
import type { ListingType } from "@/hooks/use-listings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORY_LABELS, CATEGORIES_BY_TYPE } from "@/components/marketplace/listing-filter-bar";

const TYPE_COPY: Record<ListingType, { title: string; description: string }> = {
  BUY_SELL: {
    title: "List an item for sale",
    description: "Sell or give away something to fellow students.",
  },
  LOST_FOUND: {
    title: "Report a lost or found item",
    description: "Help reunite items with their owners.",
  },
  ACADEMIC_ASSISTANCE: {
    title: "Offer academic assistance",
    description:
      "Offer tutoring, project mentoring, CAD guidance, coding help, or resume reviews. This is not for completing assignments on someone's behalf.",
  },
};

const CONDITION_OPTIONS = [
  { value: "NEW", label: "New" },
  { value: "LIKE_NEW", label: "Like New" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
  { value: "WORN", label: "Worn" },
];

export function NewListingDialog({
  open,
  onOpenChange,
  listingType,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingType: ListingType;
  onSubmit: (data: ListingInput) => Promise<unknown>;
}) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [images, setImages] = React.useState<{ url: string; name: string }[]>([]);

  const categories = CATEGORIES_BY_TYPE[listingType];

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ListingInput>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      listingType,
      category: categories[0] as ListingInput["category"],
      title: "",
      description: "",
      price: undefined,
      isNegotiable: false,
      condition: undefined,
      location: "",
      contactPhone: "",
      images: [],
    },
  });

  const isBuySell = listingType === "BUY_SELL";
  const isAcademic = listingType === "ACADEMIC_ASSISTANCE";
  const priceLabel = isAcademic ? "Rate (optional, e.g. per hour)" : "Price";

  React.useEffect(() => {
    if (open) {
      setImages([]);
      reset({
        listingType,
        category: categories[0] as ListingInput["category"],
        title: "",
        description: "",
        price: undefined,
        isNegotiable: false,
        condition: undefined,
        location: "",
        contactPhone: "",
        images: [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, listingType]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const newImages = Array.from(files)
      .slice(0, 6 - images.length)
      .map((file) => ({ url: URL.createObjectURL(file), name: file.name }));

    setImages((prev) => [...prev, ...newImages]);
    e.target.value = "";
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleFormSubmit(data: ListingInput) {
    setIsSubmitting(true);
    try {
      const result = await onSubmit({
        ...data,
        images: images.map((img) => ({ url: img.url })),
      });
      if (result !== null) onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{TYPE_COPY[listingType].title}</DialogTitle>
          <DialogDescription>{TYPE_COPY[listingType].description}</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="max-h-[70vh] space-y-4 overflow-y-auto pr-1"
        >
          <div className="space-y-2">
            <Label>Category</Label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {CATEGORY_LABELS[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder={
                isAcademic
                  ? "1-on-1 Python tutoring for beginners"
                  : listingType === "LOST_FOUND"
                  ? "Black wallet lost near library"
                  : "Used engineering drawing kit"
              }
              aria-invalid={!!errors.title}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder={
                isAcademic
                  ? "Describe what you can help with, your experience, and availability..."
                  : "Add details that would help someone decide..."
              }
              className="min-h-24"
              aria-invalid={!!errors.description}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {(isBuySell || isAcademic) && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="price">{priceLabel}</Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  step="0.01"
                  {...register("price", {
                    setValueAs: (v) => (v === "" ? undefined : Number(v)),
                  })}
                />
              </div>
              {isBuySell && (
                <div className="space-y-2">
                  <Label>Condition</Label>
                  <Controller
                    control={control}
                    name="condition"
                    render={({ field }) => (
                      <Select
                        value={field.value ?? undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {CONDITION_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              )}
            </div>
          )}

          {isBuySell && (
            <Controller
              control={control}
              name="isNegotiable"
              render={({ field }) => (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="size-4 rounded border-input"
                  />
                  Price is negotiable
                </label>
              )}
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="location">
                {listingType === "LOST_FOUND" ? "Location" : "Meetup location"} (optional)
              </Label>
              <Input id="location" placeholder="Library, Block C" {...register("location")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Phone (optional)</Label>
              <Input id="contactPhone" placeholder="+91 90000 00000" {...register("contactPhone")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Images (up to 6)</Label>
            <label
              htmlFor="listing-image-upload"
              className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed p-5 text-center transition-colors hover:bg-accent"
            >
              <UploadCloud className="size-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Click to add photos
              </span>
              <input
                id="listing-image-upload"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
                disabled={images.length >= 6}
              />
            </label>
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {images.map((img, i) => (
                  <div key={`${img.name}-${i}`} className="relative size-16">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.name}
                      className="size-full rounded-md object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-destructive text-white"
                      aria-label="Remove image"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isAcademic && (
            <p className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
              Academic Assistance listings are for tutoring, project mentoring, CAD
              guidance, coding help, and resume reviews only. Listings that offer to
              complete assignments on someone&apos;s behalf aren&apos;t permitted.
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="brand" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Post listing
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
