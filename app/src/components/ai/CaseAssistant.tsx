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
      if (!res.ok) throw new Error(data.error ?? "Unknown error");
      setAnswer(data.answer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't get an answer.");
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
      if (!res.ok) throw new Error(data.error ?? "Unknown error");
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't generate the summary.");
    } finally {
      setLoadingSummary(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-paper-line bg-paper/60 p-4">
      <h3 className="font-display text-sm italic text-foreground">AI assistant</h3>

      <form onSubmit={handleAsk} className="flex flex-wrap gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. when was the first MRI?"
          className="min-w-64 flex-1 rounded border border-paper-line bg-paper px-3 py-1.5 text-sm text-foreground"
        />
        <button
          type="submit"
          disabled={loadingQa}
          className="rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background transition hover:opacity-90 disabled:opacity-50"
        >
          {loadingQa ? "Thinking..." : "Ask"}
        </button>
      </form>
      {answer && (
        <p className="rounded bg-paper border border-paper-line p-3 text-sm text-foreground">{answer}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSummarize}
          disabled={loadingSummary}
          className="rounded-full border border-paper-line px-4 py-1.5 text-xs font-medium text-foreground transition hover:border-foreground/40 disabled:opacity-50"
        >
          {loadingSummary ? "Generating..." : "Generate treatment summary"}
        </button>
      </div>
      {summary && (
        <p className="rounded bg-paper border border-paper-line p-3 text-sm text-foreground">{summary}</p>
      )}

      {error && (
        <p className="text-sm text-accent-rust" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
