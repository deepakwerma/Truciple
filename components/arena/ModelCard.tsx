"use client";
import { MarkdownRenderer } from "./MarkdownRenderer";

type Props = {
  provider: string;
  status: "loading" | "success" | "failed" | "unavailable";
  text?: string;
  latencyMs?: number;
};

const META: Record<string, { label: string; color: string }> = {
  gemini: { label: "Gemini", color: "var(--gemini)" },
  groq: { label: "Llama", color: "var(--llama)" },
  openai: { label: "GPT-OSS", color: "var(--gpt-oss)" },
  deepseek: { label: "DeepSeek", color: "var(--deepseek)" },
};

export function ModelCard({ provider, status, text, latencyMs }: Props) {
  const meta = META[provider] ?? {
    label: provider,
    color: "var(--text-faint)",
  };

  return (
    <div
      style={{
        borderColor:
          status === "failed" ? "rgba(193, 97, 92, 0.4)" : "var(--border)",
      }}
      className="flex flex-col rounded-card border bg-surface min-h-90 p-(--space-5) transition-colors duration-150 overflow-hidden"
    >
      <div className="flex items-center justify-between mb-(--space-4) select-none">
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: meta.color }}
          />

          <span
            className="font-mono text-[12px] font-medium tracking-[0.02em] uppercase"
            style={{ color: meta.color }}
          >
            {meta.label}
          </span>
        </div>
        {status === "success" && latencyMs !== undefined && (
          <span className="font-mono text-[11px] font-normal text-text-faint tabular-nums">
            {latencyMs}ms
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-start">
        {status === "loading" && (
          <div className="h-full flex flex-col justify-center gap-(--space-2) py-(--space-4) animate-skeleton">
            <div className="h-2.5 w-[85%] rounded-full bg-border" />
            <div className="h-2.5 w-full rounded-full bg-border" />
            <div className="h-2.5 w-[65%] rounded-full bg-border" />
          </div>
        )}

        {status === "success" && (
          <div className="font-sans text-[14px] leading-[1.6] text-text-primary">
            <MarkdownRenderer content={text ?? ""} />
          </div>
        )}

        {status === "failed" && (
          <div className="flex-1 flex items-center justify-center text-center">
            <p className="font-sans text-[13px] font-medium text-text-muted">
              Failed to respond
            </p>
          </div>
        )}

        {status === "unavailable" && (
          <div className="flex-1 flex items-center justify-center text-center">
            <p className="font-sans text-[13px] font-medium text-text-faint">
              Not selected for this run
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
