"use client";

import * as React from "react";
import { Loader2, UploadCloud, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePdfSummarizer } from "@/hooks/use-pdf-summarizer";
import { ChatPanel } from "@/components/ai-tools/chat-panel";

export function PdfSummarizerTab() {
  const { summarizeFile, isExtracting, isSummarizing } = usePdfSummarizer();
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [hasSummarized, setHasSummarized] = React.useState(false);
  const isBusy = isExtracting || isSummarizing;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const result = await summarizeFile(file);
    if (result) setHasSummarized(true);
    e.target.value = "";
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <FileText className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base">PDF Summarizer</CardTitle>
              <CardDescription>
                Upload lecture notes or a chapter to get a structured summary.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <label
            htmlFor="pdf-summarize-upload"
            className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center transition-colors hover:bg-accent"
          >
            {isBusy ? (
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            ) : (
              <UploadCloud className="size-6 text-muted-foreground" />
            )}
            <span className="text-sm text-muted-foreground">
              {isExtracting
                ? "Reading PDF..."
                : isSummarizing
                ? "Summarizing..."
                : fileName
                ? `Uploaded: ${fileName}. Click to upload another PDF.`
                : "Click to upload a PDF (up to 15MB)"}
            </span>
            <input
              id="pdf-summarize-upload"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
              disabled={isBusy}
            />
          </label>
        </CardContent>
      </Card>

      {hasSummarized && (
        <ChatPanel
          type="PDF_SUMMARIZER"
          emptyStateTitle="Your PDF summaries"
          emptyStateDescription="Summaries appear here, and you can ask follow-up questions about the document."
          inputPlaceholder="Ask about this document..."
        />
      )}
    </div>
  );
}
