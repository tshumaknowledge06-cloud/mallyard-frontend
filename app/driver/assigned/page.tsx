"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import DeliveryProgressTracker from "@/components/ui/DeliveryProgressTracker";

// 🔥 Helper function to generate Google Maps link
function getGoogleMapsLink(address: string) {
  if (!address || address.trim() === "") return "#";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

// 🔥 Helper function to generate tel link
function getTelLink(phone?: string) {
  if (!phone || phone.trim() === "") return null;
  // Remove spaces for clean dialer
  const cleanPhone = phone.replace(/\s/g, "");
  return `tel:${cleanPhone}`;
}

// 🔥 Helper function to copy phone number to clipboard
async function copyToClipboard(phone: string) {
  try {
    await navigator.clipboard.writeText(phone);
    alert("Phone number copied to clipboard!");
  } catch {
    alert("Failed to copy phone number");
  }
}

export default function AssignedDeliveries() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data =
        await fetchWithAuth("/delivery-requests/partner");

      const active = data.filter(
        (d: any) => !["delivered", "verified", "rejected"].includes(d.status)
      );

      setDeliveries(active);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: number, newStatus: string) {
    try {
      setUpdatingId(id);

      await fetchWithAuth(
        `/delivery-requests/${id}/status?new_status=${newStatus}`,
        { method: "PATCH" }
      );

      await load();
    } catch {
      alert("Status update failed");
    } finally {
      setUpdatingId(null);
    }
  }

  function nextStep(status: string) {
    if (status === "accepted") return "picked_up";
    if (status === "picked_up") return "in_transit";
    if (status === "in_transit") return "delivered";
    return null;
  }

  if (loading) {
    return <p>Loading deliveries...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-0">
      <h1 className="text-xl sm:text-2xl font-semibold mb-2">
        Assigned Deliveries
      </h1>

      <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
        View delivery details, contact seller or customer, and update delivery progress.
      </p>

      {deliveries.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No active deliveries assigned to you right now.
        </p>
      ) : (
        <div className="space-y-4 sm:space-y-5">
          {deliveries.map((d) => (
            <div
              key={d.delivery_request_id}
              className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow border border-gray-100"
            >
              <div className="flex flex-col gap-2 sm:gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                    {d.listing_name}
                  </h2>

                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                    Order #{d.order_id} • Delivery Request #{d.delivery_request_id}
                  </p>
                </div>

                <span className="inline-flex w-fit rounded-full bg-gray-100 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-gray-700 capitalize">
                  {d.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-5 text-sm">
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1 sm:mb-2">
                    Item Details
                  </p>
                  <p className="text-xs sm:text-sm text-gray-800 break-words">
                    <span className="font-medium">Listing:</span> {d.listing_name}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-800 mt-1">
                    <span className="font-medium">Quantity:</span> {d.quantity}
                  </p>
                </div>

                {/* 🔥 SELLER DETAILS WITH CALL BUTTON */}
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1 sm:mb-2">
                    Seller Details
                  </p>
                  <p className="text-xs sm:text-sm text-gray-800 break-words">
                    <span className="font-medium">Seller:</span> {d.seller_name}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs sm:text-sm text-gray-800">
                      <span className="font-medium">Phone:</span>
                    </span>
                    {getTelLink(d.seller_phone) ? (
                      <>
                        <a
                          href={getTelLink(d.seller_phone)!}
                          className="
                            px-2 sm:px-3 py-1
                            rounded-full
                            bg-emerald-50
                            border border-emerald-200
                            text-emerald-700
                            text-[10px] sm:text-xs
                            font-medium
                            hover:bg-emerald-100
                            transition
                            inline-flex items-center gap-1
                          "
                        >
                          📞 Call Seller
                        </a>
                        <button
                          onClick={() => copyToClipboard(d.seller_phone)}
                          className="
                            px-2 sm:px-3 py-1
                            rounded-full
                            bg-gray-100
                            border border-gray-200
                            text-gray-600
                            text-[10px] sm:text-xs
                            font-medium
                            hover:bg-gray-200
                            transition
                            inline-flex items-center gap-1
                          "
                        >
                          📋 Copy
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400 text-xs">Not available</span>
                    )}
                  </div>
                </div>

                {/* 🔥 CUSTOMER DETAILS WITH CALL BUTTON */}
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1 sm:mb-2">
                    Customer Details
                  </p>
                  <p className="text-xs sm:text-sm text-gray-800 break-words">
                    <span className="font-medium">Customer:</span> {d.customer_name}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs sm:text-sm text-gray-800">
                      <span className="font-medium">Phone:</span>
                    </span>
                    {getTelLink(d.customer_phone) ? (
                      <>
                        <a
                          href={getTelLink(d.customer_phone)!}
                          className="
                            px-2 sm:px-3 py-1
                            rounded-full
                            bg-blue-50
                            border border-blue-200
                            text-blue-700
                            text-[10px] sm:text-xs
                            font-medium
                            hover:bg-blue-100
                            transition
                            inline-flex items-center gap-1
                          "
                        >
                          📞 Call Customer
                        </a>
                        <button
                          onClick={() => copyToClipboard(d.customer_phone)}
                          className="
                            px-2 sm:px-3 py-1
                            rounded-full
                            bg-gray-100
                            border border-gray-200
                            text-gray-600
                            text-[10px] sm:text-xs
                            font-medium
                            hover:bg-gray-200
                            transition
                            inline-flex items-center gap-1
                          "
                        >
                          📋 Copy
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400 text-xs">Not available</span>
                    )}
                  </div>
                </div>

                {/* 🔥 ROUTE DETAILS WITH GOOGLE MAPS LINKS */}
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1 sm:mb-2">
                    Route Details
                  </p>
                  
                  <p className="text-xs sm:text-sm text-gray-800 break-words">
                    <span className="font-medium">Pickup:</span>{" "}
                    {d.pickup_address ? (
                      <a
                        href={getGoogleMapsLink(d.pickup_address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 hover:text-emerald-900 underline decoration-dotted underline-offset-2 inline-flex items-center gap-1 break-all"
                      >
                        <span>📍</span>
                        {d.pickup_address}
                      </a>
                    ) : (
                      <span className="text-gray-400">Not provided</span>
                    )}
                  </p>
                  
                  <p className="text-xs sm:text-sm text-gray-800 mt-1 break-words">
                    <span className="font-medium">Dropoff:</span>{" "}
                    {d.dropoff_address ? (
                      <a
                        href={getGoogleMapsLink(d.dropoff_address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 hover:text-emerald-900 underline decoration-dotted underline-offset-2 inline-flex items-center gap-1 break-all"
                      >
                        <span>📍</span>
                        {d.dropoff_address}
                      </a>
                    ) : (
                      <span className="text-gray-400">Not provided</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 sm:p-4 mt-3 sm:mt-4">
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1 sm:mb-2">
                  Delivery Instructions
                </p>

                <p className="text-xs sm:text-sm text-gray-800 break-words">
                  {d.delivery_instructions?.trim()
                    ? d.delivery_instructions
                    : "No delivery instructions provided."}
                </p>
              </div>

              <div className="mt-4 sm:mt-5">
                <DeliveryProgressTracker status={d.status} />
              </div>

              <div className="mt-4 sm:mt-5 flex flex-wrap gap-2 sm:gap-3">
                {d.status === "assigned" && (
                  <>
                    <button
                      onClick={() =>
                        updateStatus(d.delivery_request_id, "accepted")
                      }
                      disabled={updatingId === d.delivery_request_id}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-emerald-600 text-white rounded-lg disabled:opacity-60 hover:bg-emerald-700 transition"
                    >
                      {updatingId === d.delivery_request_id
                        ? "Updating..."
                        : "Accept"}
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(d.delivery_request_id, "rejected")
                      }
                      disabled={updatingId === d.delivery_request_id}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-red-500 text-white rounded-lg disabled:opacity-60 hover:bg-red-600 transition"
                    >
                      {updatingId === d.delivery_request_id
                        ? "Updating..."
                        : "Reject"}
                    </button>
                  </>
                )}

                {d.status !== "assigned" && nextStep(d.status) && (
                  <button
                    onClick={() =>
                      updateStatus(
                        d.delivery_request_id,
                        nextStep(d.status)!
                      )
                    }
                    disabled={updatingId === d.delivery_request_id}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-emerald-600 text-white rounded-lg disabled:opacity-60 hover:bg-emerald-700 transition"
                  >
                    {updatingId === d.delivery_request_id
                      ? "Updating..."
                      : `Mark ${nextStep(d.status)}`}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}