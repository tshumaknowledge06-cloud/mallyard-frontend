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
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        width: "100%",
        background: "linear-gradient(to right, #065f46, #047857, #065f46)",
        color: "white",
        fontSize: "clamp(11px, 3vw, 14px)",
        padding: "8px 16px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        borderBottom: "1px solid rgba(16, 185, 129, 0.2)",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* 🔥 PREMIUM MESSAGE */}
        <p
          style={{
            textAlign: "center",
            fontWeight: 500,
            letterSpacing: "0.025em",
          }}
        >
          <span style={{ marginRight: "4px" }}>🚀</span>
          <span style={{ fontWeight: 600 }}>{PILOT_CONFIG.title}:</span>{" "}
          <span style={{ opacity: 0.9 }}>{PILOT_CONFIG.message}</span>
        </p>

        {/* 🔥 CLOSE BUTTON */}
        <button
          onClick={() => {
            setVisible(false);
            localStorage.setItem("pilot_banner_dismissed", "true");
          }}
          style={{
            position: "absolute",
            right: 0,
            background: "transparent",
            border: "none",
            color: "rgba(255, 255, 255, 0.6)",
            cursor: "pointer",
            fontSize: "14px",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)")}
        >
          ✕
        </button>
      </div>
    </div>
  );
}