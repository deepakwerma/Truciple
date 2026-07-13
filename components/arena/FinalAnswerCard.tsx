"use client";

export function FinalAnswerCard({
  winnerProvider,
  finalAnswer,
  reasoning,
}: {
  winnerProvider: string;
  finalAnswer: string;
  reasoning: string;
}) {
  return (
    <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-5 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-amber-400 text-sm font-semibold">🏆 Best Answer — {winnerProvider}</span>
      </div>
      <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap mb-3">{finalAnswer}</p>
      <p className="text-xs text-white/40 italic">{reasoning}</p>
    </div>
  );
}