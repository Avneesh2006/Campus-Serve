"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { useAttendanceStats } from "@/hooks/use-attendance-stats";

function barColor(percent: number) {
  if (percent >= 75) return "#10b981";
  if (percent >= 65) return "#f59e0b";
  return "#ef4444";
}

function formatMonth(monthKey: string) {
  const [year, month] = monthKey.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short" });
}

function formatWeek(weekKey: string) {
  const date = new Date(weekKey);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function AttendanceAnalyticsCard() {
  const { data, isLoading } = useAttendanceStats();

  const weeklyChartData =
    data?.weekly.map((w) => ({ label: formatWeek(w.week), percent: w.percent })) ?? [];
  const monthlyChartData =
    data?.monthly.map((m) => ({ label: formatMonth(m.month), percent: m.percent })) ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <BarChart3 className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base">Attendance Analytics</CardTitle>
            <CardDescription>Trends over time</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <Tabs defaultValue="weekly">
            <TabsList>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>

            <TabsContent value="weekly">
              {weeklyChartData.length === 0 ? (
                <EmptyChartState />
              ) : (
                <div className="h-64 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={weeklyChartData}
                      margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--color-border)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tickLine={false}
                        axisLine={false}
                        width={32}
                        tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--color-popover)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "var(--radius-md)",
                          fontSize: 12,
                          color: "var(--color-popover-foreground)",
                        }}
                        formatter={(value) => [`${value}%`, "Attendance"]}
                      />
                      <Bar dataKey="percent" radius={[6, 6, 0, 0]}>
                        {weeklyChartData.map((entry, index) => (
                          <Cell key={index} fill={barColor(entry.percent)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </TabsContent>

            <TabsContent value="monthly">
              {monthlyChartData.length === 0 ? (
                <EmptyChartState />
              ) : (
                <div className="h-64 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyChartData}
                      margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--color-border)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tickLine={false}
                        axisLine={false}
                        width={32}
                        tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--color-popover)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "var(--radius-md)",
                          fontSize: 12,
                          color: "var(--color-popover-foreground)",
                        }}
                        formatter={(value) => [`${value}%`, "Attendance"]}
                      />
                      <Bar dataKey="percent" radius={[6, 6, 0, 0]}>
                        {monthlyChartData.map((entry, index) => (
                          <Cell key={index} fill={barColor(entry.percent)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyChartState() {
  return (
    <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
      Not enough attendance data yet. Mark some classes to see trends.
    </p>
  );
}
