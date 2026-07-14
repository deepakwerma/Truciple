import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { messages, llmResponses, judgeVerdicts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: conversationId } = await params;

  const [message] = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .limit(1);

  if (!message) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const responses = await db
    .select()
    .from(llmResponses)
    .where(eq(llmResponses.messageId, message.id));

  const [verdict] = await db
    .select()
    .from(judgeVerdicts)
    .where(eq(judgeVerdicts.messageId, message.id));

  return NextResponse.json({
    messageId: message.id,
    prompt: message.prompt,
    responses,
    verdict: verdict ?? null,
  });
}