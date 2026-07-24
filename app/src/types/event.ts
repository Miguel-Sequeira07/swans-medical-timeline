/**
 * Shared schema — source of truth for the data.
 * Agreed between both people in Phase 0. Changes here affect whoever
 * consumes (timeline/UX) and whoever produces (parsing/AI) the data —
 * tell the other person before changing it.
 */

/** One row of the provided Excel, exactly as it comes from the file. */
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

/** A medical encounter, already normalized and ready for the timeline. */
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

/** A manual milestone added by the user (not from the Excel). */
export interface Milestone {
  id: string;
  label: string;
  date: Date;
  type: "accident" | "custom";
  notes?: string;
}

/** A complete case: Excel events + manual milestones + metadata. */
export interface Case {
  id: string;
  name: string;
  events: MedicalEvent[];
  milestones: Milestone[];
  createdAt: Date;
  updatedAt: Date;
}
