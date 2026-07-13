"use client";
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { ModelToggleBar } from "@/components/layout/ModelToggleBar";
import { ProviderGrid } from "@/components/arena/ProviderGrid";
import { PromptComposer } from "@/components/arena/PromptComposer";
import { JudgeButton } from "@/components/arena/JudgeButton";
import { FinalAnswerCard } from "@/components/arena/FinalAnswerCard";
import { AuthModal } from "@/components/modals/AuthModal";
import { getDeviceToken } from "@/lib/getDeviceToken";

export default function Home() {
  const [enabled, setEnabled] = useState(["gemini", "groq", "openai", "deepseek"]);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [messageId, setMessageId] = useState<string | null>(null);
  const [judgeResult, setJudgeResult] = useState<any>(null);
  const [judging, setJudging] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authReason, setAuthReason] = useState<"settings" | "limit">("settings");

  function toggleModel(id: string) {
    setEnabled((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  }

  async function handleSubmit(prompt: string) {
    setLoading(true);
    setJudgeResult(null);
    setResponses([]);

    const deviceToken = getDeviceToken();
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, deviceToken }),
    });
    const data = await res.json();

    if (res.status === 429) {
      setAuthReason("limit");
      setAuthOpen(true);
      setLoading(false);
      return;
    }

    setResponses(data.responses);
    setMessageId(data.messageId);
    setLoading(false);
  }

  async function handleJudge() {
    if (!messageId) return;
    setJudging(true);
    const res = await fetch("/api/judge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId }),
    });
    const data = await res.json();
    setJudgeResult(data);
    setJudging(false);
  }

  return (
    <div className="flex">
      <Sidebar onSettingsClick={() => { setAuthReason("settings"); setAuthOpen(true); }} />

      <main className="flex-1 px-6 py-6 max-w-5xl mx-auto">
        <ModelToggleBar enabled={enabled} onToggle={toggleModel} />

        {(responses.length > 0 || loading) && (
          <ProviderGrid
            responses={responses.filter((r) => enabled.includes(r.provider))}
            loading={loading}
          />
        )}

        {responses.length > 0 && !loading && !judgeResult && (
          <JudgeButton onClick={handleJudge} loading={judging} />
        )}

        {judgeResult && (
          <FinalAnswerCard
            winnerProvider={judgeResult.winnerProvider}
            finalAnswer={judgeResult.finalAnswer}
            reasoning={judgeResult.verdict.reasoning}
          />
        )}

        <div className="fixed bottom-0 left-64 right-0 p-4 bg-[#0B0D12] border-t border-white/10">
          <div className="max-w-5xl mx-auto">
            <PromptComposer onSubmit={handleSubmit} disabled={loading} />
          </div>
        </div>
      </main>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} reason={authReason} />
    </div>
  );
}