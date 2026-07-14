import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
    }

    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: "PDF must be under 15MB" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // pdf-parse v2 exposes a PDFParse class rather than a default-export
    // function; imported dynamically to keep it out of the client bundle.
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();

    const extractedText = result.text.trim();

    if (!extractedText) {
      return NextResponse.json(
        { error: "Couldn't extract any text from this PDF. It may be scanned or image-based." },
        { status: 422 }
      );
    }

    // Cap the extracted text to keep prompts reasonable; summarizer schema
    // enforces the same limit.
    const truncated = extractedText.slice(0, 50000);

    return NextResponse.json({
      fileName: file.name,
      extractedText: truncated,
      truncated: extractedText.length > 50000,
      pageCount: result.pages.length,
    });
  } catch (error) {
    console.error("PDF text extraction error:", error);
    return NextResponse.json(
      { error: "Failed to read this PDF. Please try a different file." },
      { status: 500 }
    );
  }
}
