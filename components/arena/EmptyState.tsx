// components/arena/EmptyState.tsx
"use client";

export function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-2xl font-medium text-white/90 mb-2">
                Ask once. See how three models think.
            </h1>
            <p className="text-sm text-white/40 max-w-md">
                Gemini, Llama, and DeepSeek answer in parallel — then an independent judge
                picks the best one and tells you why.
            </p>
        </div>
    );
}