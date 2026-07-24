import * as XLSX from "xlsx";
import type { MedicalEvent } from "@/types/event";

/**
 * Golden rule of the challenge: this has to work with any Excel in this
 * format, not just the sample file. Don't assume fixed values for
 * provider/facility/medicine type — only the shape of the columns is
 * guaranteed.
 *
 * "Link To Pdf" in the real hackathon files isn't a text cell with the
 * URL — it's the word "pdf" with a hyperlink underneath (cell.l.Target).
 * `sheet_to_json` ignores hyperlinks, so we read cell by cell instead.
 */
const EXPECTED_COLUMNS = [
  "Encounter Date",
  "Primary Provider",
  "Facility",
  "Body Parts",
  "Medicine Type",
  "Record Type",
  "Summary",
  "Link To Pdf",
] as const;

interface CellInfo {
  text: string;
  raw: unknown;
  link?: string;
}

export async function parseExcelFile(file: File): Promise<MedicalEvent[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet?.["!ref"]) {
    throw new Error("This sheet is empty or has no valid data range.");
  }

  const range = XLSX.utils.decode_range(sheet["!ref"]);
  const headers = readRowCells(sheet, range.s.r, range).map((c) => c.text.trim());

  const missing = EXPECTED_COLUMNS.filter((c) => !headers.includes(c));
  if (missing.length > 0) {
    throw new Error(
      `This Excel doesn't match the expected format. Missing columns: ${missing.join(", ")}`
    );
  }

  const events: MedicalEvent[] = [];
  for (let r = range.s.r + 1; r <= range.e.r; r++) {
    const cells = readRowCells(sheet, r, range);
    const get = (name: string): CellInfo | undefined => cells[headers.indexOf(name)];

    const summary = get("Summary")?.text.trim() ?? "";
    const encounterDate = get("Encounter Date");
    if (!summary && !encounterDate?.text) continue; // blank row, skip

    const pdfCell = get("Link To Pdf");

    events.push({
      id: `evt-${r}`,
      date: parseDate(encounterDate?.raw ?? encounterDate?.text),
      providers: splitProviders(get("Primary Provider")?.text),
      facility: get("Facility")?.text.trim() ?? "",
      bodyParts: splitList(get("Body Parts")?.text),
      medicineType: get("Medicine Type")?.text.trim() ?? "",
      recordType: get("Record Type")?.text.trim() ?? "",
      summary,
      pdfUrl: pdfCell?.link ?? (pdfCell?.text.trim() || undefined),
    });
  }

  return events;
}

function readRowCells(
  sheet: XLSX.WorkSheet,
  row: number,
  range: XLSX.Range
): CellInfo[] {
  const cells: CellInfo[] = [];
  for (let c = range.s.c; c <= range.e.c; c++) {
    const addr = XLSX.utils.encode_cell({ r: row, c });
    const cell = sheet[addr] as XLSX.CellObject | undefined;
    cells.push({
      text: cell?.w ?? (cell?.v != null ? String(cell.v) : ""),
      raw: cell?.v,
      link: cell?.l?.Target,
    });
  }
  return cells;
}

function splitList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(/[;,]/)
    .map((v) => v.trim())
    .filter(Boolean);
}

/**
 * Providers can't use the generic comma-or-semicolon split: real names
 * come as "Astrit H. Hajdari, MD" (comma before the credential) and
 * multiple providers are joined with ";" — e.g. "Erik C. Schumann, PA-C;
 * William L. Ferber, MD". Splitting on comma too would cut "MD" off as
 * its own fake provider. Confirmed across all 5 hackathon sample files:
 * "Primary Provider" always uses ";" between people, never a bare comma.
 */
function splitProviders(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(";")
    .map((v) => v.trim())
    .filter(Boolean);
}

function parseDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date(NaN);
}
