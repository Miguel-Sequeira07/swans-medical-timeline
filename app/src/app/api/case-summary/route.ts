import { NextResponse } from "next/server";
import { summarizeTreatment, toFriendlyAiError } from "@/lib/ai";
import { reviveCase } from "@/lib/revive-case";

export async function POST(req: Request) {
  const body = await req.json();
  const { case: rawCase } = body as { case: unknown };

  try {
    const summary = await summarizeTreatment(reviveCase(rawCase));
    return NextResponse.json({ summary });
  } catch (err) {
    return NextResponse.json({ error: toFriendlyAiError(err) }, { status: 500 });
  }
}
