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

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) return;

    try {
      const decoded: TokenPayload = jwtDecode(token);

      const now = Date.now() / 1000;

      if (decoded.exp > now) {
        setVisible(true);
      } else {
        localStorage.removeItem("access_token");
      }
    } catch {
      localStorage.removeItem("access_token");
    }
  }, []);

  // 🔥 FIX: Move conditional return AFTER all hooks
  // Hide on homepage - but after hooks are registered
  if (pathname === "/") return null;

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
        router.push("/login?next=dashboard");
        return;
      }

      if (decoded.role === "seller") {
        router.push("/merchant/dashboard");
      } else if (decoded.role === "delivery_partner") {
        router.push("/delivery/dashboard");
      } else {
        router.push("/");
      }
    } catch {
      localStorage.removeItem("access_token");
      router.push("/login");
    }
  };

  if (!visible) return null;

  return (
    <button
      onClick={handleClick}
      className="
        fixed top-20 right-6 z-50
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