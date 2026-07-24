import type { Case, MedicalEvent, Milestone } from "@/types/event";

/**
 * Demo data for the timeline (Person B) for local development/testing
 * without going through a real upload. Follows `MedicalEvent[]` /
 * `Milestone[]` exactly — the real app now gets its data from the
 * upload flow in `page.tsx`; this fixture is just a standalone way to
 * exercise the `Timeline` component.
 */

function d(iso: string): Date {
  return new Date(iso);
}

const events: MedicalEvent[] = [
  {
    id: "evt-1",
    date: d("2023-03-14"),
    providers: ["Dr. Alan Whitfield"],
    facility: "Meridian Emergency Center",
    bodyParts: ["Cervical Spine", "Left Shoulder"],
    medicineType: "Emergency Medicine",
    recordType: "ER Visit",
    summary:
      "Patient presented after motor vehicle collision with acute neck pain and reduced range of motion in left shoulder. X-rays taken, no fracture found. Discharged with cervical collar.",
    pdfUrl: "https://example.com/records/evt-1.pdf",
  },
  {
    id: "evt-2",
    date: d("2023-03-17"),
    providers: ["Dr. Renata Osei"],
    facility: "Coastal Orthopedic Group",
    bodyParts: ["Cervical Spine"],
    medicineType: "Orthopedics",
    recordType: "Consultation",
    summary:
      "Follow-up consultation for whiplash-associated disorder. Patient reports persistent stiffness and headaches. Referred to physical therapy, 3x/week for 6 weeks.",
    pdfUrl: "https://example.com/records/evt-2.pdf",
  },
  {
    id: "evt-3",
    date: d("2023-03-24"),
    providers: ["Marcus Ibe, PT"],
    facility: "Restore Physical Therapy",
    bodyParts: ["Cervical Spine", "Left Shoulder"],
    medicineType: "Physical Therapy",
    recordType: "Physical Therapy",
    summary:
      "Initial evaluation. Limited cervical rotation (40% of normal). Began manual therapy and home exercise program.",
  },
  {
    id: "evt-4",
    date: d("2023-04-02"),
    providers: ["Marcus Ibe, PT"],
    facility: "Restore Physical Therapy",
    bodyParts: ["Cervical Spine", "Left Shoulder"],
    medicineType: "Physical Therapy",
    recordType: "Physical Therapy",
    summary: "Session 4 of 18. Mild improvement in range of motion. Pain reported at 6/10.",
  },
  {
    id: "evt-5",
    date: d("2023-04-11"),
    providers: ["Dr. Renata Osei"],
    facility: "Coastal Orthopedic Group",
    bodyParts: ["Left Shoulder"],
    medicineType: "Radiology",
    recordType: "Imaging",
    summary:
      "MRI of left shoulder ordered due to persistent pain unresponsive to conservative treatment. Findings: partial-thickness tear of supraspinatus tendon.",
    pdfUrl: "https://example.com/records/evt-5.pdf",
  },
  {
    id: "evt-6",
    date: d("2023-04-25"),
    providers: ["Dr. Simone Kessler"],
    facility: "Bayview Pain & Spine Institute",
    bodyParts: ["Lower Back", "Lumbar Spine"],
    medicineType: "Pain Management",
    recordType: "Consultation",
    summary:
      "New complaint of radiating low back pain, consistent with delayed-onset soft tissue injury from the same incident. Recommended lumbar MRI and trial of NSAIDs.",
  },
  {
    id: "evt-7",
    date: d("2023-05-03"),
    providers: ["Marcus Ibe, PT"],
    facility: "Restore Physical Therapy",
    bodyParts: ["Cervical Spine", "Left Shoulder", "Lower Back"],
    medicineType: "Physical Therapy",
    recordType: "Physical Therapy",
    summary: "Session 9 of 18. Added lumbar stabilization exercises. Shoulder pain now intermittent.",
  },
  {
    id: "evt-8",
    date: d("2023-05-19"),
    providers: ["Dr. Simone Kessler"],
    facility: "Bayview Pain & Spine Institute",
    bodyParts: ["Lumbar Spine"],
    medicineType: "Radiology",
    recordType: "Imaging",
    summary:
      "Lumbar MRI: mild disc bulge at L4-L5, no herniation. Correlates with reported mechanism of injury.",
    pdfUrl: "https://example.com/records/evt-8.pdf",
  },
  {
    id: "evt-9",
    date: d("2023-06-06"),
    providers: ["Dr. Renata Osei"],
    facility: "Coastal Orthopedic Group",
    bodyParts: ["Left Shoulder"],
    medicineType: "Orthopedics",
    recordType: "Consultation",
    summary:
      "Shoulder pain has plateaued despite therapy. Discussed arthroscopic surgical repair given MRI findings and lack of improvement after 10+ weeks conservative care.",
  },
  {
    id: "evt-10",
    date: d("2023-06-06"),
    providers: ["Dr. Renata Osei"],
    facility: "Coastal Orthopedic Group",
    bodyParts: ["Left Shoulder"],
    medicineType: "Orthopedics",
    recordType: "Lab Result",
    summary: "Pre-operative bloodwork and clearance completed same day as surgical consult.",
  },
  {
    id: "evt-11",
    date: d("2023-06-21"),
    providers: ["Dr. Renata Osei", "Dr. Priya Vantana"],
    facility: "Coastal Surgical Center",
    bodyParts: ["Left Shoulder"],
    medicineType: "Orthopedics",
    recordType: "Surgery",
    summary:
      "Arthroscopic rotator cuff repair, left shoulder. Procedure without complication. Sling for 4 weeks, PT to resume post-op day 10.",
    pdfUrl: "https://example.com/records/evt-11.pdf",
  },
  {
    id: "evt-12",
    date: d("2023-07-05"),
    providers: ["Marcus Ibe, PT"],
    facility: "Restore Physical Therapy",
    bodyParts: ["Left Shoulder"],
    medicineType: "Physical Therapy",
    recordType: "Physical Therapy",
    summary: "Post-operative session 1. Passive range of motion only per surgical protocol.",
  },
  {
    id: "evt-13",
    date: d("2023-07-19"),
    providers: ["Marcus Ibe, PT"],
    facility: "Restore Physical Therapy",
    bodyParts: ["Left Shoulder", "Lower Back"],
    medicineType: "Physical Therapy",
    recordType: "Physical Therapy",
    summary: "Post-operative session 4. Cleared for active-assisted range of motion. Back pain stable.",
  },
  {
    id: "evt-14",
    date: d("2023-08-08"),
    providers: ["Dr. Renata Osei"],
    facility: "Coastal Orthopedic Group",
    bodyParts: ["Left Shoulder"],
    medicineType: "Orthopedics",
    recordType: "Consultation",
    summary: "6-week post-op check. Incisions healed well. Advancing PT to light strengthening.",
  },
  {
    id: "evt-15",
    date: d("2023-08-23"),
    providers: ["Marcus Ibe, PT"],
    facility: "Restore Physical Therapy",
    bodyParts: ["Left Shoulder", "Cervical Spine"],
    medicineType: "Physical Therapy",
    recordType: "Physical Therapy",
    summary: "Session 22 overall. Cervical symptoms nearly resolved. Shoulder strength at 70% of baseline.",
  },
  {
    id: "evt-16",
    date: d("2023-09-14"),
    providers: ["Dr. Simone Kessler"],
    facility: "Bayview Pain & Spine Institute",
    bodyParts: ["Lower Back"],
    medicineType: "Chiropractic",
    recordType: "Office Visit",
    summary: "Referred for adjunct chiropractic care for residual lumbar stiffness. Good response to first session.",
  },
  {
    id: "evt-17",
    date: d("2023-10-02"),
    providers: ["Marcus Ibe, PT"],
    facility: "Restore Physical Therapy",
    bodyParts: ["Left Shoulder"],
    medicineType: "Physical Therapy",
    recordType: "Physical Therapy",
    summary: "Session 30 overall, final scheduled session. Shoulder strength at 90% of baseline, discharged from PT.",
  },
  {
    id: "evt-18",
    date: d("2023-10-02"),
    providers: [],
    facility: "Restore Physical Therapy",
    bodyParts: ["Left Shoulder"],
    medicineType: "Physical Therapy",
    recordType: "Discharge Summary",
    summary:
      "Discharge summary: 30 sessions completed over 6 months. Functional goals met. Home maintenance program provided.",
  },
  {
    id: "evt-19",
    date: d("2023-11-15"),
    providers: ["Dr. Renata Osei"],
    facility: "Coastal Orthopedic Group",
    bodyParts: ["Left Shoulder"],
    medicineType: "Orthopedics",
    recordType: "Consultation",
    summary:
      "Final orthopedic follow-up. Near full range of motion, occasional soreness with overhead activity. Placed at maximum medical improvement.",
    pdfUrl: "https://example.com/records/evt-19.pdf",
  },
  {
    id: "evt-20",
    date: d("2023-11-15"),
    providers: ["Dr. Simone Kessler"],
    facility: "Bayview Pain & Spine Institute",
    bodyParts: ["Lower Back"],
    medicineType: "Pain Management",
    recordType: "Consultation",
    summary: "Low back pain reduced to occasional mild discomfort, no longer limiting daily activities. MMI for lumbar spine.",
  },
  {
    id: "evt-21",
    date: d("2024-02-06"),
    providers: ["Dr. Renata Osei"],
    facility: "Coastal Orthopedic Group",
    bodyParts: ["Left Shoulder"],
    medicineType: "Orthopedics",
    recordType: "Office Visit",
    summary: "Routine check-in requested by attorney for litigation purposes. No new complaints, condition stable.",
  },
  {
    id: "evt-22",
    // Missing date in the source Excel — must not break the timeline,
    // should show up in a separate section instead of being silently dropped.
    date: new Date(NaN),
    providers: ["Dr. Simone Kessler"],
    facility: "Bayview Pain & Spine Institute",
    bodyParts: ["Lower Back"],
    medicineType: "Pain Management",
    recordType: "Lab Result",
    summary: "Bloodwork ordered as part of pain management workup; encounter date illegible on scanned record.",
  },
];

const milestones: Milestone[] = [
  {
    id: "milestone-accident",
    label: "Car accident",
    date: d("2023-03-14"),
    type: "accident",
    notes: "Rear-end collision on Route 9, Northbrook.",
  },
  {
    id: "milestone-mmi",
    label: "Maximum medical improvement (MMI)",
    date: d("2023-11-15"),
    type: "custom",
    notes: "Both primary providers consider treatment stabilized.",
  },
];

export const mockCase: Case = {
  id: "case-mock-001",
  name: "Demo case — Doe v. Sample Trucking Co.",
  events,
  milestones,
  createdAt: d("2023-03-14"),
  updatedAt: d("2024-02-06"),
};
