"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

type AppRole = "admin" | "merchant" | "delivery_partner" | "customer";
type BackendRole = "admin" | "seller" | "delivery_partner" | "customer";

export default function LoginPage() {
  const params = useParams();
  const router = useRouter();

  const routeRole = useMemo(() => {
    return ((params.role as string) || "customer")
      .toLowerCase()
      .replace(/[-\s]/g, "_") as AppRole;
  }, [params.role]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function normalizeRole(role?: string): AppRole | undefined {
    if (!role) return undefined;

    const normalized = role.toLowerCase().replace(/[-\s]/g, "_");

    if (normalized === "seller") return "merchant";
    if (normalized === "admin") return "admin";
    if (normalized === "delivery_partner") return "delivery_partner";
    if (normalized === "customer") return "customer";

    return undefined;
  }

  function getPortalLabel(role: string) {
    switch (role) {
      case "admin":
        return "admin";
      case "merchant":
        return "merchant";
      case "delivery_partner":
        return "delivery partner";
      case "customer":
        return "customer";
      default:
        return "user";
    }
  }

  function getRoleMismatchMessage(expectedRole: string) {
    switch (expectedRole) {
      case "admin":
        return "Only admins can log in here.";
      case "merchant":
        return "Only merchants can log in here.";
      case "delivery_partner":
        return "Only delivery partners can log in here.";
      case "customer":
        return "Only customers can log in here.";
      default:
        return "You are not allowed to use this portal.";
    }
  }

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
      return data.detail.map((e: any) => e.msg || "Error").join(", ");
    }

    return "Login failed";
  }

  function redirectByRole(role: AppRole) {
    const routes: Record<AppRole, string> = {
      admin: "/admin/dashboard",
      merchant: "/merchant/dashboard",
      delivery_partner: "/driver/dashboard",
      customer: "/marketplace"
    };

    router.push(routes[role] || "/marketplace");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    localStorage.removeItem("access_token");
    localStorage.removeItem("role");
    localStorage.removeItem("partner_id");

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData.toString()
      });

      const data = await res.json();

      if (!res.ok) {
        setError(parseError(data));
        return;
      }

      const backendRole = data.role as BackendRole | undefined;
      const actualRole = normalizeRole(backendRole);

      if (!actualRole) {
        setError("Login succeeded but role was not returned correctly");
        return;
      }

      if (actualRole !== routeRole) {
        setError(getRoleMismatchMessage(routeRole));
        return;
      }

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("role", actualRole);

      if (actualRole === "delivery_partner" && data.partner_id) {
        localStorage.setItem("partner_id", String(data.partner_id));
      }

      redirectByRole(actualRole);
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold mb-2 text-emerald-800 capitalize">
          Login as {getPortalLabel(routeRole)}
        </h2>

        <p className="text-sm text-gray-500 mb-6">
          Enter your credentials to access the {getPortalLabel(routeRole)} portal.
        </p>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 px-4 py-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 px-4 py-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-700 text-white py-2 rounded hover:bg-emerald-800 disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}