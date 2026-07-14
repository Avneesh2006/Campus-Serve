import { z } from "zod";

export const listingTypeEnum = z.enum([
  "BUY_SELL",
  "LOST_FOUND",
  "ACADEMIC_ASSISTANCE",
]);

export const listingCategoryEnum = z.enum([
  // Buy & Sell
  "BOOKS_STUDY_MATERIAL",
  "ELECTRONICS",
  "FURNITURE",
  "COSTUMES_ACCESSORIES",
  "BICYCLES_VEHICLES",
  "SPORTS_FITNESS",
  "OTHER_ITEMS",
  // Lost & Found
  "LOST_ITEM",
  "FOUND_ITEM",
  // Academic Assistance — tutoring/mentoring only, never assignment outsourcing
  "TUTORING",
  "PROJECT_MENTORING",
  "CAD_GUIDANCE",
  "CODING_HELP",
  "RESUME_REVIEW",
]);

export const listingConditionEnum = z.enum(["NEW", "LIKE_NEW", "GOOD", "FAIR", "WORN"]);
export const listingStatusEnum = z.enum([
  "ACTIVE",
  "RESERVED",
  "SOLD",
  "RESOLVED",
  "EXPIRED",
]);

// Category sets allowed per listing type — enforced server-side so the
// Academic Assistance section can never be used to post "do my assignment"
// style listings, regardless of what a client sends.
export const CATEGORIES_BY_TYPE: Record<string, string[]> = {
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

export const listingImageSchema = z.object({
  url: z.string().min(1).max(2000),
});

export const listingSchema = z
  .object({
    listingType: listingTypeEnum,
    category: listingCategoryEnum,
    title: z.string().min(3, "Title must be at least 3 characters").max(150),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(3000),
    price: z.number().min(0).optional().nullable(),
    isNegotiable: z.boolean(),
    condition: listingConditionEnum.optional().nullable(),
    location: z.string().max(200).optional().or(z.literal("")),
    contactPhone: z.string().max(20).optional().or(z.literal("")),
    images: z.array(listingImageSchema).max(6),
  })
  .refine(
    (data) => CATEGORIES_BY_TYPE[data.listingType]?.includes(data.category),
    {
      message: "This category doesn't belong to the selected listing type",
      path: ["category"],
    }
  )
  .refine(
    (data) =>
      // Guard rail: Academic Assistance listings can never masquerade as
      // assignment outsourcing by stuffing that intent into the title.
      data.listingType !== "ACADEMIC_ASSISTANCE" ||
      !/\b(do my|write my|complete my|finish my|solve my)\b.{0,20}\b(assignment|homework|hw)\b/i.test(
        `${data.title} ${data.description}`
      ),
    {
      message:
        "Academic Assistance is for tutoring, mentoring, and guidance — not for having someone complete your assignment. Please rephrase.",
      path: ["description"],
    }
  );

export const updateListingSchema = z.object({
  title: z.string().min(3).max(150).optional(),
  description: z.string().min(10).max(3000).optional(),
  price: z.number().min(0).optional().nullable(),
  isNegotiable: z.boolean().optional(),
  condition: listingConditionEnum.optional().nullable(),
  location: z.string().max(200).optional().or(z.literal("")),
  contactPhone: z.string().max(20).optional().or(z.literal("")),
  status: listingStatusEnum.optional(),
  images: z.array(listingImageSchema).max(6).optional(),
});

export type ListingInput = z.infer<typeof listingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
