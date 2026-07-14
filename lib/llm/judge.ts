import OpenAI from "openai";
import { judgeSystemPrompt } from "./judgeSystemPrompt";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
  timeout: 15000,
});

type Contestant = { provider: string; text: string };

type CriteriaScore = {
  relevance: number;
  accuracy: number;
  completeness: number;
  clarity: number;
  conciseness: number;
};

type Evaluation = {
  scores: Record<string, CriteriaScore>;
  winner: string;
  reasoning: string;
  finalAnswer: string;
};

export async function judge(
  originalPrompt: string,
  contestants: Contestant[],
): Promise<{
  evaluation: Evaluation;
  labelToProvider: Record<string, string>;
}> {
  const labels = ["responseA", "responseB", "responseC", "responseD"].slice(
    0,
    contestants.length,
  );
  const labelToProvider: Record<string, string> = {};

  const labeledBlock = contestants
    .map((c, i) => {
      labelToProvider[labels[i]] = c.provider;
      return `Response ${labels[i].slice(-1)}:\n${c.text}`;
    })
    .join("\n\n");

  const completion = await openai.chat.completions.create({
    model: "openai/gpt-oss-120b",
    temperature: 0,
    messages: [
      { role: "system", content: judgeSystemPrompt },
      {
        role: "user",
        content: `Original Prompt:\n${originalPrompt}\n\n${labeledBlock}\n\nRespond ONLY with valid JSON, no markdown, no backticks, matching this shape: 
        { "scores": { "${labels.join('": {...}, "')}": {...} }, "winner": "one of ${labels.join(", ")}", "reasoning": "string", "finalAnswer": "string" }`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Judge returned empty response");

  let evaluation: Evaluation;
  try {
    evaluation = JSON.parse(raw);
  } catch {
    throw new Error("Judge returned invalid JSON");
  }

  if (!evaluation.scores || !evaluation.winner || !evaluation.reasoning) {
    throw new Error("Judge response missing required fields");
  }
  for (const label of labels) {
    const s = evaluation.scores[label];
    if (
      !s ||
      typeof s.relevance !== "number" ||
      typeof s.accuracy !== "number"
    ) {
      throw new Error(`Judge scores missing/invalid for ${label}`);
    }
  }

  const totals: Record<string, number> = {};
  for (const label of labels) {
    const s = evaluation.scores[label];
    totals[label] =
      s.relevance + s.accuracy + s.completeness + s.clarity + s.conciseness;
  }
  const computedWinner = Object.entries(totals).sort(
    (a, b) => b[1] - a[1],
  )[0][0];
  if (computedWinner !== evaluation.winner) {
    console.warn(
      `Judge picked ${evaluation.winner}, totals say ${computedWinner}. Using computed.`,
    );
    evaluation.winner = computedWinner;
  }

  return { evaluation, labelToProvider };
}
