import Link from "next/link";
import {
  CalendarCheck,
  NotebookText,
  BriefcaseBusiness,
  Sparkles,
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const features = [
  {
    icon: CalendarCheck,
    title: "Attendance Tracking",
    description:
      "Log attendance per subject, see live percentages, and know exactly how many classes you can skip.",
  },
  {
    icon: ClipboardList,
    title: "Smart Timetable",
    description:
      "A clean weekly timetable that syncs with attendance and reminds you before class starts.",
  },
  {
    icon: NotebookText,
    title: "Notes & PYQs",
    description:
      "Organize notes by subject and access previous year question papers shared by your peers.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Internships & Placements",
    description:
      "Discover internship opportunities and placement resources curated for your branch.",
  },
  {
    icon: Sparkles,
    title: "AI Study Tools",
    description:
      "Summarize notes, generate quizzes, and get instant doubt-solving powered by AI.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-20 text-center md:px-6 md:py-32">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
            <Sparkles className="size-3.5 text-brand" />
            The Student Operating System
          </div>
          <h1 className="mx-auto max-w-3xl text-balance text-4xl font-bold tracking-tight md:text-6xl">
            Everything college needs,
            <span className="text-brand"> in one dashboard.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-muted-foreground">
            Attendance, timetable, notes, PYQs, internships and AI study tools —
            CampusOS brings your entire academic life into a single, beautifully
            simple app.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" variant="brand" asChild>
              <Link href="/register">
                Get started for free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Explore features</Link>
            </Button>
          </div>
        </section>

        <section id="features" className="border-t bg-muted/30 py-20">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Built for how students actually work
              </h2>
              <p className="mt-4 text-muted-foreground">
                One login. Every tool you need to stay on top of college — no
                more juggling five different apps.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                      <feature.icon className="size-5" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-20">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Get set up in minutes
              </h2>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                { step: "01", title: "Create your account", desc: "Sign up with your college email in seconds." },
                { step: "02", title: "Set up your profile", desc: "Add your course, semester, and subjects." },
                { step: "03", title: "Take control", desc: "Track attendance, manage notes, and stay ahead." },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-brand text-lg font-bold text-brand-foreground">
                    {item.step}
                  </div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/30 py-20">
          <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Ready to simplify college life?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Join students already using CampusOS to stay organized and ahead.
            </p>
            <Button size="lg" variant="brand" className="mt-8" asChild>
              <Link href="/register">
                Create your free account
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
