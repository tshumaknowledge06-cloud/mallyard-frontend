"use client";

import { useEffect, useState, useRef } from "react";

interface Message {
  role: "user" | "sandy";
  text: string;
}

export default function SandyChat() {

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "sandy",
      text: "👋 Hi, I’m Sandy. I can help you find products, services, or guide you through The Mallyard."
    }
  ]);

  // 🔥 HOLD MESSAGE FROM OUTSIDE (Search, etc.)
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  // 🔥 LISTEN FOR GLOBAL EVENT (Search → Sandy)
  useEffect(() => {
    const handler = (e: any) => {
      setOpen(true);

      if (e.detail?.message) {
        setPendingMessage(e.detail.message);
      }
    };

    window.addEventListener("openSandy", handler);

    return () => {
      window.removeEventListener("openSandy", handler);
    };
  }, []);

  // 🔥 SEND PENDING MESSAGE AFTER CHAT OPENS
  useEffect(() => {
    if (open && pendingMessage) {
      sendMessage(pendingMessage);
      setPendingMessage(null);
    }
  }, [open, pendingMessage]);

  // 🔥 AUTO-SCROLL TO BOTTOM
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔥 CORE SEND FUNCTION (now reusable)
  const sendMessage = async (customMessage?: string) => {

    const messageToSend = customMessage ?? input;

    if (!messageToSend.trim()) return;

    // 🔥 STALE STATE FIX - Use functional update
    setMessages((prev) => [
      ...prev,
      { role: "user", text: messageToSend }
    ]);

    setInput("");

    try {

      const token = localStorage.getItem("access_token");

      const res = await fetch(
        `${BASE_URL}/sandy/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // 🔥 TOKEN SAFETY - Don't send "Bearer null"
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            message: messageToSend
          })
        }
      );

      // 🔥 SAFE JSON HANDLING
      const data = (await res.json().catch(() => ({}))) || {};

      // 🔥 STALE STATE FIX - Use functional update
      setMessages((prev) => [
        ...prev,
        { role: "sandy", text: data.reply || "..." }
      ]);

    } catch {

      // 🔥 STALE STATE FIX - Use functional update
      setMessages((prev) => [
        ...prev,
        {
          role: "sandy",
          text: "⚠️ Sandy is having trouble responding right now."
        }
      ]);

    }

  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-emerald-700 text-white px-5 py-3 shadow-lg hover:bg-emerald-800 transition"
      >
        Sandy
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 rounded-xl border border-gray-200 bg-white shadow-2xl flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between rounded-t-xl bg-emerald-700 px-4 py-3 text-white">
            <span className="font-semibold">Sandy • The Yard Guardian</span>
            <button
              onClick={() => setOpen(false)}
              className="text-sm hover:opacity-80"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 max-h-80 overflow-y-auto p-3 space-y-2 text-sm">

            {messages.map((msg, index) => (

              <div
                key={index}
                className={`p-2 rounded-md max-w-[80%] ${
                  msg.role === "user"
                    ? "bg-emerald-100 ml-auto"
                    : "bg-gray-100"
                }`}
              >
                {msg.text}
              </div>

            ))}

            {/* 🔥 AUTO-SCROLL TARGET */}
            <div ref={bottomRef} />

          </div>

          {/* Input */}
          <div className="border-t p-2 flex gap-2">

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Sandy something..."
              className="flex-1 border rounded-md px-3 py-2 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />

            <button
              onClick={() => sendMessage()}
              className="bg-emerald-700 text-white px-3 rounded-md hover:bg-emerald-800"
            >
              Send
            </button>

          </div>

        </div>
      )}
    </>
  );
}