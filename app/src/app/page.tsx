"use client";

import { useState } from "react";
import { ExcelUploader } from "@/components/upload/ExcelUploader";
import { Timeline } from "@/components/timeline/Timeline";
import { MilestoneForm } from "@/components/milestones/MilestoneForm";
import { CaseAssistant } from "@/components/ai/CaseAssistant";
import { PreviousCases } from "@/components/cases/PreviousCases";
import { useCases } from "@/hooks/use-cases";
import { deleteCase, saveCase } from "@/lib/storage";
import type { Case, MedicalEvent, Milestone } from "@/types/event";

export default function Home() {
  const [medicalCase, setMedicalCase] = useState<Case | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const previousCases = useCases();

  function persist(next: Case) {
    setSaveFailed(!saveCase(next));
    setMedicalCase(next);
  }

  function handleParsed(events: MedicalEvent[], fileName: string) {
    const now = new Date();
    persist({
      id: crypto.randomUUID(),
      name: fileName.replace(/\.xlsx?$/i, ""),
      events,
      milestones: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  function addMilestone(milestone: Milestone) {
    if (!medicalCase) return;
    persist({
      ...medicalCase,
      milestones: [...medicalCase.milestones, milestone],
      updatedAt: new Date(),
    });
  }

  function removeMilestone(id: string) {
    if (!medicalCase) return;
    persist({
      ...medicalCase,
      milestones: medicalCase.milestones.filter((m) => m.id !== id),
      updatedAt: new Date(),
    });
  }

  function updateEventSummary(eventId: string, summary: string) {
    if (!medicalCase) return;
    persist({
      ...medicalCase,
      events: medicalCase.events.map((event) =>
        event.id === eventId ? { ...event, summary } : event
      ),
      updatedAt: new Date(),
    });
  }

  function handleDeleteCase(id: string) {
    deleteCase(id);
    if (medicalCase?.id === id) setMedicalCase(null);
  }

  return (
    <>
      {/* Shifts left (via right padding on the centering wrapper) instead of
          letting the floating AI panel overlap it, while the panel is open. */}
      <div
        className={`flex flex-1 justify-center transition-[padding] duration-300 ${
          assistantOpen ? "sm:pr-[27rem]" : ""
        }`}
      >
        <main className="flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
          {!medicalCase && (
            <header>
              <h1 className="font-display text-2xl italic text-foreground">Medical Timeline</h1>
              <p className="text-sm text-ink-muted">
                Upload a case Excel to generate a treatment timeline.
              </p>
            </header>
          )}

          {!medicalCase ? (
            <div className="flex flex-col gap-8">
              <ExcelUploader onParsed={handleParsed} />
              <PreviousCases
                cases={previousCases}
                onOpen={setMedicalCase}
                onDelete={handleDeleteCase}
              />
            </div>
          ) : (
            <section className="flex flex-col gap-4">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setMedicalCase(null)}
                  className="text-sm text-ink-muted underline"
                >
                  Load another file
                </button>
              </div>
              {saveFailed && (
                <p className="text-xs text-amber-600">
                  Couldn&apos;t save this case in this browser (storage full).
                  The timeline still works, it just won&apos;t be available
                  after a page reload.
                </p>
              )}
              <MilestoneForm
                milestones={medicalCase.milestones}
                onAdd={addMilestone}
                onRemove={removeMilestone}
              />
              <Timeline case={medicalCase} onUpdateEventSummary={updateEventSummary} />
            </section>
          )}
        </main>
      </div>

      {medicalCase && (
        <CaseAssistant
          medicalCase={medicalCase}
          open={assistantOpen}
          onOpenChange={setAssistantOpen}
        />
      )}
    </>
  );
}
