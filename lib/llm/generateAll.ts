import { callGemini } from "./providers/gemini";
import { callGroq } from "./providers/groq";
import { callOpenAI } from "./providers/openai";
import { callDeepseek } from "./providers/deepseek";

export type ProviderResult =
  | { provider: string; status: "success"; text: string; latencyMs: number }
  | { provider: string; status: "failed"; error: string; latencyMs: number };

async function run(provider: string, fn: () => Promise<string>): Promise<ProviderResult> {
  const start = Date.now();
  try {
    const text = await fn();
    return { provider, status: "success", text, latencyMs: Date.now() - start };
  } catch (e) {
    return { provider, status: "failed", error: (e as Error).message, latencyMs: Date.now() - start };
  }
}

export async function generateAll(prompt: string): Promise<ProviderResult[]> {
  return Promise.all([
    run("gemini", () => callGemini(prompt)),
    run("groq", () => callGroq(prompt)),
    run("openai", () => callOpenAI(prompt)),
    run("deepseek", () => callDeepseek(prompt)),
  ]);
}