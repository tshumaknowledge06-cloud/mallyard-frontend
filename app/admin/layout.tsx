"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminSidebar from "@/components/layout/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/admin/login";

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (isLoginPage) return;

    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/admin/login");
    }
  }, [router, isLoginPage]);

  // 🔥 AUTO CLOSE ON ROUTE CHANGE
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* 🔥 MOBILE MENU BUTTON */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden fixed top-4 left-4 z-40 bg-white shadow-md rounded-full p-2 text-xl"
        >
          ☰
        </button>
      )}

      {/* 🔥 DESKTOP SIDEBAR (ALWAYS VISIBLE ON MD+) */}
      <div className="hidden md:block w-64 bg-white shadow-md">
        <AdminSidebar closeSidebar={() => {}} />
      </div>

      {/* 🔥 MOBILE SIDEBAR (CONDITIONAL OVERLAY) */}
      {sidebarOpen && (
        <>
          {/* BACKDROP */}
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
          />

          {/* SIDEBAR */}
          <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-md z-50">
            <AdminSidebar closeSidebar={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* 🔥 MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-8 w-full">
        {children}
      </main>

    </div>
  );
}