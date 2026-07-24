import pptxgen from "pptxgenjs";
import type { Case } from "@/types/event";
import { splitByDateValidity } from "@/lib/timeline";

const ROWS_PER_SLIDE = 9;
const SUMMARY_MAX_CHARS = 150;
// Darker than the web UI's equivalents on purpose — slides get read from
// a distance (projector, screen share), so every tone here is picked for
// contrast against a white/cream background, not palette match.
const INK = "201C16";
const MUTED = "4A4034";
const RUST = "8A3D20";
const HEADER_FILL = "EDE6D2";
const ROW_BANDING_FILL = "F6F1E4";
const BORDER = "CDBF9E";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^\w\- ]+/g, "").trim() || "medical-timeline";
}

/**
 * Renders a slide-ready overview of the case: a title slide, a key-dates
 * slide (if any milestones exist), then paginated table slides of the
 * chronological encounters. Intentionally the "compact" reading of the
 * case — summaries are truncated for slide legibility, the full text
 * lives in the app/PDF export.
 */
export async function exportCaseToPptx(medicalCase: Case): Promise<void> {
  const pptx = new pptxgen();
  pptx.defineLayout({ name: "WIDE", width: 13.33, height: 7.5 });
  pptx.layout = "WIDE";

  const { dated } = splitByDateValidity(medicalCase.events);
  const sorted = [...dated].sort((a, b) => a.date.getTime() - b.date.getTime());

  const title = pptx.addSlide();
  title.background = { color: "FBF8F0" };
  title.addText(medicalCase.name, {
    x: 0.6,
    y: 2.6,
    w: 12.1,
    h: 1.3,
    fontSize: 32,
    bold: true,
    color: INK,
    fontFace: "Georgia",
  });
  const rangeText =
    sorted.length > 0
      ? `${dateFormatter.format(sorted[0].date)} – ${dateFormatter.format(
          sorted[sorted.length - 1].date
        )}  ·  ${sorted.length} medical ${sorted.length === 1 ? "encounter" : "encounters"}`
      : "No dated encounters";
  title.addText(rangeText, { x: 0.6, y: 3.7, w: 12.1, h: 0.5, fontSize: 18, color: MUTED });
  title.addText("Medical Timeline", { x: 0.6, y: 6.7, w: 6, h: 0.4, fontSize: 12, color: RUST });

  const milestones = medicalCase.milestones.filter((m) => !Number.isNaN(m.date.getTime()));
  if (milestones.length > 0) {
    const sortedMilestones = [...milestones].sort((a, b) => a.date.getTime() - b.date.getTime());
    const slide = pptx.addSlide();
    slide.addText("Key Dates", { x: 0.6, y: 0.4, fontSize: 26, bold: true, color: INK });
    slide.addText(
      sortedMilestones.map((m, i) => ({
        text: `${m.label} — ${dateFormatter.format(m.date)}${m.notes ? `: ${m.notes}` : ""}`,
        options: { bullet: true, breakLine: i < sortedMilestones.length - 1 },
      })),
      { x: 0.6, y: 1.4, w: 12.1, h: 5.5, fontSize: 18, color: INK, valign: "top", lineSpacing: 28 }
    );
  }

  const totalSlides = Math.max(1, Math.ceil(sorted.length / ROWS_PER_SLIDE));
  for (let i = 0; i < sorted.length; i += ROWS_PER_SLIDE) {
    const chunk = sorted.slice(i, i + ROWS_PER_SLIDE);
    const slideIndex = i / ROWS_PER_SLIDE + 1;
    const slide = pptx.addSlide();
    slide.addText(
      `Treatment Timeline${totalSlides > 1 ? ` (${slideIndex} of ${totalSlides})` : ""}`,
      { x: 0.4, y: 0.3, fontSize: 20, bold: true, color: INK }
    );

    const headerRow = ["Date", "Provider / Facility", "Type", "Summary"].map((text) => ({
      text,
      options: { bold: true, fill: { color: HEADER_FILL }, color: INK, fontSize: 13 },
    }));

    const dataRows = chunk.map((event, rowIndex) => {
      const rowFill = rowIndex % 2 === 1 ? { color: ROW_BANDING_FILL } : undefined;
      const cell = (text: string) => ({ text, options: rowFill ? { fill: rowFill } : {} });
      return [
        cell(dateFormatter.format(event.date)),
        cell(
          `${event.providers.join(", ") || "Not specified"}\n${
            event.facility || "Facility not specified"
          }`
        ),
        cell(event.recordType || event.medicineType || ""),
        cell(truncate(event.summary, SUMMARY_MAX_CHARS)),
      ];
    });

    slide.addTable([headerRow, ...dataRows], {
      x: 0.4,
      y: 1.0,
      w: 12.5,
      colW: [1.4, 3.0, 1.8, 6.3],
      fontSize: 12,
      color: INK,
      border: { type: "solid", color: BORDER, pt: 0.75 },
      valign: "top",
      autoPage: false,
    });
  }

  if (sorted.length === 0) {
    const slide = pptx.addSlide();
    slide.addText("No dated encounters to display.", {
      x: 0.6,
      y: 3.4,
      w: 12,
      fontSize: 18,
      color: MUTED,
    });
  }

  await pptx.writeFile({ fileName: `${sanitizeFileName(medicalCase.name)}.pptx` });
}
