"use client";

import { useState, type FormEvent } from "react";
import type { Case } from "@/types/event";

interface CaseAssistantProps {
  medicalCase: Case;
}

export function CaseAssistant({ medicalCase }: CaseAssistantProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [loadingQa, setLoadingQa] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAsk(e: FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    setError(null);
    setLoadingQa(true);
    setAnswer(null);
    try {
      const res = await fetch("/api/case-qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ case: medicalCase, question }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro desconhecido");
      setAnswer(data.answer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível obter resposta.");
    } finally {
      setLoadingQa(false);
    }
  }

  async function handleSummarize() {
    setError(null);
    setLoadingSummary(true);
    setSummary(null);
    try {
      const res = await fetch("/api/case-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ case: medicalCase }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro desconhecido");
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível gerar o resumo.");
    } finally {
      setLoadingSummary(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <h3 className="text-sm font-medium">Assistente AI</h3>

      <form onSubmit={handleAsk} className="flex flex-wrap gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ex: quando foi o primeiro MRI?"
          className="min-w-64 flex-1 rounded border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-black"
        />
        <button
          type="submit"
          disabled={loadingQa}
          className="rounded-full bg-black px-4 py-1.5 text-xs font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {loadingQa ? "A pensar..." : "Perguntar"}
        </button>
      </form>
      {answer && (
        <p className="rounded bg-zinc-50 p-3 text-sm dark:bg-zinc-900">{answer}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSummarize}
          disabled={loadingSummary}
          className="rounded-full border border-zinc-300 px-4 py-1.5 text-xs font-medium disabled:opacity-50 dark:border-zinc-700"
        >
          {loadingSummary ? "A gerar..." : "Gerar resumo do tratamento"}
        </button>
      </div>
      {summary && (
        <p className="rounded bg-zinc-50 p-3 text-sm dark:bg-zinc-900">{summary}</p>
      )}

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
