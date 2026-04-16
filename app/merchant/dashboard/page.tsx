"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import { getMediaUrl } from "@/lib/getMediaUrl";

export default function MerchantDashboard() {
  const router = useRouter();

  const [merchant, setMerchant] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 🔥 EDIT PROFILE STATE
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    business_name: "",
    description: "",
    location: "",
    contact_phone: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const savedRole = localStorage.getItem("role");

    if (!token) {
      setError("Please log in to continue.");
      setLoading(false);
      router.replace("/login/merchant");
      return;
    }

    if (savedRole !== "merchant") {
      setError("Only merchants can use this route.");
      setLoading(false);
      router.replace("/login/merchant");
      return;
    }

    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      setError("");

      const merchantData = await fetchWithAuth("/merchants/me");
      const merchantInfo = merchantData.merchant;

      setMerchant(merchantInfo);

      let listingsData: any[] = [];

      if (merchantInfo?.id) {
        try {
          const storefrontData = await fetchWithAuth(
            `/merchants/${merchantInfo.id}/storefront`
          );
          // 🔥 FIX: Extract listings array from the response object
          listingsData = storefrontData.listings || [];
        } catch {
          listingsData = [];
        }
      }

      const ordersData = await fetchWithAuth("/orders/");
      const deliveriesData = await fetchWithAuth("/delivery-requests/seller");

      let bookingsData: any[] = [];

      try {
        bookingsData = await fetchWithAuth("/bookings");
      } catch {
        bookingsData = [];
      }

      setListings(listingsData);
      setOrders(ordersData);
      setDeliveries(deliveriesData);
      setBookings(bookingsData);
    } catch (err: any) {
      setError(err?.message || "Failed to load merchant dashboard.");
    } finally {
      setLoading(false);
    }
  }

  // 🔥 OPEN EDIT MODAL
  function openEdit() {
    if (!merchant) return;

    setEditForm({
      business_name: merchant.business_name || "",
      description: merchant.description || "",
      location: merchant.location || "",
      contact_phone: merchant.contact_phone || ""
    });

    setIsEditing(true);
  }

  // 🔥 SAVE EDIT
  async function handleSave() {
    try {
      setSaving(true);

      await fetchWithAuth("/merchants/me", {
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

  function handleLogoClick() {
    fileInputRef.current?.click();
  }

  async function handleLogoUpload(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("access_token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/merchants/upload-logo`,
        {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error();

      alert("Logo updated");

      e.target.value = "";
      load();
    } catch {
      alert("Failed to upload logo");
    }
  }

  const activeOrders =
    orders.filter((o: any) => !["rejected", "delivered"].includes(o.status));

  const pendingDeliveries =
    deliveries.filter((d: any) => d.status !== "verified");

  // 🔥 FIX: Show total bookings (not just today's)
  const totalBookings = bookings.length;

  if (loading) return <p className="p-4">Loading dashboard...</p>;
  if (error) return <p className="text-red-600 p-4">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-2 md:px-0">

      <h1 className="text-2xl md:text-3xl font-semibold">
        Merchant Dashboard
      </h1>

      {/* 🔥 PENDING VERIFICATION MESSAGE */}
      {merchant?.status === "pending_verification" && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-yellow-600 text-lg">🟡</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <span className="font-medium">Your store is under verification.</span>
                <br />
                You can create listings now (Navigate via the left menu) — they will go live once approved.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE CARD */}
      {merchant && (
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
          <div className="text-gray-700 space-y-1 flex-1 text-sm md:text-base">

            <p className="text-lg font-semibold">
              {merchant.business_name}
            </p>

            <p>{merchant.description}</p>
            <p>Location: {merchant.location}</p>
            <p>Phone: {merchant.contact_phone}</p>
            <p>Status: {merchant.status}</p>

          </div>

          {/* RIGHT LOGO */}
          <div className="flex flex-col items-center">

            <div
              onClick={handleLogoClick}
              className="w-24 h-24 md:w-28 md:h-28 bg-gray-100 border rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition flex items-center justify-center"
            >
              {merchant.logo_url ? (
                <img
                  src={getMediaUrl(merchant.logo_url)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-xs">
                  Add Logo
                </span>
              )}
            </div>

            <span className="text-[11px] text-gray-500 mt-2">
              Tap to update logo
            </span>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLogoUpload}
              className="hidden"
              accept="image/*"
            />

          </div>

        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">

        <div className="bg-white p-6 rounded-2xl shadow flex flex-col justify-between h-28">
          <p className="text-gray-600 text-sm">
            Total Listings
          </p>
          <h2 className="text-2xl font-bold">
            {listings.length}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow flex flex-col justify-between h-28">
         <p className="text-gray-600 text-sm">
           Active Orders
         </p>
         <h2 className="text-2xl font-bold">
           {activeOrders.length}
         </h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow flex flex-col justify-between h-28">
         <p className="text-gray-600 text-sm">
           Pending Deliveries
         </p>
         <h2 className="text-2xl font-bold">
          {pendingDeliveries.length}
         </h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow flex flex-col justify-between h-28">
         <p className="text-gray-600 text-sm">
           Bookings 
         </p>
         <h2 className="text-2xl font-bold">
          {totalBookings}
         </h2>
        </div>

      </div>

      {/* 🔥 EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-[95%] md:w-[500px] rounded-2xl p-6 shadow-xl space-y-4">

            <h2 className="text-lg font-semibold text-emerald-900">
              Edit Store Profile
            </h2>

            <input
              className="w-full border rounded-lg p-2"
              placeholder="Business Name"
              value={editForm.business_name}
              onChange={(e) =>
                setEditForm({ ...editForm, business_name: e.target.value })
              }
            />

            <textarea
              className="w-full border rounded-lg p-2"
              placeholder="Description"
              rows={3}
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
            />

            <input
              className="w-full border rounded-lg p-2"
              placeholder="Location"
              value={editForm.location}
              onChange={(e) =>
                setEditForm({ ...editForm, location: e.target.value })
              }
            />

            <input
              className="w-full border rounded-lg p-2"
              placeholder="Phone"
              value={editForm.contact_phone}
              onChange={(e) =>
                setEditForm({ ...editForm, contact_phone: e.target.value })
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