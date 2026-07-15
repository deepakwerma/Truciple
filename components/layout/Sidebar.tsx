"use client";
import { useEffect, useState } from "react";
import { Settings, PanelLeftClose } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  onSettingsClick: () => void;
  onSelectConversation: (id: string) => void;
}

type Conversation = { id: string; title: string | null; createdAt: string };

export function Sidebar({
  isOpen,
  onToggle,
  onNewChat,
  onSettingsClick,
  onSelectConversation,
}: SidebarProps) {
  const { isSignedIn } = useUser();
  const [history, setHistory] = useState<Conversation[]>([]);

  useEffect(() => {
    if (!isSignedIn) {
      setHistory([]);
      return;
    }
    fetch("/api/history")
      .then((res) => res.json())
      .then((data) => setHistory(data.conversations ?? []))
      .catch(() => setHistory([]));
  }, [isSignedIn]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onToggle}
            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: -256, opacity: 0 }}
        animate={{ x: isOpen ? 0 : -256, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
        className="fixed md:relative top-0 left-0 h-full w-64 flex flex-col bg-bg border-r border-border shrink-0 z-50 md:z-auto"
      >
        <div className="w-64 h-full flex flex-col justify-between">
          <div className="flex-1 flex flex-col p-[var(--space-4)] pb-0 overflow-hidden">
            <div className="flex items-center justify-between mb-[var(--space-6)] select-none h-10 shrink-0">
              <span className="font-mono text-[18px] font-medium tracking-[-0.02em] text-text-primary">
                trucible
              </span>
              <button
                onClick={onToggle}
                className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-input)] border border-border text-text-muted hover:text-text-primary hover:bg-surface-hover cursor-pointer transition-colors focus-ring"
                title="Collapse sidebar"
              >
                <PanelLeftClose size={16} />
              </button>
            </div>

            <button
              onClick={onNewChat}
              className="w-full h-10 rounded-[var(--radius-button)] bg-surface-elevated hover:bg-surface-hover border border-border text-text-primary text-[13px] font-medium tracking-[0.01em] transition-colors focus-ring cursor-pointer mb-[var(--space-6)] shrink-0"
            >
              + New chat
            </button>

            <div className="flex-1 overflow-y-auto -mx-[var(--space-2)] px-[var(--space-2)] space-y-[var(--space-1)] mb-[var(--space-4)]">
              {isSignedIn && history.length > 0 && (
                <>
                  <p className="font-sans text-[12px] font-normal leading-[1.4] text-text-muted mb-[var(--space-2)] px-[var(--space-2)] select-none">
                    Recent
                  </p>
                  {history.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => onSelectConversation(c.id)}
                      className="font-sans text-[13px] font-medium tracking-[0.01em] text-text-primary hover:bg-surface-hover rounded-[var(--radius-input)] px-[var(--space-3)] py-[var(--space-2)] transition-colors cursor-pointer select-none truncate"
                    >
                      {c.title ?? "Untitled"}
                    </div>
                  ))}
                </>
              )}

              {isSignedIn && history.length === 0 && (
                <p className="font-sans text-[12px] text-text-muted px-[var(--space-2)] select-none">
                  No conversations yet
                </p>
              )}

              {!isSignedIn && (
                <p className="font-sans text-[12px] text-text-muted px-[var(--space-2)] select-none">
                  Sign in to save your history
                </p>
              )}
            </div>
          </div>

          <div className="h-20 shrink-0 border-t border-border px-[var(--space-4)] flex items-center bg-bg select-none">
            <button
              onClick={onSettingsClick}
              className="flex items-center gap-[var(--space-2)] h-10 w-full text-[13px] font-medium tracking-[0.01em] text-text-muted hover:text-text-primary focus-ring cursor-pointer transition-colors"
            >
              <Settings size={16} />
              Settings
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
