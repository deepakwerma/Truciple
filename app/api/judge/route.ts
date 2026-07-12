import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { messages, llmResponses, judgeVerdicts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { judge } from "@/lib/llm/judge";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const messageId = body?.messageId;

  if (!messageId || typeof messageId !== "string") {
    return NextResponse.json({ error: "messageId is required" }, { status: 400 });
  }

  // get the original prompt
  const [message] = await db.select().from(messages).where(eq(messages.id, messageId));
  if (!message) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  // get only the successful responses for this message
  const allResponses = await db
    .select()
    .from(llmResponses)
    .where(eq(llmResponses.messageId, messageId));

  const successful = allResponses.filter((r) => r.status === "success" && r.responseText);

  if (successful.length < 2) {
    return NextResponse.json(
      { error: "Not enough successful responses to judge (need at least 2)" },
      { status: 400 }
    );
  }

  const contestants = successful.map((r) => ({
    provider: r.provider,
    text: r.responseText!,
  }));

  const start = Date.now();

  let evaluation, labelToProvider;
  try {
    const result = await judge(message.prompt, contestants);
    evaluation = result.evaluation;
    labelToProvider = result.labelToProvider;
  } catch (e) {
    return NextResponse.json(
      { error: `Judge failed: ${(e as Error).message}` },
      { status: 502 }
    );
  }

  const latencyMs = Date.now() - start;

  // map winning label back to the real llm_responses row
  const winnerProvider = labelToProvider[evaluation.winner];
  const winnerRow = successful.find((r) => r.provider === winnerProvider);

  // remap scores from labels (responseA/B/C/D) back to real provider names
  const scoresByProvider: Record<string, unknown> = {};
  for (const [label, providerName] of Object.entries(labelToProvider)) {
    scoresByProvider[providerName] = evaluation.scores[label];
  }

  const [verdict] = await db
    .insert(judgeVerdicts)
    .values({
      messageId,
      winnerResponseId: winnerRow?.id ?? null,
      reasoning: evaluation.reasoning,
      judgeModel: "openai/gpt-oss-120b",
      latencyMs,
      scores: scoresByProvider,
    })
    .returning();

  return NextResponse.json({
    verdict,
    winnerProvider,
    finalAnswer: evaluation.finalAnswer,
    scores: scoresByProvider,
  });
}