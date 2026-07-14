"use client";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { ModelToggleBar } from "@/components/layout/ModelToggleBar";
import { ProviderGrid } from "@/components/arena/ProviderGrid";
import { PromptComposer } from "@/components/arena/PromptComposer";
import { JudgeButton } from "@/components/arena/JudgeButton";
import { FinalAnswerCard } from "@/components/arena/FinalAnswerCard";
import { AuthModal } from "@/components/modals/AuthModal";
import { getDeviceToken } from "@/lib/getDeviceToken";
import { EmptyState } from "@/components/arena/EmptyState";

export default function Home() {
  // Compare exactly three models initially (excluding openai which is reserved for the judge)
  const [enabled, setEnabled] = useState(["gemini", "groq", "deepseek"]);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [messageId, setMessageId] = useState<string | null>(null);
  const [judgeResult, setJudgeResult] = useState<any>(null);
  const [judging, setJudging] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authReason, setAuthReason] = useState<"settings" | "limit">(
    "settings",
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);

  function toggleModel(id: string) {
    setEnabled((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  }

  function handleNewChat() {
    setResponses([]);
    setMessageId(null);
    setJudgeResult(null);
    setLoading(false);
    setJudging(false);
    setCurrentPrompt(null);
  }

  async function handleSubmit(prompt: string) {
    setLoading(true);
    setJudgeResult(null);
    setResponses([]);
    setCurrentPrompt(prompt);

    async function handleSelectConversation(conversationId: string) {
      const res = await fetch(`/api/history/${conversationId}`);
      const data = await res.json();

      if (res.ok) {
        setCurrentPrompt(data.prompt);
        setMessageId(data.messageId);
        setResponses(data.responses);
        setJudgeResult(
          data.verdict
            ? {
                winnerProvider: data.verdict.winnerResponseId
                  ? data.responses.find(
                      (r: any) => r.id === data.verdict.winnerResponseId,
                    )?.provider
                  : null,
                finalAnswer: data.verdict.reasoning,
                verdict: { reasoning: data.verdict.reasoning },
              }
            : null,
        );
        setLoading(false);
      }
    }

    const deviceToken = getDeviceToken();
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, deviceToken, providers: enabled }),
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

  // Only allow evaluation if at least 2 enabled generator models succeed
  const canEvaluate =
    responses.filter(
      (r) => enabled.includes(r.provider) && r.status === "success",
    ).length >= 2;

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-bg">
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <Sidebar
            onSettingsClick={() => {
              setAuthReason("settings");
              setAuthOpen(true);
            }}
            onNewChat={handleNewChat}
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            onSelectConversation={handleSelectConversation}
          />
        )}
      </AnimatePresence>

      <main className="flex-1 h-full flex flex-col overflow-hidden">
        <ModelToggleBar
          enabled={enabled}
          onToggle={toggleModel}
          sidebarOpen={sidebarOpen}
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Content area that scrolls independently */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-(--space-6) py-(--space-6) space-y-(--space-6) w-full">
            {/* Empty state — no conversation started yet */}
            {!currentPrompt && (
              <div className="min-h-[calc(100vh-160px)] flex items-center justify-center">
                <EmptyState />
              </div>
            )}

            {/* User Prompt Display (aligned right, max 75% width, desaturated green) */}
            {currentPrompt && (
              <div className="w-full flex justify-end select-none">
                <div className="max-w-[75%] bg-[rgba(74,155,127,0.06)] border border-[rgba(74,155,127,0.12)] rounded-card py-(--space-4) px-(--space-5) flex flex-col">
                  <span className="font-mono text-[11px] font-medium tracking-[0.02em] uppercase text-accent-signal opacity-80 mb-1.5">
                    YOU
                  </span>
                  <p className="font-sans text-[14px] leading-[1.6] text-text-primary whitespace-pre-wrap select-text">
                    {currentPrompt}
                  </p>
                </div>
              </div>
            )}

            {(responses.length > 0 || loading) && (
              <ProviderGrid
                responses={responses}
                loading={loading}
                enabled={enabled}
              />
            )}

            {responses.length > 0 &&
              !loading &&
              !judgeResult &&
              canEvaluate && (
                <JudgeButton onClick={handleJudge} loading={judging} />
              )}

            {judgeResult && (
              <FinalAnswerCard
                winnerProvider={judgeResult.winnerProvider}
                finalAnswer={judgeResult.finalAnswer}
                reasoning={judgeResult.verdict.reasoning}
              />
            )}
          </div>
        </div>

        {/* Pinned Bottom Composer (glassmorphic transparent bar, exactly 80px height to align with sidebar footer border) */}
        <div className="h-20 shrink-0 bg-bg/75 backdrop-blur-md border-t border-border px-(--space-5) flex items-center">
          <div className="max-w-7xl mx-auto w-full">
            <PromptComposer onSubmit={handleSubmit} disabled={loading} />
          </div>
        </div>
      </main>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        reason={authReason}
      />
    </div>
  );
}
