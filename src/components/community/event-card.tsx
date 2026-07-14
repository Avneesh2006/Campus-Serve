"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Users, Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CommunityEvent } from "@/hooks/use-events";

export const EVENT_CATEGORY_LABELS: Record<string, string> = {
  WORKSHOP: "Workshop",
  SEMINAR: "Seminar",
  FEST: "Fest",
  COMPETITION: "Competition",
  MEETUP: "Meetup",
  OTHER: "Other",
};

function formatEventDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function EventCard({
  event,
  onRsvp,
}: {
  event: CommunityEvent;
  onRsvp: (event: CommunityEvent, status: "GOING" | "INTERESTED" | "NOT_GOING") => void;
}) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium leading-snug">{event.title}</p>
            {event.club && (
              <p className="truncate text-xs text-muted-foreground">
                Hosted by {event.club.name}
              </p>
            )}
          </div>
          <Badge variant="outline" className="shrink-0">
            {EVENT_CATEGORY_LABELS[event.category]}
          </Badge>
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">{event.description}</p>

        <div className="space-y-1.5 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            {formatEventDate(event.startsAt)}
          </p>
          {event.location && (
            <p className="flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              {event.location}
            </p>
          )}
          <p className="flex items-center gap-1.5">
            <Users className="size-3.5" />
            {event.rsvpCount} attending
          </p>
        </div>

        <div className="flex gap-1.5">
          <Button
            size="sm"
            variant={event.myRsvpStatus === "GOING" ? "brand" : "outline"}
            className="flex-1"
            onClick={() =>
              onRsvp(event, event.myRsvpStatus === "GOING" ? "NOT_GOING" : "GOING")
            }
          >
            <Check className={cn("size-3.5", event.myRsvpStatus === "GOING" && "opacity-100")} />
            Going
          </Button>
          <Button
            size="sm"
            variant={event.myRsvpStatus === "INTERESTED" ? "default" : "outline"}
            className="flex-1"
            onClick={() =>
              onRsvp(
                event,
                event.myRsvpStatus === "INTERESTED" ? "NOT_GOING" : "INTERESTED"
              )
            }
          >
            <Star
              className={cn(
                "size-3.5",
                event.myRsvpStatus === "INTERESTED" && "fill-current"
              )}
            />
            Interested
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
