import { ResourceBrowser } from "@/components/academic-hub";

export default function PyqsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Previous Year Papers
        </h1>
        <p className="text-muted-foreground">
          Find and share past exam papers by subject and year.
        </p>
      </div>

      <ResourceBrowser
        type="PYQ"
        emptyMessage="No previous year papers yet. Upload one to help others prepare."
        uploadLabel="Upload paper"
      />
    </div>
  );
}
