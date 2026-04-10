"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  sub: string;
  exp: number;
  role: string;
}

export default function DashboardQuickAccess() {
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  // 🔥 UPGRADE 1: useEffect now depends on pathname to sync with route changes
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setVisible(false);
      return;
    }

    try {
      const decoded: TokenPayload = jwtDecode(token);
      const now = Date.now() / 1000;

      if (decoded.exp > now) {
        setVisible(true);
      } else {
        localStorage.removeItem("access_token");
        localStorage.removeItem("role");
        setVisible(false);
      }
    } catch {
      localStorage.removeItem("access_token");
      localStorage.removeItem("role");
      setVisible(false);
    }
  }, [pathname]); // 🔥 key upgrade - re-run when route changes

  // Hide on homepage - after hooks are registered
  if (pathname === "/") return null;

  const normalizeRole = (role?: string) => {
    if (!role) return undefined;

    const normalized = role.toLowerCase().replace(/[-\s]/g, "_");

    if (normalized === "seller") return "merchant";
    if (normalized === "admin") return "admin";
    if (normalized === "delivery_partner") return "delivery_partner";
    if (normalized === "customer") return "customer";

    return undefined;
  };

  const redirectByRole = (role: string) => {
    const routes: Record<string, string> = {
      admin: "/admin/dashboard",
      merchant: "/merchant/dashboard",
      delivery_partner: "/driver/dashboard",
      customer: "/marketplace",
    };

    router.push(routes[role] || "/marketplace");
  };

  const handleClick = () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const decoded: TokenPayload = jwtDecode(token);
      const now = Date.now() / 1000;

      if (decoded.exp < now) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("role");
        router.push("/login?next=dashboard");
        return;
      }

      // USE STORED ROLE FIRST (more reliable)
      const storedRole = localStorage.getItem("role");

      if (storedRole) {
        redirectByRole(storedRole);
        return;
      }

      // fallback to token role
      const actualRole = normalizeRole(decoded.role);

      if (!actualRole) {
        // 🔥 UPGRADE 2: Better fallback - keep user inside product experience
        router.push("/marketplace");
        return;
      }

      redirectByRole(actualRole);
    } catch {
      localStorage.removeItem("access_token");
      localStorage.removeItem("role");
      router.push("/login");
    }
  };

  if (!visible) return null;

  return (
    <button
      onClick={handleClick}
      className="
        fixed top-32 right-6 z-[9999]
        bg-emerald-700 hover:bg-emerald-800
        text-white
        p-3 rounded-full
        shadow-lg transition-all duration-200
      "
      title="Dashboard"
    >
      {/* Simple dashboard icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h7v7H3V3zm11 0h7v4h-7V3zM3 14h4v7H3v-7zm7 4h11v3H10v-3z" />
      </svg>
    </button>
  );
}