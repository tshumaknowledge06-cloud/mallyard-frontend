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
    <div className="flex max-w-7xl mx-auto gap-8 relative">

      {/* 🔥 MOBILE MENU BUTTON - ONLY VISIBLE ON MOBILE */}
      <button
        onClick={() => setShowSidebar(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-white shadow-md rounded-full p-2"
      >
        ☰
      </button>

      {/* 🔥 MOBILE SIDEBAR (OVERLAY) - ONLY SHOWS ON MOBILE WHEN TOGGLED */}
      <aside
        className={`
          md:hidden
          fixed top-0 left-0 h-full w-64 bg-white p-6 shadow z-50
          transform transition-transform duration-300
          ${showSidebar ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <button
          onClick={() => setShowSidebar(false)}
          className="mb-4 text-gray-500"
        >
          ✕ Close
        </button>

        <h2 className="font-semibold text-lg text-emerald-700 mb-4">
          Account
        </h2>

        {/* The actual navigation tabs are inside the page component */}
        <p className="text-sm text-gray-500">
          Use the menu above to navigate
        </p>
      </aside>

      {/* 🔥 BACKDROP */}
      {showSidebar && (
        <div
          onClick={() => setShowSidebar(false)}
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
        />
      )}

      {/* 🔥 MAIN CONTENT - Click outside to close sidebar on mobile */}
      <main
        className="flex-1 space-y-6 w-full"
        onClick={() => showSidebar && setShowSidebar(false)}
      >
        {children}
      </main>

    </div>
  );
}