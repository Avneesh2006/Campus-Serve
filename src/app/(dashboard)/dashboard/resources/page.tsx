import { ResourceBrowser } from "@/components/academic-hub";

export default function ResourcesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Resources</h1>
        <p className="text-muted-foreground">
          Cheat sheets, guides, slides, and other useful study material.
        </p>
      </div>

      <ResourceBrowser
        type="RESOURCE"
        emptyMessage="No resources yet. Share something useful with your peers."
        uploadLabel="Upload resource"
      />
    </div>
  );
}
