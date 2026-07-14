import { jsPDF } from "jspdf";
import type { Resume } from "@/hooks/use-resumes";

const MARGIN = 15;
const PAGE_WIDTH = 210; // A4 mm
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight = 5
) {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

export function exportResumeToPdf(resume: Resume) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGIN;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(resume.fullName || "Your Name", MARGIN, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const contactParts = [resume.email, resume.phone, resume.location].filter(Boolean);
  if (contactParts.length > 0) {
    doc.text(contactParts.join("  |  "), MARGIN, y);
    y += 6;
  }

  doc.setDrawColor(200);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 6;

  function sectionHeading(title: string) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(title.toUpperCase(), MARGIN, y);
    y += 5.5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
  }

  function ensureSpace(needed: number) {
    if (y + needed > 280) {
      doc.addPage();
      y = MARGIN;
    }
  }

  // Summary
  if (resume.summary) {
    ensureSpace(20);
    sectionHeading("Summary");
    y = addWrappedText(doc, resume.summary, MARGIN, y, CONTENT_WIDTH);
    y += 4;
  }

  // Experience
  if (resume.experience.length > 0) {
    ensureSpace(20);
    sectionHeading("Experience");
    for (const exp of resume.experience) {
      ensureSpace(18);
      doc.setFont("helvetica", "bold");
      doc.text(exp.role || "Role", MARGIN, y);
      const dateRange = [exp.startDate, exp.endDate].filter(Boolean).join(" – ");
      if (dateRange) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(dateRange, PAGE_WIDTH - MARGIN, y, { align: "right" });
        doc.setFontSize(10);
      }
      y += 5;
      doc.setFont("helvetica", "italic");
      doc.text(exp.company || "", MARGIN, y);
      doc.setFont("helvetica", "normal");
      y += 5;
      if (exp.description) {
        y = addWrappedText(doc, exp.description, MARGIN, y, CONTENT_WIDTH);
      }
      y += 3;
    }
    y += 1;
  }

  // Projects
  if (resume.projects.length > 0) {
    ensureSpace(20);
    sectionHeading("Projects");
    for (const proj of resume.projects) {
      ensureSpace(18);
      doc.setFont("helvetica", "bold");
      doc.text(proj.name || "Project", MARGIN, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      if (proj.techStack) {
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(proj.techStack, MARGIN, y);
        doc.setTextColor(0);
        doc.setFontSize(10);
        y += 5;
      }
      if (proj.description) {
        y = addWrappedText(doc, proj.description, MARGIN, y, CONTENT_WIDTH);
      }
      if (proj.link) {
        doc.setTextColor(37, 99, 235);
        doc.textWithLink(proj.link, MARGIN, y, { url: proj.link });
        doc.setTextColor(0);
        y += 5;
      }
      y += 3;
    }
    y += 1;
  }

  // Education
  if (resume.education.length > 0) {
    ensureSpace(20);
    sectionHeading("Education");
    for (const edu of resume.education) {
      ensureSpace(14);
      doc.setFont("helvetica", "bold");
      doc.text(edu.school || "School", MARGIN, y);
      const dateRange = [edu.startYear, edu.endYear].filter(Boolean).join(" – ");
      if (dateRange) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(dateRange, PAGE_WIDTH - MARGIN, y, { align: "right" });
        doc.setFontSize(10);
      }
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.text(edu.degree || "", MARGIN, y);
      y += 5;
      if (edu.notes) {
        y = addWrappedText(doc, edu.notes, MARGIN, y, CONTENT_WIDTH);
      }
      y += 3;
    }
    y += 1;
  }

  // Skills
  if (resume.skills.length > 0) {
    ensureSpace(16);
    sectionHeading("Skills");
    y = addWrappedText(doc, resume.skills.join("  •  "), MARGIN, y, CONTENT_WIDTH);
  }

  const fileName = `${(resume.fullName || resume.title || "resume").replace(/\s+/g, "_")}.pdf`;
  doc.save(fileName);
}
