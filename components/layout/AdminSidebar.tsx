"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar({ closeSidebar }: { closeSidebar?: () => void }) {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/drivers", label: "Drivers" },
    { href: "/admin/merchants", label: "Merchants" }, // ✅ NEW
    { href: "/admin/deliveries", label: "Deliveries" },
    { href: "/admin/analytics", label: "Analytics" },
  ];

  return (
    <aside className="w-64 bg-white border-r min-h-screen">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold text-gray-800">
          Admin Panel
        </h2>
      </div>

      <nav className="p-4 space-y-2">
        {links.map((link) => {
          const active =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);
                
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => closeSidebar?.()}
              className={`block px-4 py-2 rounded text-sm transition ${
                active
                  ? "bg-emerald-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}