"use client";

import { useEffect, useState } from "react";

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
}

export default function GetDriversPage() {

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ NEW: city filter state
  const [city, setCity] = useState("");

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async (cityFilter?: string) => {
    try {
      setLoading(true);

      let url = "/delivery/";

      // ✅ APPLY FILTER
      if (cityFilter && cityFilter.trim() !== "") {
        url += `?city=${encodeURIComponent(cityFilter)}`;
      }

      const res = await fetch(
       `${process.env.NEXT_PUBLIC_API_URL}${url}`
      );

      if (!res.ok) throw new Error();

      const data = await res.json();
      setDrivers(data);

    } catch {
      setError("Failed to load delivery partners");
    }

    setLoading(false);
  };

  // ✅ HANDLE SEARCH
  const handleSearch = () => {
    fetchDrivers(city);
  };

  if (loading) return <p className="p-6">Loading drivers...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
        Available Delivery Partners
      </h1>

      {/* 🔥 FILTER BAR - FULLY RESPONSIVE */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 sm:mb-10">

        <input
          type="text"
          placeholder="Enter city (e.g. Bulawayo)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="border rounded-lg px-4 py-2 w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        <div className="flex gap-3">
          <button
            onClick={handleSearch}
            className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition flex-1 sm:flex-none"
          >
            Search
          </button>

          <button
            onClick={() => {
              setCity("");
              fetchDrivers();
            }}
            className="border px-6 py-2 rounded-lg hover:bg-gray-100 transition flex-1 sm:flex-none"
          >
            Reset
          </button>
        </div>

      </div>

      {drivers.length === 0 && (
        <p className="text-gray-500">
          No delivery partners available.
        </p>
      )}

      {/* 🔥 GRID: 2 columns on mobile, 2 on tablet, 3 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">

        {drivers.map((driver) => (

          <div
            key={driver.id}
            className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden"
          >

            {/* 🔥 TOP MEDIA SECTION */}
            <div className="relative">

              <img
                src={
                  driver.profile_image_url
                    ? `${process.env.NEXT_PUBLIC_API_URL}${driver.profile_image_url}`
                    : "/default-avatar.png"
                }
                className="w-full h-32 sm:h-40 md:h-48 object-cover"
              />

              {driver.vehicle_image_url && (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}${driver.vehicle_image_url}`}
                  className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-12 h-9 sm:w-16 sm:h-12 object-cover rounded border shadow"
                />
              )}

            </div>

            {/* 🔥 MAIN INFO */}
            <div className="p-3 sm:p-5 space-y-2 sm:space-y-3">

              <div className="flex justify-between items-center gap-2">

                <h2 className="text-sm sm:text-base md:text-lg font-semibold truncate">
                  {driver.full_name}
                </h2>

                <span
                  className={`
                    text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap
                    ${driver.is_active
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-200 text-gray-600"}
                  `}
                >
                  {driver.is_active ? "Active" : "Offline"}
                </span>

              </div>

              <p className="text-xs sm:text-sm text-gray-500 capitalize">
                {driver.vehicle_type}
              </p>

              <div className="flex justify-between text-xs sm:text-sm">

                <span className="text-yellow-600 font-medium">
                  ⭐ {driver.trust_score}
                </span>

                <span className="text-gray-600">
                  {driver.completed_deliveries} deliveries
                </span>

              </div>

              <div className="border-t pt-2 sm:pt-3 text-xs sm:text-sm text-gray-700 space-y-0.5 sm:space-y-1">

                <p className="truncate">📍 {driver.operating_city}</p>
                <p className="truncate">📞 {driver.phone_number}</p>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}