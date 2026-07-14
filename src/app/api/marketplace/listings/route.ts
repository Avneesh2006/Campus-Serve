import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  listingSchema,
  CATEGORIES_BY_TYPE,
} from "@/lib/validations/marketplace";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const listingType = searchParams.get("type");
  const category = searchParams.get("category");
  const status = searchParams.get("status");
  const query = searchParams.get("q")?.trim();
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const mine = searchParams.get("mine");
  const sort = searchParams.get("sort") || "recent"; // recent | priceLow | priceHigh

  const listings = await prisma.marketplaceListing.findMany({
    where: {
      ...(listingType ? { listingType: listingType as never } : {}),
      ...(category ? { category: category as never } : {}),
      ...(status
        ? { status: status as never }
        : { status: { not: "EXPIRED" } }),
      ...(mine === "true" ? { sellerId: session.user.id } : {}),
      ...(minPrice || maxPrice
        ? {
            price: {
              ...(minPrice ? { gte: Number(minPrice) } : {}),
              ...(maxPrice ? { lte: Number(maxPrice) } : {}),
            },
          }
        : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
              { location: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      seller: { select: { id: true, name: true, image: true, email: true } },
      images: { orderBy: { position: "asc" } },
    },
    orderBy:
      sort === "priceLow"
        ? { price: "asc" }
        : sort === "priceHigh"
        ? { price: "desc" }
        : { createdAt: "desc" },
  });

  const shaped = listings.map((l) => ({
    ...l,
    isOwnListing: l.sellerId === session.user.id,
  }));

  return NextResponse.json({ listings: shaped });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = listingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      listingType,
      category,
      title,
      description,
      price,
      isNegotiable,
      condition,
      location,
      contactPhone,
      images,
    } = parsed.data;

    // Defense in depth: even though the schema already validates category
    // membership per type, double-check here since this is the boundary
    // that actually writes to the database.
    if (!CATEGORIES_BY_TYPE[listingType]?.includes(category)) {
      return NextResponse.json(
        { error: "Invalid category for this listing type" },
        { status: 400 }
      );
    }

    const listing = await prisma.marketplaceListing.create({
      data: {
        sellerId: session.user.id,
        listingType,
        category,
        title,
        description,
        price: price ?? null,
        isNegotiable,
        condition: listingType === "BUY_SELL" ? condition ?? null : null,
        location: location || null,
        contactPhone: contactPhone || null,
        images: {
          create: images.map((img, i) => ({ url: img.url, position: i })),
        },
      },
      include: {
        seller: { select: { id: true, name: true, image: true, email: true } },
        images: { orderBy: { position: "asc" } },
      },
    });

    return NextResponse.json({ listing }, { status: 201 });
  } catch (error) {
    console.error("Create listing error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
