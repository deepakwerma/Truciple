import {
  pgTable,
  text,
  uuid,
  integer,
  timestamp,
  date,
  serial,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const deviceUsage = pgTable("device_usage", {
  deviceToken: text("device_token").primaryKey(),
  ipAddress: text("ip_address").notNull(),
  userId: text("user_id").references(() => users.id),
  messageCount: integer("message_count").notNull().default(0),
  firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).defaultNow(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }).defaultNow(),
});

export const ipUsage = pgTable("ip_usage", {
  ipAddress: text("ip_address").primaryKey(),
  messageCount: integer("message_count").notNull().default(0),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }).defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  deviceToken: text("device_token").notNull(),
  userId: text("user_id").references(() => users.id),
  title: text("title"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  prompt: text("prompt").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const llmResponses = pgTable("llm_responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  messageId: uuid("message_id")
    .notNull()
    .references(() => messages.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  providerUsed: text("provider_used"),
  responseText: text("response_text"),
  status: text("status").notNull(),
  latencyMs: integer("latency_ms"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const judgeVerdicts = pgTable("judge_verdicts", {
  id: uuid("id").primaryKey().defaultRandom(),
  messageId: uuid("message_id")
    .notNull()
    .references(() => messages.id, { onDelete: "cascade" }),
  winnerResponseId: uuid("winner_response_id").references(
    () => llmResponses.id,
  ),
  reasoning: text("reasoning"),
  scores: jsonb("scores"),
  judgeModel: text("judge_model").notNull(),
  latencyMs: integer("latency_ms"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const apiUsage = pgTable(
  "api_usage",
  {
    id: serial("id").primaryKey(),
    provider: text("provider").notNull(),
    date: date("date").notNull().defaultNow(),
    callCount: integer("call_count").notNull().default(0),
  },
  (table) => ({
    providerDateUnique: unique("provider_date_unique").on(
      table.provider,
      table.date,
    ),
  }),
);
