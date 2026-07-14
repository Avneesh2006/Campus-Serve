"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  InternshipsTab,
  HackathonsTab,
  CodingResourcesTab,
  ResumeBuilderTab,
} from "@/components/career-hub";

export default function CareerHubPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Career Hub</h1>
        <p className="text-muted-foreground">
          Find internships and hackathons, sharpen your coding skills, and build your resume.
        </p>
      </div>

      <Tabs defaultValue="internships">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="internships">Internships</TabsTrigger>
          <TabsTrigger value="hackathons">Hackathons</TabsTrigger>
          <TabsTrigger value="coding-resources">Coding Resources</TabsTrigger>
          <TabsTrigger value="resume">Resume Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="internships" className="mt-4">
          <InternshipsTab />
        </TabsContent>

        <TabsContent value="hackathons" className="mt-4">
          <HackathonsTab />
        </TabsContent>

        <TabsContent value="coding-resources" className="mt-4">
          <CodingResourcesTab />
        </TabsContent>

        <TabsContent value="resume" className="mt-4">
          <ResumeBuilderTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
