"use client";

import { useState } from "react";
import { ExcelUploader } from "@/components/upload/ExcelUploader";
import { Timeline } from "@/components/timeline/Timeline";
import { MilestoneForm } from "@/components/milestones/MilestoneForm";
import { CaseAssistant } from "@/components/ai/CaseAssistant";
import type { Case, MedicalEvent, Milestone } from "@/types/event";

export default function Home() {
  const [medicalCase, setMedicalCase] = useState<Case | null>(null);

  function handleParsed(events: MedicalEvent[], fileName: string) {
    const now = new Date();
    setMedicalCase({
      id: crypto.randomUUID(),
      name: fileName.replace(/\.xlsx?$/i, ""),
      events,
      milestones: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  function addMilestone(milestone: Milestone) {
    setMedicalCase((current) =>
      current
        ? {
            ...current,
            milestones: [...current.milestones, milestone],
            updatedAt: new Date(),
          }
        : current
    );
  }

  function removeMilestone(id: string) {
    setMedicalCase((current) =>
      current
        ? {
            ...current,
            milestones: current.milestones.filter((m) => m.id !== id),
            updatedAt: new Date(),
          }
        : current
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-12">
      <header>
        <h1 className="text-2xl font-semibold">Medical Timeline</h1>
        <p className="text-sm text-zinc-500">
          Carrega o Excel de um caso para gerar a timeline de tratamento.
        </p>
      </header>

      {!medicalCase ? (
        <ExcelUploader onParsed={handleParsed} />
      ) : (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium">{medicalCase.name}</h2>
              <p className="text-sm text-zinc-500">
                {medicalCase.events.length} eventos
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMedicalCase(null)}
              className="text-sm text-zinc-500 underline"
            >
              Carregar outro ficheiro
            </button>
          </div>
          <MilestoneForm
            milestones={medicalCase.milestones}
            onAdd={addMilestone}
            onRemove={removeMilestone}
          />
          <Timeline case={medicalCase} />
          <CaseAssistant medicalCase={medicalCase} />
        </section>
      )}
    </main>
  );
}
