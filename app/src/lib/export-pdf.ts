import { jsPDF } from "jspdf";
import type { Case } from "@/types/event";
import { buildMonthGroups, isValidDate, splitByDateValidity } from "@/lib/timeline";

const MARGIN = 54;
const PAGE_WIDTH = 595.28; // A4 pt
const PAGE_HEIGHT = 841.89;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

/**
 * Text colors chosen for contrast, not just palette match with the web
 * UI — every tone here holds at least WCAG AA (4.5:1) against the white
 * page, including the "muted" one, since gap/body-part/footer text is
 * still content a reader needs, not decoration.
 */
const INK = [26, 22, 18];
const INK_SECONDARY = [64, 56, 45];
const INK_MUTED = [92, 84, 68];
const RUST = [150, 55, 25];

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
 * right information — legibly, at a normal reading size, with real
 * contrast — not visual parity with the web view.
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
  doc.setFontSize(21);
  doc.setTextColor(INK[0], INK[1], INK[2]);
  doc.text(medicalCase.name, MARGIN, y);
  y += 28;

  const { dated } = splitByDateValidity(medicalCase.events);
  const undatedCount = medicalCase.events.length - dated.length;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(INK_SECONDARY[0], INK_SECONDARY[1], INK_SECONDARY[2]);
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
  y += 15;
  doc.text(`Generated ${dateFormatter.format(new Date())} by Medical Timeline`, MARGIN, y);
  y += 22;
  doc.setDrawColor(200, 188, 165);
  doc.setLineWidth(1);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 28;

  const groups = buildMonthGroups(dated, medicalCase.milestones);

  for (const group of groups) {
    ensureSpace(34);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(INK[0], INK[1], INK[2]);
    doc.text(group.label, MARGIN, y);
    y += 22;

    for (const entry of group.entries) {
      if (entry.kind === "gap") {
        writeLines([`— ${entry.days}-day gap in treatment —`], 10, 16, INK_MUTED);
        y += 6;
        continue;
      }

      if (entry.kind === "milestone") {
        const prefix = entry.milestone.type === "accident" ? "ACCIDENT" : "MILESTONE";
        ensureSpace(18);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12.5);
        doc.setTextColor(RUST[0], RUST[1], RUST[2]);
        doc.text(
          `${prefix}: ${entry.milestone.label} — ${dateFormatter.format(entry.milestone.date)}`,
          MARGIN,
          y
        );
        y += 16;
        if (entry.milestone.notes) {
          const noteLines = doc.splitTextToSize(entry.milestone.notes, CONTENT_WIDTH);
          writeLines(noteLines, 10, 14, INK_SECONDARY);
        }
        y += 10;
        continue;
      }

      const event = entry.event;
      ensureSpace(18);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12.5);
      doc.setTextColor(INK[0], INK[1], INK[2]);
      const dateLabel = isValidDate(event.date) ? dateFormatter.format(event.date) : "Undated";
      doc.text(`${dateLabel} — ${event.recordType || "Record"}`, MARGIN, y);
      y += 17;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(INK_SECONDARY[0], INK_SECONDARY[1], INK_SECONDARY[2]);
      const providerLine = `${
        event.providers.length > 0 ? event.providers.join(", ") : "Provider not specified"
      } · ${event.facility || "Facility not specified"} · ${event.medicineType || "Unspecified"}`;
      const providerLines = doc.splitTextToSize(providerLine, CONTENT_WIDTH);
      writeLines(providerLines, 11, 15, INK_SECONDARY);

      if (event.summary) {
        const summaryLines = doc.splitTextToSize(event.summary, CONTENT_WIDTH);
        writeLines(summaryLines, 10.5, 15, INK);
      }

      if (event.bodyParts.length > 0) {
        writeLines([event.bodyParts.join(" · ")], 9.5, 14, INK_MUTED);
      }

      y += 14;
    }

    y += 8;
  }

  // Page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(INK_SECONDARY[0], INK_SECONDARY[1], INK_SECONDARY[2]);
    doc.text(`Page ${i} of ${pageCount}`, PAGE_WIDTH - MARGIN - 64, PAGE_HEIGHT - 28);
  }

  doc.save(`${sanitizeFileName(medicalCase.name)}.pdf`);
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^\w\- ]+/g, "").trim() || "medical-timeline";
}
