import { NextResponse } from "next/server";
import { askCaseQuestion } from "@/lib/ai";
import { reviveCase } from "@/lib/revive-case";

export async function POST(req: Request) {
  const body = await req.json();
  const { case: rawCase, question } = body as {
    case: unknown;
    question: string;
  };

  if (!question?.trim()) {
    return NextResponse.json({ error: "Missing question." }, { status: 400 });
  }

  try {
    const result = await askCaseQuestion(reviveCase(rawCase), question);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error contacting the AI." },
      { status: 500 }
    );
  }
}
