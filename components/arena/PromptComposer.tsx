"use client";
import { useState } from "react";
import { ArrowUp } from "lucide-react";

export function PromptComposer({
  onSubmit,
  disabled,
}: {
  onSubmit: (prompt: string) => void;
  disabled: boolean;
}) {
  const [value, setValue] = useState("");

  function handleSubmit() {
    if (!value.trim() || disabled) return;
    onSubmit(value.trim());
    setValue("");
  }

  return (
    <div className="flex items-end gap-[var(--space-3)] rounded-[var(--radius-input)] border border-border bg-surface-elevated pl-[var(--space-4)] pr-[var(--space-2)] py-[var(--space-2)] focus-within:border-border-focus transition-colors duration-150">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        placeholder="Ask anything…"
        rows={1}
        className="flex-1 bg-transparent text-[14px] leading-[1.6] text-text-primary placeholder:text-text-muted resize-none py-[var(--space-2)] focus:outline-none max-h-32 min-h-[40px] overflow-auto"
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        className="shrink-0 w-10 h-10 rounded-full bg-[#2A2A2E] enabled:bg-[var(--text-primary)] enabled:hover:bg-[var(--text-secondary)] text-[var(--text-secondary)] enabled:text-[var(--bg)] flex items-center justify-center transition-all cursor-not-allowed enabled:cursor-pointer focus-ring"
        title="Send prompt"
      >
        <ArrowUp size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
}
