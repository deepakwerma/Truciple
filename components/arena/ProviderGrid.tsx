"use client";
import { ModelCard } from "./ModelCard";

type ResponseData = {
  provider: string;
  status: "success" | "failed" | "unavailable";
  responseText?: string | null;
  latencyMs?: number;
};

export function ProviderGrid({ responses, loading }: { responses: ResponseData[]; loading: boolean }) {
  const providers = ["gemini", "groq", "openai", "deepseek"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {providers.map((p) => {
        const r = responses.find((x) => x.provider === p);
        return (
          <ModelCard
            key={p}
            provider={p}
            status={loading ? "loading" : (r?.status ?? "loading")}
            text={r?.responseText ?? undefined}
            latencyMs={r?.latencyMs}
          />
        );
      })}
    </div>
  );
}