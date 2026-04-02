"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ErrorState from "@/components/ui/ErrorState";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function parseError(data: any) {
    if (!data) return "Login failed";

    if (typeof data.detail === "string") {
      const detail = data.detail.toLowerCase();

      if (
        detail.includes("incorrect") ||
        detail.includes("invalid") ||
        detail.includes("password") ||
        detail.includes("credentials")
      ) {
        return "Invalid credentials";
      }

      return data.detail;
    }

    if (Array.isArray(data.detail)) {
      return data.map((item: any) => item.msg || "Login failed").join(", ");
    }

    return "Login failed";
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    localStorage.removeItem("access_token");
    localStorage.removeItem("role");
    localStorage.removeItem("partner_id");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            username: email,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(parseError(data));
        return;
      }

      if (data.role !== "admin") {
        setError("Only admins can log in here.");
        return;
      }

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("role", data.role);

      if (data.partner_id) {
        localStorage.setItem("partner_id", String(data.partner_id));
      }

      router.push("/admin");
    } catch (err) {
      console.error("Admin login error:", err);
      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-white px-6 py-20">

      <div className="max-w-md w-full">

        {/* GLASS CARD */}
        <Card
          className="
            backdrop-blur-xl
            bg-white/60
            border border-white/40
            shadow-xl
            rounded-3xl
            p-8 md:p-10
          "
        >

          {/* BRAND (MATCHES HERO STYLE) */}
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-widest text-yellow-500 font-semibold mb-2">
              Founder Access
            </p>

            <h1 className="text-2xl md:text-3xl font-semibold text-emerald-900">
              The Mallyard
            </h1>

            <p className="text-sm text-gray-600 mt-2">
              Secure access to your command center
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-5">

            {/* EMAIL */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Email
              </label>

              <input
                type="email"
                required
                className="
                  w-full
                  p-3
                  rounded-xl
                  border
                  border-gray-200
                  bg-white/80
                  focus:ring-2
                  focus:ring-emerald-600/30
                  focus:outline-none
                  transition
                "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Password
              </label>

              <input
                type="password"
                required
                className="
                  w-full
                  p-3
                  rounded-xl
                  border
                  border-gray-200
                  bg-white/80
                  focus:ring-2
                  focus:ring-emerald-600/30
                  focus:outline-none
                  transition
                "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* ERROR */}
            {error && <ErrorState message={error} />}

            {/* BUTTON */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full text-sm font-medium"
            >
              {loading ? "Authenticating..." : "Enter The Yard"}
            </Button>

          </form>

        </Card>

      </div>

    </div>
  );
}