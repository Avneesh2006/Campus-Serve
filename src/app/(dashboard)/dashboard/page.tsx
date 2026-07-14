import { auth } from "@/lib/auth";
import {
  WelcomeCard,
  AttendanceSummaryCard,
  TodaysTimetableCard,
  AssignmentsCard,
  RecentNotesCard,
  QuickActionsCard,
  CalendarCard,
  NotificationsCard,
  ProgressChartsCard,
  RecentActivityCard,
  AnnouncementsCard,
} from "@/components/dashboard";

export default async function DashboardPage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <WelcomeCard
        name={firstName}
        course={undefined}
        semester={undefined}
      />

      <QuickActionsCard />

      {/* Main content: 2/3 primary column, 1/3 side column on large screens */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ProgressChartsCard />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <AttendanceSummaryCard />
            <TodaysTimetableCard />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <AssignmentsCard />
            <RecentNotesCard />
          </div>
          <RecentActivityCard />
        </div>

        <div className="space-y-6">
          <CalendarCard />
          <NotificationsCard />
          <AnnouncementsCard />
        </div>
      </div>
    </div>
  );
}
