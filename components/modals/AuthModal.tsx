"use client";
import { SignIn, SignUp } from "@clerk/nextjs";
import { useState } from "react";
import { X } from "lucide-react";

export function AuthModal({
  open,
  onClose,
  reason,
}: {
  open: boolean;
  onClose: () => void;
  reason: "settings" | "limit";
}) {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-up");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative bg-[#0F1117] border border-white/10 rounded-xl p-6 max-w-md w-full mx-4">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">
          <X size={18} />
        </button>

        {reason === "limit" && (
          <p className="text-sm text-white/70 mb-4 text-center">
            You've used your free messages this week. Sign up for more.
          </p>
        )}

        <div className="flex gap-2 mb-4 justify-center">
          <button
            onClick={() => setMode("sign-in")}
            className={`text-sm px-3 py-1 rounded-full ${mode === "sign-in" ? "bg-white text-black" : "text-white/50"}`}
          >
            Sign in
          </button>
          <button
            onClick={() => setMode("sign-up")}
            className={`text-sm px-3 py-1 rounded-full ${mode === "sign-up" ? "bg-white text-black" : "text-white/50"}`}
          >
            Sign up
          </button>
        </div>

        {mode === "sign-in" ? <SignIn routing="hash" /> : <SignUp routing="hash" />}
      </div>
    </div>
  );
}