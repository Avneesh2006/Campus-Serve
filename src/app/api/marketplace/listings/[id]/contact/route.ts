import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const listing = await prisma.marketplaceListing.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      contactPhone: true,
      seller: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  return NextResponse.json({
    seller: listing.seller,
    contactPhone: listing.contactPhone,
    listingTitle: listing.title,
  });
}
