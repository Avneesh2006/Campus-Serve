import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row md:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex size-7 items-center justify-center rounded-md bg-brand text-brand-foreground">
            <GraduationCap className="size-4" />
          </span>
          CampusOS
        </Link>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} CampusOS. Built for students, by students.
        </p>
      </div>
    </footer>
  );
}
