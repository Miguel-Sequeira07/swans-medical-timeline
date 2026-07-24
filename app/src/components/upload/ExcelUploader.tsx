"use client";

import { useRef, useState } from "react";
import { parseExcelFile } from "@/lib/parse-excel";
import type { MedicalEvent } from "@/types/event";

interface ExcelUploaderProps {
  onParsed: (events: MedicalEvent[], fileName: string) => void;
}

export function ExcelUploader({ onParsed }: ExcelUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setLoading(true);
    try {
      const events = await parseExcelFile(file);
      if (events.length === 0) {
        setError("This Excel file has no rows we could recognize.");
        return;
      }
      onParsed(events, file.name);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "We couldn't read this file."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-paper-line bg-paper/60 p-10 text-center">
      <p className="font-display text-lg italic text-foreground">Upload the case Excel</p>
      <p className="max-w-md text-sm text-ink-muted">
        One row per medical encounter. Expected columns: Encounter Date,
        Primary Provider, Facility, Body Parts, Medicine Type, Record Type,
        Summary, Link To Pdf.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Processing..." : "Choose .xlsx file"}
      </button>
      {error && (
        <p className="max-w-md text-sm text-accent-rust" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
