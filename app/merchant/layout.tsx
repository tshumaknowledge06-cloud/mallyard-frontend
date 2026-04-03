"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [showSidebar, setShowSidebar] = useState(false);

  const links = [
    { href: "/merchant/dashboard", label: "Dashboard" },
    { href: "/merchant/listings", label: "Listings" },
    { href: "/merchant/orders", label: "Orders" },
    { href: "/merchant/history", label: "Order History" },
    { href: "/merchant/deliveries", label: "Deliveries" },
    { href: "/merchant/bookings", label: "Bookings" },
    { href: "/merchant/get-drivers", label: "Find Drivers" },
  ];

  const linkClass = (href: string) =>
    `block px-3 py-2 rounded-md transition ${
      pathname.startsWith(href)
        ? "bg-emerald-700 text-white font-medium"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  // 🔥 AUTO CLOSE ON ROUTE CHANGE (CRITICAL UX FIX)
  useEffect(() => {
    setShowSidebar(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* 🔥 DESKTOP SIDEBAR (ALWAYS VISIBLE ON MD+) */}
      <aside className="hidden md:block w-64 bg-white shadow-md p-6">
        <h2 className="text-xl font-bold mb-6 text-emerald-700">
          Merchant Panel
        </h2>

        <nav className="space-y-2">
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
          <aside className="fixed top-0 left-0 h-full w-64 bg-white shadow-md p-6 z-50 overflow-y-auto">
            <button
              onClick={() => setShowSidebar(false)}
              className="mb-4 text-gray-500"
            >
              ✕ Close
            </button>

            <h2 className="text-xl font-bold mb-6 text-emerald-700">
              Merchant Panel
            </h2>

            <nav className="space-y-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={linkClass(link.href)}
                  onClick={() => setShowSidebar(false)}
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