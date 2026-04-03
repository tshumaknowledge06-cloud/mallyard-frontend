"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [showSidebar, setShowSidebar] = useState(false);

  const links = [
    { href: "/driver/dashboard", label: "Dashboard" },
    { href: "/driver/assigned", label: "Assigned Deliveries" },
    { href: "/driver/history", label: "Delivery History" },
  ];

  // 🔥 AUTO CLOSE ON ROUTE CHANGE
  useEffect(() => {
    setShowSidebar(false);
  }, [pathname]);

  const linkClass = (href: string) => {
    const active = pathname.startsWith(href);
    return `block px-4 py-2 rounded-md transition ${
      active
        ? "bg-emerald-600 text-white font-medium"
        : "text-gray-700 hover:bg-gray-100"
    }`;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* 🔥 DESKTOP SIDEBAR (ALWAYS VISIBLE ON MD+) */}
      <aside className="hidden md:block w-64 bg-white border-r">
        {/* HEADER */}
        <div className="p-6 border-b">
          <h2 className="font-semibold text-lg text-emerald-700">
            Driver Panel
          </h2>
        </div>

        {/* NAV */}
        <nav className="p-4 space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={linkClass(link.href)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* 🔥 MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-8 w-full">
        {/* MOBILE MENU BUTTON - INSIDE MAIN, BELOW HEADER */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setShowSidebar(true)}
            className="bg-white shadow-md rounded-full p-2 text-xl"
          >
            ☰
          </button>
        </div>

        {children}
      </main>

      {/* 🔥 MOBILE SIDEBAR (CONDITIONAL OVERLAY) */}
      {showSidebar && (
        <>
          {/* BACKDROP */}
          <div
            onClick={() => setShowSidebar(false)}
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
          />

          {/* SIDEBAR */}
          <aside className="fixed top-0 left-0 h-full w-64 bg-white border-r z-50 overflow-y-auto">
            {/* CLOSE BUTTON */}
            <div className="flex justify-end p-4">
              <button
                onClick={() => setShowSidebar(false)}
                className="text-gray-500"
              >
                ✕
              </button>
            </div>

            {/* HEADER */}
            <div className="p-6 border-b">
              <h2 className="font-semibold text-lg text-emerald-700">
                Driver Panel
              </h2>
            </div>

            {/* NAV */}
            <nav className="p-4 space-y-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setShowSidebar(false)}
                  className={linkClass(link.href)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </aside>
        </>
      )}

    </div>
  );
}