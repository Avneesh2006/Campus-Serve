import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AdminDashboardTab,
  UserManagementTab,
  ReportsTab,
  AnalyticsTab,
  AnnouncementsTab,
  AdminSettingsTab,
} from "@/components/admin";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-muted-foreground">
          Manage users, review activity, and broadcast announcements.
        </p>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList className="w-full flex-wrap sm:w-auto">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-4">
          <AdminDashboardTab />
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <UserManagementTab />
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <ReportsTab />
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <AnalyticsTab />
        </TabsContent>

        <TabsContent value="announcements" className="mt-4">
          <AnnouncementsTab />
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <AdminSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
