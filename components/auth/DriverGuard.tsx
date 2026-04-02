"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import LoadingState from "@/components/ui/LoadingState";

export default function DriverGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkDriver();
  }, []);

  async function checkDriver() {
    try {
      const data = await fetchWithAuth("/delivery/me");

      if (data.status !== "active") {
        router.push("/driver/pending");
        return;
      }

      setLoading(false);
    } catch {
      router.push("/auth/login");
    }
  }

  if (loading) return <LoadingState />;

  return <>{children}</>;
}