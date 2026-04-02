"use client";

import { useEffect, useState } from "react";

// 🔥 ADMIN CONTROL (you control this)
const PILOT_MODE = true;

// 🔥 FRONTEND CONFIG
const PILOT_CONFIG = {
  title: "Pilot Mode Active",
  message:
    "You’re experiencing early access to The Mallyard. Features may evolve as we refine the platform.",
};

export default function PilotBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("pilot_banner_dismissed");

    // ✅ show only if pilot is ON and user has not dismissed
    if (PILOT_MODE && !dismissed) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      className="
        sticky top-0 z-50
        w-full
        backdrop-blur-md
        bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-800
        text-white
        text-xs md:text-sm
        px-4 py-2
        shadow-lg
        animate-fade-in
        border-b border-emerald-500/20
      "
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center relative">

        {/* 🔥 PREMIUM MESSAGE */}
        <p className="text-center font-medium tracking-wide">
          <span className="mr-1">🚀</span>
          <span className="font-semibold">{PILOT_CONFIG.title}:</span>{" "}
          <span className="opacity-90">{PILOT_CONFIG.message}</span>
        </p>

        {/* 🔥 CLOSE BUTTON */}
        <button
          onClick={() => {
            setVisible(false);
            localStorage.setItem("pilot_banner_dismissed", "true");
          }}
          className="
            absolute right-0
            text-white/60 hover:text-white
            transition
            text-sm
          "
        >
          ✕
        </button>

      </div>
    </div>
  );
}