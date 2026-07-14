"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Calendar, Building2 } from "lucide-react";
import type { Club } from "@/hooks/use-clubs";

export const CLUB_CATEGORY_LABELS: Record<string, string> = {
  TECHNICAL: "Technical",
  CULTURAL: "Cultural",
  SPORTS: "Sports",
  SOCIAL_SERVICE: "Social Service",
  ARTS: "Arts",
  ENTREPRENEURSHIP: "Entrepreneurship",
  OTHER: "Other",
};

export function ClubCard({
  club,
  onToggleJoin,
}: {
  club: Club;
  onToggleJoin: (club: Club) => void;
}) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="space-y-3">
        <div className="flex items-start gap-3">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-lg text-white"
            style={{ backgroundColor: club.logoColor }}
          >
            <Building2 className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium leading-snug">{club.name}</p>
            <Badge variant="outline" className="mt-1">
              {CLUB_CATEGORY_LABELS[club.category]}
            </Badge>
          </div>
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">{club.description}</p>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="size-3.5" />
            {club.memberCount} members
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="size-3.5" />
            {club.eventCount} events
          </span>
        </div>

        <Button
          variant={club.isJoined ? "outline" : "brand"}
          size="sm"
          className="w-full"
          onClick={() => onToggleJoin(club)}
        >
          {club.isJoined ? "Joined" : "Join club"}
        </Button>
      </CardContent>
    </Card>
  );
}
