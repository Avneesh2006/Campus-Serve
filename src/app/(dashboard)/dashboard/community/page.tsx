"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DiscussionForumTab,
  SeniorGuidanceTab,
  ClubsTab,
  EventsTab,
} from "@/components/community";

export default function CommunityPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Community</h1>
        <p className="text-muted-foreground">
          Discuss, get guidance, join clubs, and find events happening on campus.
        </p>
      </div>

      <Tabs defaultValue="forum">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="forum">Discussion Forum</TabsTrigger>
          <TabsTrigger value="guidance">Senior Guidance</TabsTrigger>
          <TabsTrigger value="clubs">Clubs</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>

        <TabsContent value="forum" className="mt-4">
          <DiscussionForumTab />
        </TabsContent>

        <TabsContent value="guidance" className="mt-4">
          <SeniorGuidanceTab />
        </TabsContent>

        <TabsContent value="clubs" className="mt-4">
          <ClubsTab />
        </TabsContent>

        <TabsContent value="events" className="mt-4">
          <EventsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
