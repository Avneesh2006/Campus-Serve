import { ResourceBrowser } from "@/components/academic-hub";

export default function BooksPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Books</h1>
        <p className="text-muted-foreground">
          Reference textbooks and reading material shared by the community.
        </p>
      </div>

      <ResourceBrowser
        type="BOOK"
        emptyMessage="No books added yet. Share a reference textbook to help others."
        uploadLabel="Add book"
      />
    </div>
  );
}
