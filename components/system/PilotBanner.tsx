"use client";

import { useEffect, useState } from "react";

// 🔥 ADMIN CONTROL (you control this)
const PILOT_MODE = true;

// 🔥 FRONTEND CONFIG
const PILOT_CONFIG = {
  title: "The Mallyard App Is Live",
  message:
    "The Yard is now on Android. Discover, compare, and connect wherever you are.",
  appUrl:
    "https://play.google.com/store/apps/details?id=com.themallyard.mobile&pcampaignid=web_share",
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
          gap: "8px",
          flexWrap: "wrap",
          paddingRight: "28px",
        }}
      >
        {/* 🔥 PREMIUM MESSAGE */}

        <p
          style={{
            textAlign: "center",
            fontWeight: 500,
            letterSpacing: "0.025em",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: "clamp(14px, 2vw, 18px)" }}>🚀</span>
          <span style={{ fontWeight: 600, color: "#fcd34d" }}>
            {PILOT_CONFIG.title}:
          </span>
          <span style={{ opacity: 0.9 }}>{PILOT_CONFIG.message}</span>
        </p>

        {/* 🔥 GET APP BUTTON */}

        <a
          href={PILOT_CONFIG.appUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            backgroundColor: "#fcd34d",
            color: "#064e3b",
            fontWeight: 600,
            fontSize: "clamp(11px, 1.5vw, 13px)",
            padding: "4px 14px",
            borderRadius: "9999px",
            textDecoration: "none",
            transition: "all 0.2s",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#fbbf24";
            e.currentTarget.style.transform = "scale(1.02)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#fcd34d";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          Get App
        </a>

        {/* 🔥 CLOSE BUTTON */}

        <button
          onClick={() => {
            setVisible(false);
            localStorage.setItem("pilot_banner_dismissed", "true");
          }}
          style={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            background: "transparent",
            border: "none",
            color: "rgba(255, 255, 255, 0.6)",
            cursor: "pointer",
            fontSize: "14px",
            transition: "color 0.2s",
            padding: "4px",
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