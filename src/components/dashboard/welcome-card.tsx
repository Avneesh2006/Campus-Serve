import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function WelcomeCard({
  name,
  course,
  semester,
}: {
  name: string;
  course?: string | null;
  semester?: number | null;
}) {
  const greeting = getGreeting();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="overflow-hidden border-brand/20 bg-gradient-to-br from-brand/10 via-card to-card">
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="size-3.5 text-brand" />
            {today}
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting}, {name} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening across your college life today.
          </p>
        </div>
        {(course || semester) && (
          <div className="flex flex-wrap gap-2">
            {course && <Badge variant="brand">{course}</Badge>}
            {semester && <Badge variant="secondary">Semester {semester}</Badge>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
