"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";

import { fetchWithAuth } from "@/lib/api";
import { getMediaUrl } from "@/lib/getMediaUrl";

interface Driver {
  id: number;
  full_name: string;
  phone_number: string;
  vehicle_type: string;
  operating_city: string;
  is_active: boolean;
  trust_score: number;
  completed_deliveries: number;
  profile_image_url?: string;
  vehicle_image_url?: string;
  created_at: string;
}

export default function DriversAdminPage() {

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activatingId, setActivatingId] = useState<number | null>(null);

  async function loadDrivers() {
    setLoading(true);
    setError("");

    try {
      const [active, pending] = await Promise.all([
        fetchWithAuth("/delivery/"),
        fetchWithAuth("/delivery/pending"),
      ]);

      const combined = [...pending, ...active];
      setDrivers(combined);

    } catch {
      setError("Failed to load drivers.");
    } finally {
      setLoading(false);
    }
  }

  async function handleActivate(id: number) {
    setActivatingId(id);

    try {
      await fetchWithAuth(`/delivery/${id}/activate`, {
        method: "PUT",
      });

      await loadDrivers();

    } catch {
      alert("Failed to activate driver.");
    } finally {
      setActivatingId(null);
    }
  }

  useEffect(() => {
    loadDrivers();
  }, []);

  if (loading) return <LoadingState />;

  if (error)
    return (
      <ErrorState
        message={error}
        action={<Button onClick={loadDrivers}>Retry</Button>}
      />
    );

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-10">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-emerald-900">
            Driver Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage active and pending delivery partners.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={loadDrivers} className="w-full sm:w-auto">
          Refresh
        </Button>
      </div>

      {/* EMPTY */}
      {drivers.length === 0 ? (
        <EmptyState
          title="No drivers found"
          message="There are currently no registered delivery partners."
        />
      ) : (

        /* GRID - 2 cards on mobile, 2 on tablet, 3 on desktop */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

          {drivers.map((driver) => (

            <Card
              key={driver.id}
              className="
                p-4 sm:p-5
                rounded-2xl
                bg-white/70
                backdrop-blur-xl
                border border-gray-100
                shadow-md
                hover:shadow-lg
                transition-all
                duration-200
                space-y-3 sm:space-y-4
              "
            >

              {/* TOP PROFILE */}
              <div className="flex items-center gap-3 sm:gap-4">

                <img
                  src={
                    driver.profile_image_url
                      ? getMediaUrl(driver.profile_image_url)
                      : "/placeholder-avatar.png"
                  }
                  alt="profile"
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-emerald-100"
                />

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                    {driver.full_name}
                  </h3>

                  <p className="text-[10px] sm:text-xs text-gray-400">
                    ID: #{driver.id}
                  </p>
                </div>

              </div>

              {/* VEHICLE IMAGE */}
              {driver.vehicle_image_url && (
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={getMediaUrl(driver.vehicle_image_url)}
                    alt="vehicle"
                    className="w-full h-28 sm:h-32 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              {/* DETAILS */}
              <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                <p className="flex items-center gap-2">
                  <span className="font-medium min-w-[48px]">Phone:</span>
                  <span className="truncate">{driver.phone_number}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium min-w-[48px]">Vehicle:</span>
                  <span className="capitalize">{driver.vehicle_type}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium min-w-[48px]">City:</span>
                  <span>{driver.operating_city}</span>
                </p>
              </div>

              {/* METRICS */}
              <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                <span className="bg-emerald-50 text-emerald-700 px-2 sm:px-3 py-1 rounded-full font-medium">
                  ⭐ Trust: {driver.trust_score}
                </span>

                <span className="bg-blue-50 text-blue-700 px-2 sm:px-3 py-1 rounded-full font-medium">
                  🚚 {driver.completed_deliveries} deliveries
                </span>
              </div>

              {/* STATUS + ACTION */}
              <div className="flex items-center justify-between pt-2 gap-3">

                {driver.is_active ? (
                  <span className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs rounded-full bg-green-100 text-green-700 font-medium">
                    ● Active
                  </span>
                ) : (
                  <span className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs rounded-full bg-yellow-100 text-yellow-700 font-medium">
                    ● Pending
                  </span>
                )}

                {!driver.is_active && (
                  <Button
                    size="sm"
                    onClick={() => handleActivate(driver.id)}
                    disabled={activatingId === driver.id}
                    className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
                  >
                    {activatingId === driver.id
                      ? "Activating..."
                      : "Activate"}
                  </Button>
                )}

              </div>

            </Card>

          ))}

        </div>

      )}

    </div>
  );
}