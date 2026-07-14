import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { History } from "lucide-react";
import { mockActivity } from "@/lib/mock-data/dashboard";

export function RecentActivityCard() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <History className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <CardDescription>What you&apos;ve been up to</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-4 border-l pl-4">
          {mockActivity.map((item) => (
            <li key={item.id} className="relative">
              <span className="absolute -left-[21px] top-1 size-2.5 rounded-full border-2 border-background bg-brand" />
              <p className="text-sm">{item.text}</p>
              <p className="text-xs text-muted-foreground">{item.time}</p>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
