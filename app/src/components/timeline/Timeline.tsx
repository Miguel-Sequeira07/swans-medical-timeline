import type { Case } from "@/types/event";

/**
 * Ponto de partida da Pessoa B (Timeline & UX).
 * Recebe um Case já parseado (ver src/types/event.ts e src/lib/parse-excel.ts)
 * e é responsável por renderizar o "floor" do desafio: uma timeline clara
 * onde cada evento é visível. A partir daqui: filtros, agrupamento,
 * vista compacta/detalhada, export, etc. (ver README, secção "Ceiling").
 */
export function Timeline({ case: medicalCase }: { case: Case }) {
  const events = [...medicalCase.events].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  return (
    <ol className="flex flex-col gap-4">
      {events.map((event) => (
        <li key={event.id} className="border-l-2 border-blue-500 pl-4">
          <p className="text-sm text-gray-500">
            {event.date.toLocaleDateString()}
          </p>
          <p className="font-medium">
            {event.recordType} · {event.providers.join(", ")}
          </p>
          <p className="text-sm text-gray-700">{event.summary}</p>
        </li>
      ))}
    </ol>
  );
}
