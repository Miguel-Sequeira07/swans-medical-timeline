import { NextResponse } from "next/server";
import { rephraseSummary } from "@/lib/ai";

export async function POST(req: Request) {
  const body = await req.json();
  const { summary, instruction } = body as {
    summary: string;
    instruction?: string;
  };

  if (!summary?.trim()) {
    return NextResponse.json({ error: "Falta o texto a reescrever." }, { status: 400 });
  }

  try {
    const rephrased = await rephraseSummary(summary, instruction);
    return NextResponse.json({ rephrased });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao contactar a AI." },
      { status: 500 }
    );
  }
}
