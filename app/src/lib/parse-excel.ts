import * as XLSX from "xlsx";
import type { MedicalEvent, RawMedicalEventRow } from "@/types/event";

/**
 * Regra de ouro do desafio: isto tem de funcionar com qualquer Excel neste
 * formato, não só com o ficheiro de amostra. Não assumir valores fixos de
 * provider/facility/medicine type — só a forma das colunas é garantida.
 */
export async function parseExcelFile(file: File): Promise<MedicalEvent[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<RawMedicalEventRow>(sheet, {
    defval: "",
  });

  return rows.map((row, index) => normalizeRow(row, index));
}

function normalizeRow(row: RawMedicalEventRow, index: number): MedicalEvent {
  return {
    id: `evt-${index}-${row["Encounter Date"]}`,
    date: parseDate(row["Encounter Date"]),
    providers: splitList(row["Primary Provider"]),
    facility: row["Facility"]?.trim() ?? "",
    bodyParts: splitList(row["Body Parts"]),
    medicineType: row["Medicine Type"]?.trim() ?? "",
    recordType: row["Record Type"]?.trim() ?? "",
    summary: row["Summary"]?.trim() ?? "",
    pdfUrl: row["Link To Pdf"]?.trim() || undefined,
  };
}

function splitList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(/[;,]/)
    .map((v) => v.trim())
    .filter(Boolean);
}

function parseDate(value: string | Date | undefined): Date {
  if (value instanceof Date) return value;
  if (!value) return new Date(NaN);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date(NaN) : parsed;
}
