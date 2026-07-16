# Trucible

**A multi-model LLM arena that runs the same prompt through multiple models in parallel, then uses an independent judge model to score, rank, and synthesize a single best answer.**

Live: [truciple.deepakverma.dev](https://truciple.deepakverma.dev)

Instead of trusting one model's answer, Trucible runs your prompt through 3 LLMs in parallel and has a 4th, independent model act as an impartial judge — scoring each response on a strict rubric and synthesizing the best possible final answer.

---

## Table of Contents

- [What is Trucible](#what-is-trucible)
- [Architecture Overview](#architecture-overview)
- [Models & Providers Used](#models--providers-used)
- [The Judge / Consensus Flow](#the-judge--consensus-flow)
- [Request Lifecycle (Step by Step)](#request-lifecycle-step-by-step)
- [Data Model](#data-model)
- [Auth & Rate Limiting](#auth--rate-limiting)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Running Locally](#running-locally)

---

## What is Trucible

Trucible answers one core question: **"If I ask several different LLMs the same thing, which one actually gave the best answer  and can I get one clean, correct answer instead of reading three separate responses myself?"**

Instead of manually copy-pasting a prompt into ChatGPT, Gemini, and DeepSeek separately and eyeballing the results, Trucible:

1. Sends your prompt to **multiple LLM providers at the same time** (parallel, not sequential).
2. Displays every response side-by-side in a benchmark-style grid.
3. Lets you trigger a **judge pass** a separate, independent model that anonymously scores each response against a strict rubric and picks a winner.
4. Synthesizes a **final answer** that merges the strongest, most accurate parts of all responses into one clean output.

It's positioned as a professional evaluation tool, not a novelty "AI vs AI" toy  the judge prompt is deliberately strict about hallucinations, relevance, and padding.

---

## Architecture Overview

Trucible is a **fully UI-based web application**  no CLI, no terminal flow. It's built with Next.js 16 (App Router), deployed on Vercel, and runs entirely in the browser: prompt composer, side-by-side response cards, judge trigger, and the final synthesized answer all render as part of the live UI. Anyone can try it  signed in or as an anonymous guest with zero install.

```
                                   ┌──────────────────────────────┐
                                   │         BROWSER (UI)         │
                                   │   Next.js App Router client  │
                                   │                              │
                                   │  ┌────────────────────────┐  │
                                   │  │   PromptComposer.tsx   │  │
                                   │  └───────────┬────────────┘  │
                                   └──────────────┼───────────────┘
                                                  │  POST /api/generate
                                                  ▼
                        ┌───────────────────────────────────────────────┐
                        │              app/api/generate/route.ts        │
                        │  • validates prompt + deviceToken             │
                        │  • checks per-device / per-IP rate limit      │
                        │  • creates conversation + message rows        │
                        └───────────────────┬───────────────────────────┘
                                            │
                                            ▼
                        ┌───────────────────────────────────────────────┐
                        │           lib/llm/generateAll.ts              │
                        │   fan-out: Promise.all() over enabled models  │
                        └───┬─────────────────┬─────────────────┬───────┘
                            │                 │                 │
                 ┌──────────▼──────┐ ┌────────▼───────┐ ┌───────▼─────────┐
                 │  Gemini 3.5     │ │  Llama 3.3 70B │ │  DeepSeek-Chat  │
                 │  (Google GenAI) │ │  (via Groq)    │ │  (DeepSeek API) │
                 └──────────┬──────┘ └────────┬───────┘ └───────┬─────────┘
                            │                 │                 │
                            └────────┬────────┴────────┬────────┘
                                     ▼                 ▼
                        ┌───────────────────────────────────────────────┐
                        │      responses saved → llm_responses table    │
                        │      rendered as ProviderGrid cards in UI     │
                        └───────────────────┬───────────────────────────┘
                                            │  user clicks "Evaluate"
                                            │  POST /api/judge
                                            ▼
                        ┌───────────────────────────────────────────────┐
                        │              app/api/judge/route.ts           │
                        │  loads all successful responses for message   │
                        └───────────────────┬───────────────────────────┘
                                            ▼
                        ┌────────────────────────────────────────────────┐
                        │               lib/llm/judge.ts                 │
                        │  • anonymizes responses → Response A/B/C       │
                        │  • sends to GPT-OSS-120B (via Groq) as judge   │
                        │  • strict JSON rubric: relevance, accuracy,    │
                        │    completeness, clarity, conciseness (1-10)   │
                        │  • recomputes winner from raw scores as a      │
                        │    sanity check against the model's own claim  │
                        │  • synthesizes one merged "best answer"        │
                        └───────────────────┬────────────────────────────┘
                                            ▼
                        ┌────────────────────────────────────────────────┐
                        │     verdict saved → judge_verdicts table       │
                        │     winner + reasoning + final answer → UI     │
                        │     rendered in FinalAnswerCard.tsx            │
                        └────────────────────────────────────────────────┘
```

---

## Models & Providers Used

| Role | Model | Provider / SDK |
|---|---|---|
| Contestant | **Gemini 3.5 Flash** | `@google/genai` (Google GenAI SDK) |
| Contestant | **Llama 3.3 70B Versatile** | Groq SDK (`groq-sdk`) |
| Contestant | **DeepSeek-Chat** | DeepSeek API (OpenAI-compatible client) |
| Judge | **GPT-OSS-120B** | Groq (OpenAI-compatible endpoint) |

Every contestant model is called with the **same system prompt and the same user prompt**, in parallel, with independent error handling per provider if one provider fails or times out, the others still return normally and the failed one is marked `status: "failed"` in the UI instead of blocking the whole request.

The judge is **deliberately a different model** than any contestant, and it never sees which provider produced which response only anonymized labels (`Response A`, `Response B`, `Response C`). This prevents the judge from being biased toward a specific provider's writing style.

---

## The Judge / Consensus Flow

This is the core differentiator of the project. It's a form of **multi-model, LLM-as-judge consensus**  conceptually similar in spirit to self-consistency ensembling (where you sample multiple times and pick the most reliable answer), but here the "multiple samples" come from **different models** rather than the same model sampled repeatedly, and a **dedicated judge model** rather than majority vote decides the winner and merges the best parts.

Step by step:

1. **Anonymization** Each successful response is stripped of its provider identity and relabeled `Response A`, `Response B`, `Response C`. The judge model never knows which LLM produced which answer.

2. **Strict rubric scoring** The judge scores every response on 5 fixed criteria, each 1–10 (integers only):
   - **Relevance**  does it actually answer what was asked?
   - **Accuracy**  no hallucinated facts, no fabricated numbers/sources.
   - **Completeness**  covers all parts of a multi-part question.
   - **Clarity**  well-structured, not rambling.
   - **Conciseness**  no padding, no "Great question!" filler.

3. **Structured output enforcement**  the judge is forced to return `response_format: { type: "json_object" }`, so the result is always machine-parseable  no scraping free-text for a verdict.

4. **Self-check against gaming**  After the judge returns a `winner` field, the backend independently **sums the raw per-criterion scores** for each response and recomputes the winner itself. If the judge's stated winner doesn't match the score totals, the code **overrides it with the computed winner** and logs a warning  this prevents the judge from stating one winner while contradicting its own scores.

5. **Answer synthesis**  Separately from picking a winner, the judge is instructed to construct one **merged, de-duplicated final answer** that combines only the correct/strong parts across all responses — never inventing new information, never mentioning "Response A/B" in the output.

6. **Persistence**  The verdict (winner, reasoning, per-provider scores, latency, judge model name) is saved to the `judge_verdicts` table, linked back to the original message, so conversation history preserves full evaluation context.

---

## Request Lifecycle (Step by Step)

```
 User types prompt
        │
        ▼
 handleSubmit() in app/page.tsx
   → optimistic UI: prompt bubble renders immediately (before network resolves)
        │
        ▼
 POST /api/generate  { prompt, deviceToken, providers[], conversationId }
        │
        ├─ auth() checked (Clerk) → if signed in, user synced to DB
        ├─ checkDeviceLimit() → per-device-token AND per-IP weekly cap
        │     (10 msgs/week guest · 25 msgs/week signed-in user)
        ├─ conversation + message rows created (or reused)
        ▼
 generateAll(prompt, enabledProviders)
   → Promise.all() across Gemini / Llama(Groq) / DeepSeek
   → each call independently timed + error-caught
        ▼
 responses saved to llm_responses, returned to client
        ▼
 ProviderGrid renders each model's card (success / failed / latency)
        │
        │  user clicks "Evaluate" (only enabled once ≥2 responses succeeded)
        ▼
 POST /api/judge  { messageId }
        ▼
 judge() → GPT-OSS-120B scores + synthesizes final answer
        ▼
 judge_verdicts row saved
        ▼
 FinalAnswerCard renders: winner badge + reasoning + synthesized answer
```

---

## Data Model

Postgres (via Neon) + Drizzle ORM. Core tables:

```
users            — Clerk-synced user records (id, email)
conversations    — one per chat thread (device_token, user_id, title)
messages         — one per user prompt within a conversation
llm_responses    — one row per (message, provider) — text, status, latency
judge_verdicts   — one row per judged message — winner, reasoning, scores JSON
device_usage     — rate-limit tracking per anonymous device token
ip_usage         — rate-limit tracking per IP (defense against token cycling)
api_usage        — daily per-provider call counters (cost/cap protection)
```

Anonymous users are tracked via a **device token** (`lib/getDeviceToken.ts`) stored client-side, so rate limits apply even before sign-up — this is also cross-checked against IP address so someone can't just clear local storage to reset their guest limit.

---

## Auth & Rate Limiting

- **Auth**: Clerk (`@clerk/nextjs` v7), synced to the app's own `users` table via a **Svix-verified webhook** (`app/api/webhooks/clerk/route.ts`) on `user.created`.
- **Guest limit**: 10 messages / 7-day rolling window, tracked by device token + IP.
- **Signed-in limit**: 25 messages / 7-day rolling window.
- **Per-provider daily caps** (`checkProviderCap` / `DAILY_CAPS`) protect against runaway API cost regardless of user-level limits.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Styling | Tailwind CSS v4, custom design tokens ("benchmark lab" aesthetic) |
| Auth | Clerk v7 (`@clerk/nextjs`) |
| Database | Neon Postgres + Drizzle ORM |
| LLM SDKs | `@google/genai`, `groq-sdk`, `openai` (used against both Groq's and DeepSeek's OpenAI-compatible endpoints) |
| Webhooks | Svix (Clerk webhook signature verification) |
| Markdown rendering | `react-markdown` + `remark-gfm` |
| Animation | Framer Motion |
| Deployment | Vercel |
| Analytics | `@vercel/analytics` |

---

## Project Structure

```
trucible/
├── app/
│   ├── (app)/home/page.tsx        # authenticated app shell route
│   ├── api/
│   │   ├── generate/route.ts      # fan-out to contestant models
│   │   ├── judge/route.ts         # judge scoring + synthesis
│   │   ├── history/route.ts       # conversation history
│   │   └── webhooks/clerk/route.ts# user.created sync
│   ├── layout.tsx                 # ClerkProvider root wrap
│   └── page.tsx                   # main arena UI
├── components/
│   ├── arena/                     # ProviderGrid, ModelCard, PromptComposer,
│   │                               # JudgeButton, FinalAnswerCard, MarkdownRenderer
│   ├── layout/                    # Sidebar, ModelToggleBar
│   └── modals/                    # AuthModal
├── lib/
│   ├── llm/
│   │   ├── generateAll.ts         # parallel provider fan-out
│   │   ├── judge.ts               # judge call + scoring logic
│   │   ├── judgeSystemPrompt.ts   # strict evaluation rubric
│   │   └── providers/             # gemini.ts, groq.ts, deepseek.ts, openai.ts
│   ├── db/
│   │   ├── schema.ts              # Drizzle table definitions
│   │   ├── client.ts              # Neon connection
│   │   └── queries/limits.ts      # rate-limit logic
│   ├── systemPrompt.ts            # shared contestant system prompt
│   └── theme/clerk-appearance.ts  # Clerk UI theming
├── proxy.ts                       # Clerk middleware (Next.js 16 naming)
└── drizzle.config.ts
```

---

## Running Locally

```bash
git clone https://github.com/deepakwerma/truciple.git
cd truciple
npm install
```

Create `.env.local` with:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
DATABASE_URL=
GEMINI_API_KEY=
GROQ_API_KEY=
DEEPSEEK_API_KEY=
```

```bash
npm run dev
```

Open `http://localhost:3000`.