"use client";
import { useEffect, useState } from "react";
import { Settings, PanelLeftClose } from "lucide-react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  onSettingsClick: () => void;
}

type Conversation = { id: string; title: string | null; createdAt: string };

export function Sidebar({
  isOpen,
  onToggle,
  onNewChat,
  onSettingsClick,
  onSelectConversation,
}: SidebarProps & { onSelectConversation: (id: string) => void }) {
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
    <motion.aside
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 256, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="h-full flex flex-col bg-bg border-r border-border shrink-0 overflow-hidden"
    >
      <div className="w-64 h-full flex flex-col justify-between">
        <div className="flex-1 flex flex-col p-(--space-4) pb-0 overflow-hidden">
          <div className="flex items-center justify-between mb-(--space-6) select-none h-10 shrink-0">
            <span className="font-mono text-[18px] font-medium tracking-[-0.02em] text-text-primary">
              trucible
            </span>
            <button
              onClick={onToggle}
              className="flex items-center justify-center w-8 h-8 rounded-input border border-border text-text-muted hover:text-text-primary hover:bg-surface-hover cursor-pointer transition-colors focus-ring"
              title="Collapse sidebar"
            >
              <PanelLeftClose size={16} />
            </button>
          </div>

          <button
            onClick={onNewChat}
            className="w-full h-10 rounded-button bg-surface-elevated hover:bg-surface-hover border border-border text-text-primary text-[13px] font-medium tracking-[0.01em] transition-colors focus-ring cursor-pointer mb-(--space-6) shrink-0"
          >
            + New chat
          </button>

          <div className="flex-1 overflow-y-auto -mx-(--space-2) px-(--space-2) space-y-(--space-1) mb-(--space-4)">
            {isSignedIn && history.length > 0 && (
              <>
                <p className="font-sans text-[12px] font-normal leading-[1.4] text-text-muted mb-(--space-2) px-(--space-2) select-none">
                  Recent
                </p>
                {history.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => onSelectConversation(c.id)} // ye line add karo
                    className="font-sans text-[13px] font-medium tracking-[0.01em] text-text-primary hover:bg-surface-hover rounded-input px-(--space-3) py-(--space-2) transition-colors cursor-pointer select-none truncate"
                  >
                    {c.title ?? "Untitled"}
                  </div>
                ))}
              </>
            )}

            {isSignedIn && history.length === 0 && (
              <p className="font-sans text-[12px] text-text-muted px-(--space-2) select-none">
                No conversations yet
              </p>
            )}

            {!isSignedIn && (
              <p className="font-sans text-[12px] text-text-muted px-(--space-2) select-none">
                Sign in to save your history
              </p>
            )}
          </div>
        </div>

        <div className="h-20 shrink-0 border-t border-border px-(--space-4) flex items-center bg-bg select-none">
          <button
            onClick={onSettingsClick}
            className="flex items-center gap-(--space-2) h-10 w-full text-[13px] font-medium tracking-[0.01em] text-text-muted hover:text-text-primary focus-ring cursor-pointer transition-colors"
          >
            <Settings size={16} />
            Settings
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
