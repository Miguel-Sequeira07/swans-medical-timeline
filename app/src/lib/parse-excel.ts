import * as XLSX from "xlsx";
import type { MedicalEvent } from "@/types/event";

/**
 * Regra de ouro do desafio: isto tem de funcionar com qualquer Excel neste
 * formato, não só com o ficheiro de amostra. Não assumir valores fixos de
 * provider/facility/medicine type — só a forma das colunas é garantida.
 *
 * "Link To Pdf" nos ficheiros reais do hackathon não é uma célula de texto
 * com o URL — é a palavra "pdf" com um hyperlink por baixo (cell.l.Target).
 * `sheet_to_json` ignora hyperlinks, por isso lemos célula a célula.
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
    throw new Error("A folha está vazia ou não tem um intervalo de dados válido.");
  }

  const range = XLSX.utils.decode_range(sheet["!ref"]);
  const headers = readRowCells(sheet, range.s.r, range).map((c) => c.text.trim());

  const missing = EXPECTED_COLUMNS.filter((c) => !headers.includes(c));
  if (missing.length > 0) {
    throw new Error(
      `Excel fora do formato esperado. Colunas em falta: ${missing.join(", ")}`
    );
  }

  const events: MedicalEvent[] = [];
  for (let r = range.s.r + 1; r <= range.e.r; r++) {
    const cells = readRowCells(sheet, r, range);
    const get = (name: string): CellInfo | undefined => cells[headers.indexOf(name)];

    const summary = get("Summary")?.text.trim() ?? "";
    const encounterDate = get("Encounter Date");
    if (!summary && !encounterDate?.text) continue; // linha em branco, ignora

    const pdfCell = get("Link To Pdf");

    events.push({
      id: `evt-${r}`,
      date: parseDate(encounterDate?.raw ?? encounterDate?.text),
      providers: splitList(get("Primary Provider")?.text),
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

function parseDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date(NaN);
}
