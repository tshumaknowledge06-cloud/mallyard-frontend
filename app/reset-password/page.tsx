"use client";

import { useEffect, useState } from "react";

export default function ResetPasswordPage() {
  const [token, setToken] = useState<string | null>(null);
  const [message, setMessage] = useState("Opening The Mallyard...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resetToken = params.get("token");

    if (!resetToken) {
      setMessage(
        "This password reset link is missing its reset token. Please request a new password reset."
      );
      return;
    }

    setToken(resetToken);

    const appUrl = `mallyard://reset-password?token=${encodeURIComponent(
      resetToken
    )}`;

    // Give the browser a brief moment to render before attempting
    // to open the installed Mallyard app.
    const timeout = window.setTimeout(() => {
      window.location.href = appUrl;
    }, 300);

    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8F7F2] px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mb-6">
          <div className="text-2xl font-bold tracking-tight text-[#046D56]">
            The Mallyard
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Find. Compare. Connect.
          </p>
        </div>

        {token ? (
          <>
            <h1 className="text-2xl font-semibold text-gray-900">
              Opening Password Reset
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              We’re opening The Mallyard so you can choose a new password.
            </p>

            <p className="mt-6 text-xs leading-5 text-gray-400">
              If the app does not open automatically, use the button below.
            </p>

            <a
              href={`mallyard://reset-password?token=${encodeURIComponent(
                token
              )}`}
              className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-[#046D56] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#035543]"
            >
              Open The Mallyard
            </a>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-gray-900">
              Password Reset
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              {message}
            </p>

            <a
              href="https://themallyard.com"
              className="mt-6 inline-flex items-center justify-center rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Return to The Mallyard
            </a>
          </>
        )}
      </div>
    </main>
  );
}