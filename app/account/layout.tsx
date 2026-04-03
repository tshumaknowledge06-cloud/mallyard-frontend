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

  const tabClass = (tab: string, currentTab: string) =>
    `block w-full text-left px-3 py-2 rounded-md transition ${
      pathname === tab
        ? "bg-emerald-700 text-white font-medium"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">

      {/* MOBILE MENU BUTTON */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setShowSidebar(true)}
          className="bg-white shadow-md rounded-full p-2 text-xl"
        >
          ☰
        </button>
      </div>

      {/* DESKTOP LAYOUT: SIDEBAR + CONTENT SIDE BY SIDE */}
      <div className="flex gap-8">
        {/* CHILDREN (page.tsx) will provide desktop sidebar + content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>

      {/* 🔥 MOBILE SIDEBAR (CONDITIONAL OVERLAY) */}
      {showSidebar && (
        <>
          {/* BACKDROP */}
          <div
            onClick={() => setShowSidebar(false)}
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
          />

          {/* SIDEBAR */}
          <aside className="md:hidden fixed top-0 left-0 h-full w-64 bg-white p-6 shadow z-50 overflow-y-auto">
            <button
              onClick={() => setShowSidebar(false)}
              className="mb-4 text-gray-500"
            >
              ✕ Close
            </button>

            <h2 className="font-semibold text-lg text-emerald-700 mb-4">
              Account
            </h2>

            <nav className="space-y-2">
              <button
                onClick={() => {
                  window.location.href = "/account";
                  setShowSidebar(false);
                }}
                className={tabClass("/account", pathname)}
              >
                My Profile
              </button>

              <button
                onClick={() => {
                  window.location.href = "/account?tab=active_orders";
                  setShowSidebar(false);
                }}
                className={tabClass("/account?tab=active_orders", pathname)}
              >
                Active Orders
              </button>

              <button
                onClick={() => {
                  window.location.href = "/account?tab=order_history";
                  setShowSidebar(false);
                }}
                className={tabClass("/account?tab=order_history", pathname)}
              >
                Orders History
              </button>

              <button
                onClick={() => {
                  window.location.href = "/account?tab=pending_bookings";
                  setShowSidebar(false);
                }}
                className={tabClass("/account?tab=pending_bookings", pathname)}
              >
                Pending Bookings
              </button>

              <button
                onClick={() => {
                  window.location.href = "/account?tab=booking_history";
                  setShowSidebar(false);
                }}
                className={tabClass("/account?tab=booking_history", pathname)}
              >
                Bookings History
              </button>
            </nav>
          </aside>
        </>
      )}

    </div>
  );
}