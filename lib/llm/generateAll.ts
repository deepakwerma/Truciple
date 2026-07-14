import { callGemini } from "./providers/gemini";
import { callGroq } from "./providers/groq";
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

export async function generateAll(prompt: string, enabledProviders?: string[]): Promise<ProviderResult[]> {
  const allProviders = [
    { name: "gemini", fn: () => callGemini(prompt) },
    { name: "groq", fn: () => callGroq(prompt) },
    { name: "deepseek", fn: () => callDeepseek(prompt) },
  ];

  const toRun = enabledProviders
    ? allProviders.filter((p) => enabledProviders.includes(p.name))
    : allProviders;

  return Promise.all(toRun.map((p) => run(p.name, p.fn)));
}