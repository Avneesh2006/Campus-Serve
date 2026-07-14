import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsersThisWeek,
    totalSubjects,
    totalAssignments,
    totalResources,
    totalForumPosts,
    totalListings,
    totalAnnouncements,
    totalAiConversations,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.subject.count(),
    prisma.assignment.count(),
    prisma.resource.count(),
    prisma.forumPost.count(),
    prisma.marketplaceListing.count(),
    prisma.announcement.count(),
    prisma.aiConversation.count(),
  ]);

  return NextResponse.json({
    totalUsers,
    newUsersThisWeek,
    totalSubjects,
    totalAssignments,
    totalResources,
    totalForumPosts,
    totalListings,
    totalAnnouncements,
    totalAiConversations,
  });
}
