"use client";
import { useState } from "react";
import { ArrowUp } from "lucide-react";

export function PromptComposer({ onSubmit, disabled }: { onSubmit: (prompt: string) => void; disabled: boolean }) {
  const [value, setValue] = useState("");

  function handleSubmit() {
    if (!value.trim() || disabled) return;
    onSubmit(value.trim());
    setValue("");
  }

  return (
    <div className="flex items-end gap-2 rounded-2xl border border-white/8 bg-[#13151C] px-3 py-2 focus-within:border-white/20 transition-colors">
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
        className="flex-1 bg-transparent text-[14px] text-white/90 placeholder:text-white/30 resize-none py-2 focus:outline-none max-h-32"
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        className="shrink-0 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center disabled:opacity-20 disabled:bg-white/20 transition-opacity"
      >
        <ArrowUp size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
}