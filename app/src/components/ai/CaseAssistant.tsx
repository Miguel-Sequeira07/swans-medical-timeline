"use client";

import { useState, type FormEvent } from "react";
import type { Case } from "@/types/event";

interface CaseAssistantProps {
  medicalCase: Case;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Floating chat widget, not an inline block at the bottom of the page —
 * it stays reachable while scrolling a long timeline (Garrison has 820
 * events) without pushing the main content around or competing with it
 * for attention. `position: fixed` means this renders on top of
 * everything else regardless of where it sits in the component tree.
 *
 * `open` is controlled by the parent (`page.tsx`) rather than local
 * state, because the page shifts the main content left while the panel
 * is open (see `page.tsx`) — that layout decision needs to know whether
 * the panel is open too, so there's one source of truth instead of two
 * states that could drift out of sync.
 */
export function CaseAssistant({ medicalCase, open, onOpenChange }: CaseAssistantProps) {
  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="AI assistant"
          className="fixed bottom-24 right-4 z-50 flex max-h-[70vh] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-xl border border-paper-line bg-background shadow-xl sm:bottom-28 sm:right-6"
        >
          <div className="flex items-center justify-between border-b border-paper-line px-4 py-3">
            <h3 className="font-display text-sm italic text-foreground">AI assistant</h3>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Close AI assistant"
              className="text-ink-muted hover:text-foreground"
            >
              &#10005;
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <AssistantPanel medicalCase={medicalCase} />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
        className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-2xl text-background shadow-lg transition hover:opacity-90 sm:bottom-6 sm:right-6"
      >
        {open ? <>&#10005;</> : <>&#128172;</>}
      </button>
    </>
  );
}

function AssistantPanel({ medicalCase }: { medicalCase: Case }) {
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
    <div className="flex flex-col gap-4">
      <form onSubmit={handleAsk} className="flex flex-col gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. when was the first MRI?"
          className="w-full rounded border border-paper-line bg-paper px-3 py-1.5 text-sm text-foreground"
        />
        <button
          type="submit"
          disabled={loadingQa}
          className="self-start rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background transition hover:opacity-90 disabled:opacity-50"
        >
          {loadingQa ? "Thinking..." : "Ask"}
        </button>
      </form>
      {answer && (
        <p className="rounded bg-paper border border-paper-line p-3 text-sm text-foreground">{answer}</p>
      )}

      <div className="flex items-center gap-3 border-t border-paper-line pt-3">
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
