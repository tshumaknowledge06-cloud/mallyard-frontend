"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

export default function ResetPasswordPage() {
  const [token, setToken] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resetToken = params.get("token");

    if (resetToken) {
      setToken(resetToken);
    } else {
      setError(
        "This password reset link is missing its reset token. Please request a new password reset."
      );
    }
  }, []);

  function openAppLogin() {
    window.location.href = "mallyard://login";
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    if (!token) {
      setError(
        "No reset token was found. Please request a new password reset."
      );
      return;
    }

    if (!password) {
      setError("Please enter your new password.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          new_password: password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (typeof data?.detail === "string") {
          setError(data.detail);
        } else if (Array.isArray(data?.detail)) {
          setError(
            data.detail
              .map((item: any) => item.msg || "Invalid request.")
              .join(", ")
          );
        } else {
          setError(
            "We could not reset your password. Please try again."
          );
        }

        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error("Password reset error:", err);

      setError(
        "Unable to connect to The Mallyard. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8F7F2] px-6 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          {/* BRAND */}
          <div className="mb-8 text-center">
            <div className="text-2xl font-bold tracking-tight text-[#046D56]">
              The Mallyard
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Find. Compare. Connect.
            </p>
          </div>

          {!token ? (
            <>
              <h1 className="text-2xl font-semibold text-gray-900">
                Password Reset
              </h1>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                {error}
              </p>

              <a
                href="/forgot-password"
                className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-[#046D56] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#035543]"
              >
                Request a New Reset Link
              </a>
            </>
          ) : success ? (
            /* SUCCESS */
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <svg
                  className="h-8 w-8 text-[#046D56]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h1 className="mt-6 text-2xl font-semibold text-gray-900">
                Password Updated
              </h1>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                Your password has been reset successfully.
              </p>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                You can now continue to The Mallyard and log in with your
                new password.
              </p>

              <button
                type="button"
                onClick={openAppLogin}
                className="mt-7 inline-flex w-full items-center justify-center rounded-lg bg-[#046D56] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#035543]"
              >
                Continue to Login
              </button>

              <a
                href="/login"
                className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Login on Website
              </a>
            </div>
          ) : (
            /* RESET FORM */
            <>
              <h1 className="text-2xl font-semibold text-gray-900">
                Reset Your Password
              </h1>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                Enter a new password for your Mallyard account below.
              </p>

              {error && (
                <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleReset} className="mt-6 space-y-5">
                {/* NEW PASSWORD */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-gray-800"
                  >
                    New Password
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your new password"
                      autoComplete="new-password"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-16 text-sm outline-none transition focus:border-[#046D56] focus:ring-2 focus:ring-[#046D56]/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((current) => !current)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[#046D56] hover:text-[#035543]"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-gray-500">
                    Must be at least 8 characters.
                  </p>
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-gray-800"
                  >
                    Confirm Password
                  </label>

                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={
                        showConfirmPassword ? "text" : "password"
                      }
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(e.target.value)
                      }
                      placeholder="Confirm your new password"
                      autoComplete="new-password"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-16 text-sm outline-none transition focus:border-[#046D56] focus:ring-2 focus:ring-[#046D56]/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((current) => !current)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[#046D56] hover:text-[#035543]"
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-[#046D56] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#035543] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Updating Password..." : "Reset Password"}
                </button>
              </form>

              <p className="mt-6 text-center text-xs leading-5 text-gray-400">
                If you did not request a password reset, you can safely
                ignore this page.
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}