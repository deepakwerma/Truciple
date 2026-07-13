"use client";

type Props = {
  provider: string;
  status: "loading" | "success" | "failed" | "unavailable";
  text?: string;
  latencyMs?: number;
};

const META: Record<string, { label: string; color: string; dot: string }> = {
  gemini: { label: "Gemini", color: "#4285F4", dot: "bg-[#4285F4]" },
  groq: { label: "Llama", color: "#F5A623", dot: "bg-[#F5A623]" },
  openai: { label: "GPT-OSS", color: "#10B981", dot: "bg-[#10B981]" },
  deepseek: { label: "DeepSeek", color: "#8B5CF6", dot: "bg-[#8B5CF6]" },
};

export function ModelCard({ provider, status, text, latencyMs }: Props) {
  const meta = META[provider] ?? { label: provider, color: "#8B8D98", dot: "bg-white/30" };

  return (
    <div className="flex flex-col rounded-2xl border border-white/8 bg-[#13151C] overflow-hidden min-h-80">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
          <span className="font-mono text-[13px] font-medium tracking-tight" style={{ color: meta.color }}>
            {meta.label}
          </span>
        </div>
        {status === "success" && latencyMs !== undefined && (
          <span className="font-mono text-[11px] text-white/30 tabular-nums">{latencyMs}ms</span>
        )}
      </div>

      <div className="flex-1 px-4 py-4">
        {status === "loading" && (
          <div className="h-full flex flex-col justify-center gap-2">
            <div className="h-2.5 w-4/5 rounded bg-white/6 animate-pulse" />
            <div className="h-2.5 w-full rounded bg-white/6 animate-pulse" />
            <div className="h-2.5 w-3/5 rounded bg-white/6 animate-pulse" />
          </div>
        )}

        {status === "success" && (
          <p className="text-[14px] leading-relaxed text-white/90 whitespace-pre-wrap">{text}</p>
        )}

        {status === "failed" && (
          <div className="h-full flex items-center justify-center text-center">
            <p className="text-[13px] text-rose-400/70">Something went wrong. Try again.</p>
          </div>
        )}

        {status === "unavailable" && (
          <div className="h-full flex items-center justify-center text-center">
            <p className="text-[13px] text-white/30">Not available today — try tomorrow.</p>
          </div>
        )}
      </div>
    </div>
  );
}