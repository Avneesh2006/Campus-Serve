"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  ClipboardList,
  ListChecks,
  NotebookText,
  FileQuestion,
  BookOpen,
  Folder,
  Users,
  ShoppingBag,
  BriefcaseBusiness,
  Sparkles,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const sidebarLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/attendance", label: "Attendance", icon: CalendarCheck },
  { href: "/dashboard/timetable", label: "Timetable", icon: ClipboardList },
  { href: "/dashboard/assignments", label: "Assignments", icon: ListChecks },
  { href: "/dashboard/notes", label: "Notes", icon: NotebookText },
  { href: "/dashboard/pyqs", label: "PYQs", icon: FileQuestion },
  { href: "/dashboard/books", label: "Books", icon: BookOpen },
  { href: "/dashboard/resources", label: "Resources", icon: Folder },
  { href: "/dashboard/community", label: "Community", icon: Users },
  { href: "/dashboard/marketplace", label: "Marketplace", icon: ShoppingBag },
  { href: "/dashboard/career-hub", label: "Career Hub", icon: BriefcaseBusiness },
  { href: "/dashboard/ai-tools", label: "AI Study Tools", icon: Sparkles },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function SidebarNav({
  onNavigate,
  role,
}: {
  onNavigate?: () => void;
  role?: string;
}) {
  const pathname = usePathname();
  const links =
    role === "ADMIN"
      ? [...sidebarLinks, { href: "/dashboard/admin", label: "Admin Panel", icon: ShieldCheck }]
      : sidebarLinks;

  return (
    <nav className="flex flex-col gap-1 p-3">
      {links.map((link) => {
        const isActive =
          link.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <link.icon className="size-4 shrink-0" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
