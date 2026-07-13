"use client";

const MODELS = [
  { id: "gemini", label: "Gemini" },
  { id: "groq", label: "Llama" },
  { id: "openai", label: "GPT-OSS" },
  { id: "deepseek", label: "DeepSeek" },
];

export function ModelToggleBar({
  enabled,
  onToggle,
}: {
  enabled: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex gap-4 border-b border-white/10 pb-3 mb-6 overflow-x-auto">
      {MODELS.map((m) => (
        <div key={m.id} className="flex items-center gap-2 shrink-0">
          <span className="text-sm text-white/80">{m.label}</span>
          <button
            onClick={() => onToggle(m.id)}
            className={`w-9 h-5 rounded-full transition-colors relative ${
              enabled.includes(m.id) ? "bg-emerald-500" : "bg-white/15"
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                enabled.includes(m.id) ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  );
}