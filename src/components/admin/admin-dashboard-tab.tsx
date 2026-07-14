"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  UserPlus,
  BookOpen,
  ListChecks,
  FileText,
  MessageSquare,
  ShoppingBag,
  Megaphone,
  Sparkles,
} from "lucide-react";
import { useAdminStats } from "@/hooks/use-admin-stats";

export function AdminDashboardTab() {
  const { data, isLoading } = useAdminStats();

  const cards = [
    { icon: Users, label: "Total users", value: data?.totalUsers },
    { icon: UserPlus, label: "New users (7d)", value: data?.newUsersThisWeek },
    { icon: BookOpen, label: "Subjects tracked", value: data?.totalSubjects },
    { icon: ListChecks, label: "Assignments", value: data?.totalAssignments },
    { icon: FileText, label: "Academic Hub resources", value: data?.totalResources },
    { icon: MessageSquare, label: "Forum posts", value: data?.totalForumPosts },
    { icon: ShoppingBag, label: "Marketplace listings", value: data?.totalListings },
    { icon: Megaphone, label: "Announcements", value: data?.totalAnnouncements },
    { icon: Sparkles, label: "AI conversations", value: data?.totalAiConversations },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <card.icon className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{card.label}</p>
              {isLoading ? (
                <Skeleton className="mt-1 h-6 w-12" />
              ) : (
                <p className="text-xl font-bold">{card.value ?? 0}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
