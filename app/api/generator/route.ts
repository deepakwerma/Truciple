import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { conversations, messages, llmResponses, guestIpUsage } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateAll } from "@/lib/llm/generateAll";

const GUEST_LIMIT = 3;
const GUEST_WINDOW_DAYS = 30;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const prompt = body?.prompt;
  const conversationId = body?.conversationId as string | undefined;

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }
  if (prompt.length > 2000) {
    return NextResponse.json({ error: "Prompt too long" }, { status: 400 });
  }

  const { userId } = await auth();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  // guest gate — only applies if not signed in
  if (!userId) {
    const [row] = await db.select().from(guestIpUsage).where(eq(guestIpUsage.ipAddress, ip));

    if (row) {
      const daysSinceLastUse = (Date.now() - new Date(row.lastUsedAt!).getTime()) / 86400000;

      if (daysSinceLastUse > GUEST_WINDOW_DAYS) {
        await db
          .update(guestIpUsage)
          .set({ messageCount: 0, lastUsedAt: new Date() })
          .where(eq(guestIpUsage.ipAddress, ip));
      } else if (row.messageCount >= GUEST_LIMIT) {
        return NextResponse.json(
          { error: "Free limit reached. Sign up to continue." },
          { status: 429 }
        );
      }
    }
  }

  // resolve or create conversation
  let convoId = conversationId;
  if (!convoId) {
    const [newConvo] = await db
      .insert(conversations)
      .values(userId ? { userId } : { guestIp: ip })
      .returning({ id: conversations.id });
    convoId = newConvo.id;
  }

  // insert the message
  const [message] = await db
    .insert(messages)
    .values({ conversationId: convoId, prompt })
    .returning({ id: messages.id });

  // generate all responses
  const results = await generateAll(prompt);

  // save each response
  const savedResponses = await Promise.all(
    results.map((r) =>
      db
        .insert(llmResponses)
        .values({
          messageId: message.id,
          provider: r.provider,
          providerUsed: r.provider,
          responseText: r.status === "success" ? r.text : null,
          status: r.status,
          latencyMs: r.latencyMs,
        })
        .returning()
    )
  );

  // update guest usage AFTER successful generation
  if (!userId) {
    await db
      .insert(guestIpUsage)
      .values({ ipAddress: ip, messageCount: 1, lastUsedAt: new Date() })
      .onConflictDoUpdate({
        target: guestIpUsage.ipAddress,
        set: { messageCount: sql`${guestIpUsage.messageCount} + 1`, lastUsedAt: new Date() },
      });
  }

  return NextResponse.json({
    conversationId: convoId,
    messageId: message.id,
    responses: savedResponses.flat(),
  });
}