import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const listings = await prisma.marketplaceListing.findMany({
    where: { sellerId: session.user.id },
    include: {
      seller: { select: { id: true, name: true, image: true, email: true } },
      images: { orderBy: { position: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    listings: listings.map((l) => ({ ...l, isOwnListing: true })),
  });
}
