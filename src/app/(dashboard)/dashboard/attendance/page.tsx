"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AttendanceOverviewStats,
  SubjectListCard,
  AttendanceTrackerCard,
  AttendanceCalculatorCard,
  AttendanceAnalyticsCard,
  AttendanceHistoryCard,
} from "@/components/attendance";

export default function AttendancePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground">
          Track, calculate, and analyze your class attendance.
        </p>
      </div>

      <AttendanceOverviewStats />

      <Tabs defaultValue="overview">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tracker">Tracker</TabsTrigger>
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <SubjectListCard />
        </TabsContent>

        <TabsContent value="tracker" className="mt-4">
          <AttendanceTrackerCard />
        </TabsContent>

        <TabsContent value="calculator" className="mt-4">
          <AttendanceCalculatorCard />
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <AttendanceAnalyticsCard />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <AttendanceHistoryCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
