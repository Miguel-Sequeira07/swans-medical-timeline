/**
 * Schema partilhado — fonte da verdade dos dados.
 * Combinado entre as duas pessoas na Fase 0. Alterações aqui afetam
 * quem consome (timeline/UX) e quem produz (parsing/AI) os dados —
 * avisar o outro antes de mudar.
 */

/** Uma linha do Excel fornecido, tal como vem do ficheiro. */
export interface RawMedicalEventRow {
  "Encounter Date": string;
  "Primary Provider": string;
  Facility: string;
  "Body Parts": string;
  "Medicine Type": string;
  "Record Type": string;
  Summary: string;
  "Link To Pdf"?: string;
}

/** Um encontro médico, já normalizado e pronto para a timeline. */
export interface MedicalEvent {
  id: string;
  date: Date;
  providers: string[];
  facility: string;
  bodyParts: string[];
  medicineType: string;
  recordType: string;
  summary: string;
  pdfUrl?: string;
}

/** Marco manual adicionado pelo utilizador (não vem do Excel). */
export interface Milestone {
  id: string;
  label: string;
  date: Date;
  type: "accident" | "custom";
  notes?: string;
}

/** Um caso completo: eventos do Excel + marcos manuais + metadados. */
export interface Case {
  id: string;
  name: string;
  events: MedicalEvent[];
  milestones: Milestone[];
  createdAt: Date;
  updatedAt: Date;
}
