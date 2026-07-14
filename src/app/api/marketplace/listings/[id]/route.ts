import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateListingSchema } from "@/lib/validations/marketplace";

async function assertOwnership(userId: string, listingId: string) {
  const listing = await prisma.marketplaceListing.findUnique({
    where: { id: listingId },
  });
  if (!listing || listing.sellerId !== userId) return null;
  return listing;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const listing = await prisma.marketplaceListing
    .update({
      where: { id },
      data: { viewCount: { increment: 1 } },
      include: {
        seller: { select: { id: true, name: true, image: true, email: true } },
        images: { orderBy: { position: "asc" } },
      },
    })
    .catch(() => null);

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  return NextResponse.json({
    listing: { ...listing, isOwnListing: listing.sellerId === session.user.id },
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await assertOwnership(session.user.id, id);
  if (!existing) {
    return NextResponse.json(
      { error: "Listing not found or you don't have permission to edit it" },
      { status: 404 }
    );
  }

  try {
    const body = await req.json();
    const parsed = updateListingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { images, location, contactPhone, ...rest } = parsed.data;

    const listing = await prisma.marketplaceListing.update({
      where: { id },
      data: {
        ...rest,
        ...(location !== undefined ? { location: location || null } : {}),
        ...(contactPhone !== undefined
          ? { contactPhone: contactPhone || null }
          : {}),
        ...(images
          ? {
              images: {
                deleteMany: {},
                create: images.map((img, i) => ({ url: img.url, position: i })),
              },
            }
          : {}),
      },
      include: {
        seller: { select: { id: true, name: true, image: true, email: true } },
        images: { orderBy: { position: "asc" } },
      },
    });

    return NextResponse.json({ listing });
  } catch (error) {
    console.error("Update listing error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await assertOwnership(session.user.id, id);
  if (!existing) {
    return NextResponse.json(
      { error: "Listing not found or you don't have permission to delete it" },
      { status: 404 }
    );
  }

  await prisma.marketplaceListing.delete({ where: { id } });

  return NextResponse.json({ message: "Listing deleted" });
}
