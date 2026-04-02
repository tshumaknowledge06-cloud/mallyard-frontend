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

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* 🔥 MOBILE MENU BUTTON */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-white shadow-md rounded-full p-2 text-xl"
      >
        ☰
      </button>

      {/* 🔥 SIDEBAR */}
      <aside
        className={`
          fixed md:relative
          top-0 left-0 h-full md:h-auto
          w-64 bg-white shadow-md z-50
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* 🔥 CLOSE BUTTON (MOBILE) */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <AdminSidebar closeSidebar={() => setSidebarOpen(false)} />
      </aside>

      {/* 🔥 BACKDROP */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
        />
      )}

      {/* 🔥 MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-8 w-full md:ml-0">
        {children}
      </main>
    </div>
  );
}