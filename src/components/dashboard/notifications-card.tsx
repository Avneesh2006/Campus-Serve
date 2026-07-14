import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockNotifications } from "@/lib/mock-data/dashboard";

export function NotificationsCard() {
  const unreadCount = mockNotifications.filter((n) => n.unread).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="relative flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <Bell className="size-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-3.5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <CardTitle className="text-base">Notifications</CardTitle>
            <CardDescription>{unreadCount} unread</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {mockNotifications.map((notification) => (
          <div
            key={notification.id}
            className="flex items-start gap-2.5 rounded-lg p-2.5 hover:bg-accent"
          >
            <span
              className={cn(
                "mt-1.5 size-1.5 shrink-0 rounded-full",
                notification.unread ? "bg-brand" : "bg-transparent"
              )}
            />
            <p
              className={cn(
                "text-sm",
                notification.unread ? "font-medium" : "text-muted-foreground"
              )}
            >
              {notification.text}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
