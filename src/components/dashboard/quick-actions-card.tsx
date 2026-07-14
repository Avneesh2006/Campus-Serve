import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarCheck,
  NotebookPen,
  FileQuestion,
  BriefcaseBusiness,
  Sparkles,
  ClipboardPlus,
} from "lucide-react";

const actions = [
  { href: "/dashboard/attendance", label: "Mark Attendance", icon: CalendarCheck },
  { href: "/dashboard/notes", label: "Add Note", icon: NotebookPen },
  { href: "/dashboard/pyqs", label: "Browse PYQs", icon: FileQuestion },
  { href: "/dashboard/career-hub", label: "Find Internships", icon: BriefcaseBusiness },
  { href: "/dashboard/ai-tools", label: "Ask AI Tutor", icon: Sparkles },
  { href: "/dashboard", label: "New Assignment", icon: ClipboardPlus },
];

export function QuickActionsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {actions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors hover:bg-accent"
            >
              <div className="flex size-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <action.icon className="size-4.5" />
              </div>
              <span className="text-xs font-medium leading-tight">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
