"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showSidebar, setShowSidebar] = useState(false);
  const pathname = usePathname();

  // 🔥 auto close on navigation
  useEffect(() => {
    setShowSidebar(false);
  }, [pathname]);

  return (
    <div className="flex max-w-7xl mx-auto gap-8">

      {/* 🔥 MOBILE BUTTON */}
      <button
        onClick={() => setShowSidebar(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-white shadow-md rounded-full p-2"
      >
        ☰
      </button>

      {/* 🔥 SIDEBAR */}
      <aside
        className={`
          fixed md:relative
          top-0 left-0 h-full md:h-fit
          w-64 bg-white p-6 shadow z-50
          transform transition-transform duration-300
          ${showSidebar ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* CLOSE */}
        <button
          onClick={() => setShowSidebar(false)}
          onTouchStart={() => setShowSidebar(false)}
          className="md:hidden mb-4"
        >
          ✕ Close
        </button>

        <h2 className="font-semibold text-lg text-emerald-700 mb-4">
          Account
        </h2>

        {/* NOTE: Tabs stay in page (state logic stays there) */}
        {children && null}
      </aside>

      {/* 🔥 BACKDROP */}
      {showSidebar && (
        <div
          onClick={() => setShowSidebar(false)}
          onTouchStart={() => setShowSidebar(false)}
          className="fixed inset-0 bg-black/30 md:hidden"
        />
      )}

      {/* 🔥 MAIN */}
      <main className="flex-1 space-y-6 w-full">
        {children}
      </main>

    </div>
  );
}