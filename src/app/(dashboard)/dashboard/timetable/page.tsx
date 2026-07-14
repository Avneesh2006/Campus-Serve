import { TimetableCard } from "@/components/attendance";

export default function TimetablePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Timetable</h1>
        <p className="text-muted-foreground">
          Manage your weekly class schedule.
        </p>
      </div>

      <TimetableCard />
    </div>
  );
}
