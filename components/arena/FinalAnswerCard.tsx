"use client";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface FinalAnswerCardProps {
  winnerProvider: string;
  finalAnswer: string;
  reasoning: string;
}

const PROVIDER_LABELS: Record<string, string> = {
  gemini: "Gemini",
  groq: "Llama",
  openai: "GPT-OSS",
  deepseek: "DeepSeek",
};

export function FinalAnswerCard({
  winnerProvider,
  finalAnswer,
  reasoning,
}: FinalAnswerCardProps) {
  const winnerLabel = PROVIDER_LABELS[winnerProvider] ?? winnerProvider;

  return (
    <div
      style={{
        backgroundColor: "rgba(176, 141, 87, 0.03)",
      }}
      className="flex flex-col rounded-[var(--radius-card)] border border-border p-[var(--space-5)] select-none mt-[var(--space-4)] min-h-[200px]"
    >
      <div className="flex items-center justify-between mb-[var(--space-4)]">
        <span className="font-mono text-[12px] font-medium tracking-[0.02em] uppercase text-accent-judge">
          GPT-OSS Evaluation
        </span>
        <span className="font-mono text-[10px] font-medium tracking-[0.02em] uppercase bg-[rgba(176,141,87,0.12)] text-accent-judge px-[var(--space-2)] py-[var(--space-1)] rounded-[var(--radius-badge)] border border-[rgba(176,141,87,0.2)]">
          WINNER: {winnerLabel}
        </span>
      </div>

      <div className="flex-1 mb-[var(--space-4)] font-sans text-[14px] leading-[1.6] text-text-primary">
        <MarkdownRenderer content={finalAnswer} />
      </div>

      <div className="mt-[var(--space-2)]">
        <p className="font-sans text-[12px] font-normal leading-[1.4] text-text-muted">
          {reasoning}
        </p>
      </div>
    </div>
  );
}
