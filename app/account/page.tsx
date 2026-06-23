"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card"; 
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import Button from "@/components/ui/Button";

import { fetchWithAuth } from "@/lib/api";
import { getMediaUrl } from "@/lib/getMediaUrl";

interface Order {
  id: number;
  merchant_id: number;
  listing_id: number;
  status: string;
  delivery_method: string;
  dropoff_address: string;
  created_at: string;
  total_price?: number;
  delivery_price?: number;
  estimated_delivery_days?: number;
  order_specifications?: string;
}

interface Booking {
  id: number;
  listing_id: number;
  seller_id: number;
  contact_number: string;
  preferred_time: string;
  status: string;
  created_at: string;
}

interface Listing {
  id: number;
  name: string;
  price: number;
  currency: string;
  image_urls?: string[];
  video_url?: string;
}

interface MerchantInfo {
  business_name: string;
  contact_phone: string;
}

export default function AccountPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [listingMap, setListingMap] = useState<Record<number, Listing>>({});
  const [merchantMap, setMerchantMap] = useState<Record<number, MerchantInfo>>({});

  const [activeTab, setActiveTab] = useState("active_orders");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [selectedListingId, setSelectedListingId] = useState<number | null>(null);

  const [profile, setProfile] = useState<any>(null);

  // 🔥 EDIT PROFILE STATE
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    phone_number: "",
    default_address: "",
    city_name: ""
  });
  const [saving, setSaving] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "text-yellow-700 bg-yellow-100";
      case "accepted": return "text-emerald-700 bg-emerald-100";
      case "packaged": return "text-blue-700 bg-blue-100";
      case "in_transit": return "text-indigo-700 bg-indigo-100";
      case "completed": return "text-green-700 bg-green-100";
      case "rejected": return "text-red-700 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  async function loadAccountData() {
    try {
      const [ordersData, bookingsData] = await Promise.all([
        fetchWithAuth("/orders/my-purchases"),
        fetchWithAuth("/bookings/my-bookings"),
      ]);

      const profileData = await fetchWithAuth("/users/me");

      setOrders(ordersData);
      setBookings(bookingsData);
      setProfile(profileData);

      const listings: Record<number, Listing> = {};
      const merchants: Record<number, MerchantInfo> = {};

      const allListingIds = [
        ...ordersData.map((o: Order) => o.listing_id),
        ...bookingsData.map((b: Booking) => b.listing_id),
      ];

      await Promise.all(
        allListingIds.map(async (id: number) => {
          try {
            const data = await fetchWithAuth(`/listings/${id}`);
            listings[id] = data;

            const mId = data.merchant.id;

            if (!merchants[mId]) {
              const mData = await fetchWithAuth(`/merchants/${mId}/storefront`);
              merchants[mId] = {
                business_name: mData.merchant.business_name,
                contact_phone: mData.merchant.contact_phone,
              };
            }
          } catch {}
        })
      );

      setListingMap(listings);
      setMerchantMap(merchants);

    } catch {
      setError("Failed to load account information.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }
    loadAccountData();
  }, []);

  const submitReview = async () => {
    if (!reviewText.trim()) return;

    try {
      await fetchWithAuth("/reviews/", {
        method: "POST",
        body: JSON.stringify({
          listing_id: selectedListingId,
          content: reviewText,
        }),
      });

      setShowReviewModal(false);
      setReviewText("");
      setSelectedListingId(null);

    } catch {
      alert("Failed to submit review.");
    }
  };

  function openEdit() {
    if (!profile) return;

    setEditForm({
      full_name: profile.full_name || "",
      phone_number: profile.phone_number || "",
      default_address: profile.default_address || "",
      city_name: profile.city?.name || ""
    });

    setIsEditing(true);
  }

  async function handleSave() {
    try {
      setSaving(true);

      await fetchWithAuth("/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });

      setIsEditing(false);
      loadAccountData();
    } catch {
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const activeOrders = orders.filter(o => o.status !== "completed");
  const orderHistory = orders.filter(o => o.status === "completed");
  const pendingBookings = bookings.filter(b => b.status === "pending");
  const bookingHistory = bookings.filter(b => b.status !== "pending");

  const renderMedia = (listing?: Listing) => {
    if (!listing) {
      return (
        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
          Loading...
        </div>
      );
    }

    if (listing.image_urls?.length) {
      return (
        <img
          src={getMediaUrl(listing.image_urls[0])}
          className="w-full h-full object-cover"
          alt={listing.name}
        />
      );
    }

    if (listing.video_url) {
      return (
        <video
          src={getMediaUrl(listing.video_url)}
          className="w-full h-full object-cover"
          muted
        />
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
        No Media
      </div>
    );
  };

  const renderCard = (item: any, isOrder: boolean) => {
    const listing = listingMap[item.listing_id];
    const merchant = isOrder
      ? merchantMap[item.merchant_id]
      : merchantMap[item.seller_id];

    const isDeliveryOrder = item.delivery_method === "delivery";

    return (
      <div key={item.id} className="h-full flex flex-col border border-gray-100 rounded-2xl p-3 bg-white shadow-sm hover:shadow-lg transition">

        <div className="w-full h-36 rounded-xl overflow-hidden bg-gray-100">
          {renderMedia(listing)}
        </div>

        <div className="mt-3 flex-1 flex flex-col justify-between">

          <div className="space-y-1">
            <p className="text-sm font-semibold line-clamp-2">{listing?.name}</p>
            <p className="text-xs text-gray-500 line-clamp-1">{merchant?.business_name}</p>
          </div>

          {/* 🔥 PRICE INFORMATION - NULL SAFE */}
          <div className="mt-2 space-y-0.5">
            {item.total_price != null && (
              <p className="text-xs text-gray-600">
                Total: {listing?.currency} {item.total_price.toFixed(2)}
              </p>
            )}
            {isDeliveryOrder && item.delivery_price != null && (
              <p className="text-xs text-gray-600">
                Delivery Fee: {listing?.currency} {item.delivery_price.toFixed(2)}
              </p>
            )}
            {isDeliveryOrder && item.estimated_delivery_days != null && (
              <p className="text-xs text-gray-600">
                Est. Delivery: {item.estimated_delivery_days} day(s)
              </p>
            )}
          </div>

          {/* 🔥 ORDER SPECIFICATIONS (NEW) */}
          {item.order_specifications && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-[10px] font-semibold uppercase text-yellow-700 mb-0.5">
                📋 Order Specifications
              </p>
              <p className="text-xs text-gray-700 whitespace-pre-wrap">
                {item.order_specifications}
              </p>
            </div>
          )}

          <div className="mt-2 flex items-center justify-between">
            <div className={`px-2 py-1 text-[11px] rounded-full ${getStatusColor(item.status)}`}>
              {item.status}
            </div>

            {(isOrder
              ? item.status === "completed"
              : item.status !== "pending"
            ) && (
              <button
                onClick={() => {
                  setSelectedListingId(item.listing_id);
                  setShowReviewModal(true);
                }}
                className="text-[11px] px-2 py-1 rounded bg-emerald-50 text-emerald-700"
              >
                Review
              </button>
            )}
          </div>

        </div>
      </div>
    );
  };

  const dataMap: any = {
    active_orders: activeOrders,
    order_history: orderHistory,
    pending_bookings: pendingBookings,
    booking_history: bookingHistory,
  };

  const tabClass = (tab: string) =>
    `block w-full text-left px-3 py-2 rounded-md ${
      activeTab === tab
        ? "bg-emerald-700 text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <>
      {/* DESKTOP LAYOUT (md and above) */}
      <div className="hidden md:flex gap-8">
        <div className="w-64 flex-shrink-0">
          <div className="bg-white p-6 rounded-xl shadow space-y-2 sticky top-4">

            <h2 className="font-semibold text-lg text-emerald-700 mb-4">
              Account
            </h2>

            <button onClick={() => setActiveTab("profile")} className={tabClass("profile")}>
              My Profile
            </button>

            <button onClick={() => setActiveTab("active_orders")} className={tabClass("active_orders")}>
              Active Orders
            </button>

            <button onClick={() => setActiveTab("order_history")} className={tabClass("order_history")}>
              Orders History
            </button>

            <button onClick={() => setActiveTab("pending_bookings")} className={tabClass("pending_bookings")}>
              Pending Bookings
            </button>

            <button onClick={() => setActiveTab("booking_history")} className={tabClass("booking_history")}>
              Bookings History
            </button>

          </div>
        </div>

        <div className="flex-1 space-y-6 w-full min-w-0">
          <h1 className="text-2xl font-bold">My Account</h1>

          {activeTab === "profile" ? (
            <div className="max-w-md mx-auto">
              <Card className="p-6 space-y-4 rounded-2xl shadow-sm">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-emerald-700">My Profile</h2>
                  <button
                    onClick={openEdit}
                    className="text-gray-400 hover:text-emerald-700 transition text-sm"
                    title="Edit Profile"
                  >
                    ✏️ Edit
                  </button>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500">Full Name</p>
                    <p className="font-medium">{profile?.full_name || "—"}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium">{profile?.email || "—"}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Phone Number</p>
                    <p className="font-medium">{profile?.phone_number || "—"}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Default Address</p>
                    <p className="font-medium">{profile?.default_address || "—"}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">City</p>
                    <p className="font-medium">{profile?.city?.name || "—"}</p>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
              {dataMap[activeTab]?.map((item: any) =>
                renderCard(item, activeTab.includes("order"))
              )}
            </div>
          )}
        </div>
      </div>

      {/* MOBILE LAYOUT (below md) */}
      <div className="block md:hidden">
        <h1 className="text-2xl font-bold mb-6">My Account</h1>

        {activeTab === "profile" ? (
          <div className="max-w-md mx-auto">
            <Card className="p-6 space-y-4 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-emerald-700">My Profile</h2>
                <button
                  onClick={openEdit}
                  className="text-gray-400 hover:text-emerald-700 transition text-sm"
                  title="Edit Profile"
                >
                  ✏️ Edit
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Full Name</p>
                  <p className="font-medium">{profile?.full_name || "—"}</p>
                </div>

                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium">{profile?.email || "—"}</p>
                </div>

                <div>
                  <p className="text-gray-500">Phone Number</p>
                  <p className="font-medium">{profile?.phone_number || "—"}</p>
                </div>

                <div>
                  <p className="text-gray-500">Default Address</p>
                  <p className="font-medium">{profile?.default_address || "—"}</p>
                </div>

                <div>
                  <p className="text-gray-500">City</p>
                  <p className="font-medium">{profile?.city?.name || "—"}</p>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
            {dataMap[activeTab]?.map((item: any) =>
              renderCard(item, activeTab.includes("order"))
            )}
          </div>
        )}
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-[95%] md:w-[500px] rounded-2xl p-6 shadow-xl space-y-4">

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
              placeholder="Default Address"
              value={editForm.default_address}
              onChange={(e) =>
                setEditForm({ ...editForm, default_address: e.target.value })
              }
            />

            <input
              className="w-full border rounded-lg p-2"
              placeholder="City"
              value={editForm.city_name}
              onChange={(e) =>
                setEditForm({ ...editForm, city_name: e.target.value })
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

      {/* REVIEW MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full border rounded-lg p-3 text-sm"
              rows={4}
            />
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowReviewModal(false)}>Cancel</Button>
              <Button onClick={submitReview}>Submit</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}