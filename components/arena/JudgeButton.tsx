"use client";

export function JudgeButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <div className="flex justify-center my-6">
      <button
        onClick={onClick}
        disabled={loading}
        className="px-6 py-2 rounded-full bg-amber-500 text-black text-sm font-semibold disabled:opacity-40"
      >
        {loading ? "Judging…" : "🏆 Pick the best response"}
      </button>
    </div>
  );
}