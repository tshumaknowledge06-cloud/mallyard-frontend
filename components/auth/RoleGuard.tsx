"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type RoleGuardProps = {
  allowedRoles: string[];
  children: React.ReactNode;
};

export default function RoleGuard({
  allowedRoles,
  children
}: RoleGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [authorized, setAuthorized] = useState(false);
  const [message, setMessage] = useState("Checking access...");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("role");

    if (!token) {
      setAuthorized(false);
      setMessage("Please log in to continue");

      setTimeout(() => {
        router.replace("/");
      }, 1200);

      return;
    }

    if (!role) {
      localStorage.removeItem("access_token");
      setAuthorized(false);
      setMessage("Session error. Please log in again");

      setTimeout(() => {
        router.replace("/");
      }, 1200);

      return;
    }

    if (!allowedRoles.includes(role)) {
      setAuthorized(false);

      const allowedLabel =
        allowedRoles.length === 1
          ? allowedRoles[0].replace("_", " ")
          : allowedRoles.map((r) => r.replace("_", " ")).join(", ");

      setMessage(`Access denied. Only ${allowedLabel} can use this route.`);

      setTimeout(() => {
        if (role === "admin") router.replace("/admin/dashboard");
        else if (role === "merchant") router.replace("/merchant/dashboard");
        else if (role === "delivery_partner") router.replace("/driver/dashboard");
        else router.replace("/marketplace");
      }, 1400);

      return;
    }

    setAuthorized(true);
  }, [allowedRoles, pathname, router]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50 px-4">
        <div className="w-full max-w-md rounded-xl bg-white shadow-md border border-gray-100 p-6 text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Access restricted
          </h1>
          <p className="text-sm text-gray-600">{message}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}