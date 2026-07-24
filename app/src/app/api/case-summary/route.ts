import { NextResponse } from "next/server";
import { summarizeTreatment } from "@/lib/ai";
import { reviveCase } from "@/lib/revive-case";

export async function POST(req: Request) {
  const body = await req.json();
  const { case: rawCase } = body as { case: unknown };

  try {
    const summary = await summarizeTreatment(reviveCase(rawCase));
    return NextResponse.json({ summary });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error contacting the AI." },
      { status: 500 }
    );
  }
}
