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
        setError("O Excel não tem nenhuma linha com dados reconhecíveis.");
        return;
      }
      onParsed(events, file.name);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível ler este ficheiro."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
      <p className="text-lg font-medium">Carrega o Excel do caso</p>
      <p className="max-w-md text-sm text-zinc-500">
        Uma linha por encontro médico. Colunas esperadas: Encounter Date,
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
        className="rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {loading ? "A processar..." : "Escolher ficheiro .xlsx"}
      </button>
      {error && (
        <p className="max-w-md text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
