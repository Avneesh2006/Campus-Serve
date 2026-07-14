import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { SidebarNav } from "@/components/layout/sidebar-nav";

export function Sidebar({ role }: { role?: string }) {
  return (
    <aside className="hidden w-64 shrink-0 border-r bg-sidebar text-sidebar-foreground md:flex md:flex-col">
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-md bg-brand text-brand-foreground">
            <GraduationCap className="size-5" />
          </span>
          CampusOS
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        <SidebarNav role={role} />
      </div>
    </aside>
  );
}
