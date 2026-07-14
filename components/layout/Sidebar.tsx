"use client";
import { Settings, PanelLeftClose } from "lucide-react";
import { motion } from "framer-motion";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  onSettingsClick: () => void;
}

export function Sidebar({ isOpen, onToggle, onNewChat, onSettingsClick }: SidebarProps) {
  return (
    <motion.aside
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 256, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="h-full flex flex-col bg-bg border-r border-border shrink-0 overflow-hidden"
    >
      {/* Inner container (width restricted to 256px to match aside animation width) */}
      <div className="w-64 h-full flex flex-col justify-between">
        {/* Main upper content section */}
        <div className="flex-1 flex flex-col p-[var(--space-4)] pb-0 overflow-hidden">
          {/* Brand Header */}
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

          {/* Action Button */}
          <button
            onClick={onNewChat}
            className="w-full h-10 rounded-[var(--radius-button)] bg-surface-elevated hover:bg-surface-hover border border-border text-text-primary text-[13px] font-medium tracking-[0.01em] transition-colors focus-ring cursor-pointer mb-[var(--space-6)] shrink-0"
          >
            + New chat
          </button>

          {/* Scrollable Recents List */}
          <div className="flex-1 overflow-y-auto -mx-[var(--space-2)] px-[var(--space-2)] space-y-[var(--space-1)] mb-[var(--space-4)]">
            <p className="font-sans text-[12px] font-normal leading-[1.4] text-text-muted mb-[var(--space-2)] px-[var(--space-2)] select-none">
              Recent
            </p>
            <div className="font-sans text-[13px] font-medium tracking-[0.01em] text-text-primary hover:bg-surface-hover rounded-[var(--radius-input)] px-[var(--space-3)] py-[var(--space-2)] transition-colors cursor-pointer select-none">
              Compare Gemini and Llama response latency
            </div>
            <div className="font-sans text-[13px] font-medium tracking-[0.01em] text-text-muted hover:bg-surface-hover rounded-[var(--radius-input)] px-[var(--space-3)] py-[var(--space-2)] transition-colors cursor-pointer select-none">
              GPT-OSS reasoning logic test
            </div>
          </div>
        </div>

        {/* Sidebar Pinned Footer — exactly 80px high, aligning its top border with the composer bar */}
        <div className="h-[80px] shrink-0 border-t border-border px-[var(--space-4)] flex items-center bg-bg select-none">
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
  );
}