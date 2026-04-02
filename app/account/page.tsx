"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card"; 
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import Button from "@/components/ui/Button";

import { fetchWithAuth } from "@/lib/api";

interface Order {
  id: number;
  merchant_id: number;
  listing_id: number;
  status: string;
  delivery_method: string;
  dropoff_address: string;
  created_at: string;
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

  const [profile, setProfile] = useState<{ full_name: string; email: string } | null>(null);

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
            // ✅ FIX: Directly assign data from fetchWithAuth
            const data = await fetchWithAuth(`/listings/${id}`);
            listings[id] = data;

            const mId = data.merchant.id;

            if (!merchants[mId]) {
              // ✅ FIX: Fixed Merchant Fetch pattern
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

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const activeOrders = orders.filter(o => o.status !== "completed");
  const orderHistory = orders.filter(o => o.status === "completed");
  const pendingBookings = bookings.filter(b => b.status === "pending");
  const bookingHistory = bookings.filter(b => b.status !== "pending");

  // ✅ FIX: Enhanced Media Renderer
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
          src={`${process.env.NEXT_PUBLIC_API_URL}${listing.image_urls[0]}`}
          className="w-full h-full object-cover"
          alt={listing.name}
        />
      );
    }

    if (listing.video_url) {
      return (
        <video
          src={`${process.env.NEXT_PUBLIC_API_URL}${listing.video_url}`}
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

          <div className="mt-3 flex items-center justify-between">
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
      {/* DESKTOP SIDEBAR ONLY - hidden on mobile, layout handles mobile overlay */}
      <div className="hidden md:block w-64">
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

      {/* MAIN CONTENT */}
      <div className="flex-1 space-y-6 w-full">

        <h1 className="text-2xl font-bold">My Account</h1>

        {activeTab === "profile" ? (
          <div className="max-w-md mx-auto">
            <Card className="p-6 space-y-4 rounded-2xl shadow-sm">
              <h2 className="text-lg font-semibold text-emerald-700">My Profile</h2>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Full Name</p>
                  <p className="font-medium">{profile?.full_name || "—"}</p>
                </div>

                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium">{profile?.email || "—"}</p>
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

      {/* MODAL */}
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