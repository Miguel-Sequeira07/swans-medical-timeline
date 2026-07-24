import { jsPDF } from "jspdf";
import type { Case } from "@/types/event";
import { buildMonthGroups, isValidDate, splitByDateValidity } from "@/lib/timeline";

const MARGIN = 48;
const PAGE_WIDTH = 595.28; // A4 pt
const PAGE_HEIGHT = 841.89;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

/**
 * Renders the case as a plain, readable PDF document — one section per
 * month, one block per event, in the same order as the on-screen
 * chronological timeline (including gap markers and milestones). Kept
 * intentionally simple (jsPDF's own text APIs, no custom layout engine)
 * since the bar for "done" here is that the file opens and shows the
 * right information, not visual parity with the web view.
 */
export function exportCaseToPdf(medicalCase: Case): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  let y = MARGIN;

  function ensureSpace(height: number) {
    if (y + height > PAGE_HEIGHT - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  }

  function writeLines(lines: string[], fontSize: number, lineHeight: number, color: number[]) {
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);
    for (const line of lines) {
      ensureSpace(lineHeight);
      doc.text(line, MARGIN, y);
      y += lineHeight;
    }
  }

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(20, 18, 14);
  doc.text(medicalCase.name, MARGIN, y);
  y += 24;

  const { dated } = splitByDateValidity(medicalCase.events);
  const undatedCount = medicalCase.events.length - dated.length;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(110, 100, 85);
  const rangeText =
    dated.length > 0
      ? `${dateFormatter.format(
          dated.reduce((min, e) => (e.date < min ? e.date : min), dated[0].date)
        )} – ${dateFormatter.format(
          dated.reduce((max, e) => (e.date > max ? e.date : max), dated[0].date)
        )} · ${dated.length} medical ${dated.length === 1 ? "encounter" : "encounters"}` +
        (undatedCount > 0 ? ` · ${undatedCount} undated` : "")
      : "No dated encounters";
  doc.text(rangeText, MARGIN, y);
  y += 12;
  doc.text(`Generated ${dateFormatter.format(new Date())} by Medical Timeline`, MARGIN, y);
  y += 20;
  doc.setDrawColor(220, 210, 190);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 24;

  const groups = buildMonthGroups(dated, medicalCase.milestones);

  for (const group of groups) {
    ensureSpace(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(20, 18, 14);
    doc.text(group.label, MARGIN, y);
    y += 18;

    for (const entry of group.entries) {
      if (entry.kind === "gap") {
        writeLines([`— ${entry.days}-day gap in treatment —`], 9, 14, [150, 140, 120]);
        y += 4;
        continue;
      }

      if (entry.kind === "milestone") {
        const prefix = entry.milestone.type === "accident" ? "ACCIDENT" : "MILESTONE";
        ensureSpace(16);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(150, 60, 30);
        doc.text(
          `${prefix}: ${entry.milestone.label} — ${dateFormatter.format(entry.milestone.date)}`,
          MARGIN,
          y
        );
        y += 14;
        if (entry.milestone.notes) {
          const noteLines = doc.splitTextToSize(entry.milestone.notes, CONTENT_WIDTH);
          writeLines(noteLines, 9, 12, [130, 120, 105]);
        }
        y += 8;
        continue;
      }

      const event = entry.event;
      ensureSpace(16);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(20, 18, 14);
      const dateLabel = isValidDate(event.date) ? dateFormatter.format(event.date) : "Undated";
      doc.text(`${dateLabel} — ${event.recordType || "Record"}`, MARGIN, y);
      y += 14;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(60, 55, 45);
      const providerLine = `${
        event.providers.length > 0 ? event.providers.join(", ") : "Provider not specified"
      } · ${event.facility || "Facility not specified"} · ${event.medicineType || "Unspecified"}`;
      const providerLines = doc.splitTextToSize(providerLine, CONTENT_WIDTH);
      writeLines(providerLines, 10, 13, [60, 55, 45]);

      if (event.summary) {
        const summaryLines = doc.splitTextToSize(event.summary, CONTENT_WIDTH);
        writeLines(summaryLines, 9.5, 13, [90, 82, 68]);
      }

      if (event.bodyParts.length > 0) {
        writeLines([event.bodyParts.join(" · ")], 8.5, 12, [140, 130, 112]);
      }

      y += 10;
    }

    y += 6;
  }

  // Page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 140, 120);
    doc.text(`Page ${i} of ${pageCount}`, PAGE_WIDTH - MARGIN - 60, PAGE_HEIGHT - 24);
  }

  doc.save(`${sanitizeFileName(medicalCase.name)}.pdf`);
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^\w\- ]+/g, "").trim() || "medical-timeline";
}
