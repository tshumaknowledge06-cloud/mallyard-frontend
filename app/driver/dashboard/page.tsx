"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";

export default function DriverDashboard() {
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const savedRole = localStorage.getItem("role");

    if (!token) {
      setError("Please log in to continue.");
      setLoading(false);
      router.replace("/login/delivery_partner");
      return;
    }

    if (savedRole !== "delivery_partner") {
      setError("Only delivery partners can use this route.");
      setLoading(false);
      router.replace("/login/delivery_partner");
      return;
    }

    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      setError("");

      const profileData = await fetchWithAuth("/delivery/me");
      const deliveriesData = await fetchWithAuth("/delivery-requests/partner");

      setProfile(profileData);
      setDeliveries(deliveriesData);
    } catch (err: any) {
      setError(err?.message || "Failed to load driver dashboard.");
    } finally {
      setLoading(false);
    }
  }

  async function uploadProfileImage(file: File) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("access_token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/delivery/upload-profile-image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!res.ok) throw new Error();

      load();
    } catch {
      alert("Failed to upload profile image");
    }
  }

  async function uploadVehicleImage(file: File) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("access_token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/delivery/upload-vehicle-image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!res.ok) throw new Error();

      load();
    } catch {
      alert("Failed to upload vehicle image");
    }
  }

  const completed =
    deliveries.filter((d: any) => d.status === "verified").length;

  const active =
    deliveries.filter(
      (d: any) => !["verified", "rejected"].includes(d.status)
    ).length;

  if (loading) return <p className="p-6">Loading dashboard...</p>;
  if (error) return <p className="text-red-600 p-6">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-2 md:px-0">

      <h1 className="text-2xl md:text-3xl font-semibold">
        Driver Dashboard
      </h1>

      {/* PROFILE CARD */}
      {profile && (
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow flex flex-col md:flex-row gap-6 md:items-center justify-between">

          {/* LEFT */}
          <div className="space-y-2 flex-1">

            <h2 className="text-lg md:text-xl font-semibold">
              {profile.full_name}
            </h2>

            <p className="text-gray-600 text-sm">
              {profile.phone_number}
            </p>

            <p className="text-gray-500 text-xs">
              {profile.operating_city}
            </p>

            <div className="pt-2 space-y-1 text-xs md:text-sm">
              <p>Trust Score ⭐ : {profile.trust_score}</p>
              <p>Completed Deliveries: {profile.completed_deliveries}</p>
              <p>Vehicle: {profile.vehicle_type}</p>
            </div>

          </div>

          {/* RIGHT IMAGES */}
          <div className="flex w-full md:w-auto justify-between md:justify-end gap-6">

            {/* PROFILE IMAGE */}
            <div className="flex flex-col items-center w-1/2 md:w-auto">

              <p className="text-[11px] text-gray-500 mb-1">
                Your Profile Picture
              </p>

              <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border bg-gray-100">
                <img
                  src={
                    profile.profile_image_url
                      ? `${BASE_URL}${profile.profile_image_url}`
                      : "/default-avatar.png"
                  }
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 🔥 HIDDEN INPUT */}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="profileUpload"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadProfileImage(file);
                }}
              />

              {/* 🔥 GOLD BUTTON */}
              <label
                htmlFor="profileUpload"
                className="
                  mt-2
                  text-[11px]
                  px-3 py-1.5
                  rounded-full
                  border border-yellow-400
                  text-yellow-600
                  cursor-pointer
                  shadow-sm
                  hover:shadow-[0_0_10px_rgba(234,179,8,0.6)]
                  hover:bg-yellow-50
                  transition-all
                "
              >
                Edit Profile
              </label>

            </div>

            {/* VEHICLE IMAGE */}
            <div className="flex flex-col items-center w-1/2 md:w-auto">

              <p className="text-[11px] text-gray-500 mb-1">
                Your Vehicle Picture
              </p>

              <div className="w-24 h-16 md:w-32 md:h-20 rounded-xl overflow-hidden border bg-gray-100">
                <img
                  src={
                    profile.vehicle_image_url
                      ? `${BASE_URL}${profile.vehicle_image_url}`
                      : "/default-vehicle.png"
                  }
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 🔥 HIDDEN INPUT */}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="vehicleUpload"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadVehicleImage(file);
                }}
              />

              {/* 🔥 GOLD BUTTON */}
              <label
                htmlFor="vehicleUpload"
                className="
                  mt-2
                  text-[11px]
                  px-3 py-1.5
                  rounded-full
                  border border-yellow-400
                  text-yellow-600
                  cursor-pointer
                  shadow-sm
                  hover:shadow-[0_0_10px_rgba(234,179,8,0.6)]
                  hover:bg-yellow-50
                  transition-all
                "
              >
                Edit Vehicle
              </label>

            </div>

          </div>
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-2 gap-4 md:gap-6">

        <div className="bg-white p-4 md:p-6 rounded-2xl shadow">
          <p className="text-gray-600 text-sm">
            Active Deliveries
          </p>
          <h2 className="text-xl md:text-2xl font-bold">
            {active}
          </h2>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-2xl shadow">
          <p className="text-gray-600 text-sm">
            Verified Deliveries
          </p>
          <h2 className="text-xl md:text-2xl font-bold">
            {completed}
          </h2>
        </div>

      </div>

    </div>
  );
}