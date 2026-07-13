"use client";
import { Settings } from "lucide-react";

export function Sidebar({ onSettingsClick }: { onSettingsClick: () => void }) {
  return (
    <aside className="w-64 h-screen flex flex-col bg-[#0B0D12] border-r border-white/10 p-4">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-md bg-white/10" />
        <span className="font-mono text-sm font-semibold">trucible</span>
      </div>

      <button className="w-full py-2 rounded-lg bg-white/10 text-sm font-medium mb-6">
        + New Chat
      </button>

      <div className="flex-1 overflow-y-auto space-y-1">
        <p className="text-xs text-white/40 mb-2">Recent</p>
        {/* map real conversation history here later */}
      </div>

      <button
        onClick={onSettingsClick}
        className="flex items-center gap-2 text-sm text-white/60 hover:text-white pt-4 border-t border-white/10"
      >
        <Settings size={16} />
        Settings
      </button>
    </aside>
  );
}