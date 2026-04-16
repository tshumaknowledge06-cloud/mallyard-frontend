"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import { getMediaUrl } from "@/lib/getMediaUrl";

export default function DriverDashboard() {
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  // 🔥 EDIT PROFILE STATE
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    phone_number: "",
    operating_city: "",
    vehicle_type: ""
  });
  const [saving, setSaving] = useState(false);

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

  // 🔥 OPEN EDIT MODAL
  function openEdit() {
    if (!profile) return;

    setEditForm({
      full_name: profile.full_name || "",
      phone_number: profile.phone_number || "",
      operating_city: profile.operating_city || "",
      vehicle_type: profile.vehicle_type || ""
    });

    setIsEditing(true);
  }

  // 🔥 SAVE EDIT
  async function handleSave() {
    try {
      setSaving(true);

      await fetchWithAuth("/delivery/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });

      setIsEditing(false);
      load(); // refresh data
    } catch {
      alert("Failed to update profile");
    } finally {
      setSaving(false);
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
        <div className="relative bg-white p-4 md:p-6 rounded-2xl shadow flex flex-col md:flex-row gap-6 md:items-center justify-between">

          {/* 🔥 EDIT ICON (TOP RIGHT) */}
          <button
            onClick={openEdit}
            className="absolute top-4 right-4 text-gray-400 hover:text-emerald-700 transition"
            title="Edit Profile"
          >
            ✏️
          </button>

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
                      ? getMediaUrl(profile.profile_image_url)
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

              {/* 🔥 GOLD BUTTON - UPDATED LABEL */}
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
                Update Photo
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
                      ? getMediaUrl(profile.vehicle_image_url)
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

              {/* 🔥 GOLD BUTTON - UPDATED LABEL */}
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
                Update Vehicle
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

      {/* 🔥 EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-[95%] md:w-[480px] rounded-2xl p-6 shadow-xl space-y-4">

            <h2 className="text-lg font-semibold text-emerald-900">
              Edit Profile
            </h2>

            <input
              className="w-full border rounded-lg p-2"
              placeholder="Full Name"
              value={editForm.full_name}
              onChange={(e) =>
                setEditForm({ ...editForm, full_name: e.target.value })
              }
            />

            <input
              className="w-full border rounded-lg p-2"
              placeholder="Phone Number"
              value={editForm.phone_number}
              onChange={(e) =>
                setEditForm({ ...editForm, phone_number: e.target.value })
              }
            />

            <input
              className="w-full border rounded-lg p-2"
              placeholder="Operating City"
              value={editForm.operating_city}
              onChange={(e) =>
                setEditForm({ ...editForm, operating_city: e.target.value })
              }
            />

            <input
              className="w-full border rounded-lg p-2"
              placeholder="Vehicle Type"
              value={editForm.vehicle_type}
              onChange={(e) =>
                setEditForm({ ...editForm, vehicle_type: e.target.value })
              }
            />

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Done"}
              </button>

              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}