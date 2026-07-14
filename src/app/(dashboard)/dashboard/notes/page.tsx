import { ResourceBrowser } from "@/components/academic-hub";

export default function NotesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notes</h1>
        <p className="text-muted-foreground">
          Upload and download subject notes shared by you and your peers.
        </p>
      </div>

      <ResourceBrowser
        type="NOTE"
        emptyMessage="No notes yet. Be the first to upload notes for a subject."
        uploadLabel="Upload notes"
      />
    </div>
  );
}
