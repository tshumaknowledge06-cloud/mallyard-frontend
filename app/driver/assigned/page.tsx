"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import DeliveryProgressTracker from "@/components/ui/DeliveryProgressTracker";

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
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">
        Assigned Deliveries
      </h1>

      <p className="text-sm text-gray-500 mb-6">
        View delivery details, contact seller or customer, and update delivery progress.
      </p>

      {deliveries.length === 0 ? (
        <p className="text-gray-500">
          No active deliveries assigned to you right now.
        </p>
      ) : (
        <div className="space-y-5">
          {deliveries.map((d) => (
            <div
              key={d.delivery_request_id}
              className="bg-white p-6 rounded-2xl shadow border border-gray-100"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {d.listing_name}
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Order #{d.order_id} • Delivery Request #{d.delivery_request_id}
                  </p>
                </div>

                <span className="inline-flex w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 capitalize">
                  {d.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 text-sm">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                    Item Details
                  </p>
                  <p className="text-gray-800">
                    <span className="font-medium">Listing:</span> {d.listing_name}
                  </p>
                  <p className="text-gray-800 mt-1">
                    <span className="font-medium">Quantity:</span> {d.quantity}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                    Seller Details
                  </p>
                  <p className="text-gray-800">
                    <span className="font-medium">Seller:</span> {d.seller_name}
                  </p>
                  <p className="text-gray-800 mt-1">
                    <span className="font-medium">Phone:</span> {d.seller_phone}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                    Customer Details
                  </p>
                  <p className="text-gray-800">
                    <span className="font-medium">Customer:</span> {d.customer_name}
                  </p>
                  <p className="text-gray-800 mt-1">
                    <span className="font-medium">Phone:</span> {d.customer_phone}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                    Route Details
                  </p>
                  <p className="text-gray-800">
                    <span className="font-medium">Pickup:</span> {d.pickup_address}
                  </p>
                  <p className="text-gray-800 mt-1">
                    <span className="font-medium">Dropoff:</span> {d.dropoff_address}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  Delivery Instructions
                </p>

                <p className="text-sm text-gray-800">
                  {d.delivery_instructions?.trim()
                    ? d.delivery_instructions
                    : "No delivery instructions provided."}
                </p>
              </div>

              <DeliveryProgressTracker status={d.status} />

              <div className="mt-5 flex flex-wrap gap-3">
                {d.status === "assigned" && (
                  <>
                    <button
                      onClick={() =>
                        updateStatus(d.delivery_request_id, "accepted")
                      }
                      disabled={updatingId === d.delivery_request_id}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg disabled:opacity-60"
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
                      className="px-4 py-2 bg-red-500 text-white rounded-lg disabled:opacity-60"
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
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg disabled:opacity-60"
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