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

  const today = new Date().toDateString();

  const bookingsToday =
    bookings.filter(
      (b: any) =>
        new Date(b.preferred_time).toDateString() === today
    );

  if (loading) return <p className="p-4">Loading dashboard...</p>;
  if (error) return <p className="text-red-600 p-4">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-2 md:px-0">

      <h1 className="text-2xl md:text-3xl font-semibold">
        Merchant Dashboard
      </h1>

      {/* PROFILE CARD */}
      {merchant && (
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow flex flex-col md:flex-row gap-6 md:items-center justify-between">

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

        <div className="bg-white p-4 md:p-6 rounded-2xl shadow">
          <p className="text-gray-600 text-sm">Total Listings</p>
          <h2 className="text-xl md:text-2xl font-bold">
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
          {bookingsToday.length}
         </h2>
        </div>

      </div>

    </div>
  );
}