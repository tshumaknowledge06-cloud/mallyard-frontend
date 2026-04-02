"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import OrderTimeline from "@/components/ui/OrderTimeline";

interface Order {
  id: number;
  status: string;
  delivery_method?: string;
  dropoff_address?: string;
  pickup_address?: string;
  delivery_pickup_address?: string;
  customer_phone?: string;
  
  listing_id?: number;
  listing_name?: string;
  quantity?: number;
  total_price?: number;
  
  image_urls?: string[];
  video_url?: string;

  delivery_request?: {
    pickup_address?: string;
  };
}

interface Listing {
  id: number;
  name: string;
  price: number;
  currency: string;
  image_urls?: string[];
  video_url?: string;
}

interface DeliveryRequest {
  id: number;
  order_id: number;
  seller_id: number;
  pickup_address?: string;
  dropoff_address?: string;
  delivery_instructions?: string;
  status: string;
  created_at: string;
}

function getTimelineStatus(
  orderStatus: string,
  deliveryStatus?: string | null
): string {
  if (!deliveryStatus) return orderStatus;

  switch (deliveryStatus) {
    case "verified":
      return "verified";
    case "delivered":
      return "delivered";
    case "in_transit":
      return "in_transit";
    case "driver_assigned":
      return "driver_assigned";
    case "ready_for_dispatch":
    case "pickup_submitted":
    case "delivery_requested":
      return "delivery_requested";
    default:
      return orderStatus;
  }
}

function formatStatus(status: string) {
  return status.replace(/_/g, " ");
}

export default function MerchantOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryRequests, setDeliveryRequests] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [showPickupModal, setShowPickupModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [pickupInput, setPickupInput] = useState("");
  const [submittingPickup, setSubmittingPickup] = useState(false);
  const [listingMap, setListingMap] = useState<Record<number, Listing>>({});
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  const [pickupSubmitted, setPickupSubmitted] = useState<{
    [key: number]: boolean;
  }>({});

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);

      const [ordersData, deliveryData] = await Promise.all([
        fetchWithAuth("/orders"),
        fetchWithAuth("/delivery-requests/seller"),
      ]);

      const deliveryList: DeliveryRequest[] = Array.isArray(deliveryData)
        ? deliveryData
        : [];

      const deliveryMap = new Map<number, DeliveryRequest>();
      deliveryList.forEach((request) => {
        deliveryMap.set(request.order_id, request);
      });

      const activeOrders = (Array.isArray(ordersData) ? ordersData : []).filter(
        (o: Order) => {
          const deliveryStatus = deliveryMap.get(o.id)?.status;
          const timelineStatus = getTimelineStatus(o.status, deliveryStatus);

          return !["completed", "verified"].includes(timelineStatus);
        }
      );

      setOrders(activeOrders);
      const listings: Record<number, Listing> = {};

      await Promise.all(
  activeOrders.map(async (o: Order) => {
    try {
      if (!o.listing_id) return;

      const data = await fetchWithAuth(`/listings/${o.listing_id}`);
      listings[o.listing_id] = data;
    } catch {}
  })
);

      setListingMap(listings);
      setDeliveryRequests(deliveryList);

      const submittedMap: { [key: number]: boolean } = {};

      activeOrders.forEach((o: Order) => {
        const deliveryRequest = deliveryMap.get(o.id);

        if (
          o.pickup_address ||
          o.delivery_pickup_address ||
          o.delivery_request?.pickup_address ||
          deliveryRequest?.pickup_address ||
          ["pickup_submitted", "ready_for_dispatch", "driver_assigned", "in_transit", "delivered", "verified"].includes(
            deliveryRequest?.status || ""
          )
        ) {
          submittedMap[o.id] = true;
        }
      });

      setPickupSubmitted((prev) => ({ ...prev, ...submittedMap }));
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(orderId: number, status: string) {
    try {
      await fetchWithAuth(`/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      await load();
    } catch (error) {
      console.error("Failed to update order status:", error);
      alert("Failed to update order status");
    }
  }

  function openPickupModal(orderId: number) {
    setSelectedOrderId(orderId);
    setPickupInput("");
    setShowPickupModal(true);
  }

  function closePickupModal() {
    setShowPickupModal(false);
    setSelectedOrderId(null);
    setPickupInput("");
  }

  async function submitPickupAddress() {
    if (!selectedOrderId) return;

    if (!pickupInput.trim()) {
      alert("Enter pickup address first");
      return;
    }

    try {
      setSubmittingPickup(true);

      await fetchWithAuth(`/delivery-requests/${selectedOrderId}/submit-pickup`, {
        method: "POST",
        body: JSON.stringify({
          pickup_address: pickupInput.trim(),
        }),
      });

      setPickupSubmitted((prev) => ({
        ...prev,
        [selectedOrderId]: true,
      }));

      alert("Pickup submitted successfully");
      closePickupModal();
      await load();
    } catch (error) {
      console.error("Failed to submit pickup address:", error);
      alert("Failed to submit pickup address");
    } finally {
      setSubmittingPickup(false);
    }
  }

  const deliveryMap = useMemo(() => {
    const map = new Map<number, DeliveryRequest>();
    deliveryRequests.forEach((request) => {
      map.set(request.order_id, request);
    });
    return map;
  }, [deliveryRequests]);

  if (loading) {
    return <p>Loading orders...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Merchant Orders</h1>

      {orders.length === 0 && (
        <p className="text-gray-500">No active orders at the moment.</p>
      )}

      <div className="space-y-6">
        {orders.map((o) => {
          const listing = o.listing_id ? listingMap[o.listing_id] : undefined;
          const deliveryRequest = deliveryMap.get(o.id);
          const timelineStatus = getTimelineStatus(
            o.status,
            deliveryRequest?.status
          );

          const isDeliveryOrder = o.delivery_method === "delivery";

          const canSubmitPickup =
            isDeliveryOrder &&
            ["packaged", "delivery_requested"].includes(timelineStatus);

          const alreadySubmitted = pickupSubmitted[o.id] === true;

          return (
            <div key={o.id} className="bg-white p-6 rounded shadow">
              <div className="flex justify-between gap-4 items-start">
                <div className="flex gap-4 items-start w-full">
                  {/* LEFT SIDE (INFO) */}
                  <div className="flex-1">
                    {/* LISTING NAME */}
                    <p className="font-semibold text-lg">
                      {listing?.name || "Listing"}
                    </p>

                    {/* QUANTITY */}
                    <p className="text-sm text-gray-600">
                      Quantity: {o.quantity ?? "-"}
                    </p>

                    {/* TOTAL */}
                    <p className="text-sm font-medium text-emerald-700">
                      Total: {listing ? `${(listing.price * (o.quantity || 0)).toFixed(2)} ${listing.currency}` : "-"}
                    </p>

                    {/* STATUS */}
                    <p className="text-xs text-gray-500 mt-1 capitalize">
                      Status: {formatStatus(timelineStatus)}
                    </p>
                  </div>

                  {/* RIGHT SIDE (IMAGE) */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    {listing?.image_urls?.length ? (
                      <img
                        src={`${API_BASE}${listing.image_urls[0]}`} 
                        className="w-full h-full object-cover"
                      />
                    ) : listing?.video_url ? (
                      <video
                        src={`${API_BASE}${listing.video_url}`} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        No Media
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <OrderTimeline status={timelineStatus} />

              <div className="mt-4 text-sm text-gray-700 space-y-1">
                <p>Delivery Method: {o.delivery_method}</p>
                <p>
                  Dropoff:{" "}
                  {deliveryRequest?.dropoff_address || o.dropoff_address}
                </p>

                {/* CUSTOMER CONTACT */}
                {o.customer_phone && (
                  <p className="text-sm font-medium text-gray-800">
                    Customer Contact: {o.customer_phone}
                  </p>
                )}

                {deliveryRequest?.status && (
                  <p className="text-xs text-gray-500">
                    Delivery Status: {formatStatus(deliveryRequest.status)}
                  </p>
                )}
              </div>

              {["pending", "accepted", "preparing"].includes(o.status) && (
                <div className="mt-4">
                  <label className="text-sm font-medium mr-2">
                    Update Status
                  </label>

                  <select
                    className="border rounded px-3 py-2"
                    defaultValue=""
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value) {
                        updateStatus(o.id, value);
                      }
                    }}
                  >
                    <option value="">Select Action</option>

                    {o.status === "pending" && (
                      <>
                        <option value="accepted">Accept Order</option>
                        <option value="rejected">Reject Order</option>
                      </>
                    )}

                    {o.status === "accepted" && (
                      <option value="preparing">Start Preparing</option>
                    )}

                    {o.status === "preparing" && (
                      <option value="packaged">Mark as Packaged</option>
                    )}
                  </select>
                </div>
              )}

              {canSubmitPickup && (
                <div className="mt-4">
                  {!alreadySubmitted ? (
                    <button
                      onClick={() => openPickupModal(o.id)}
                      className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Submit Pickup Address
                    </button>
                  ) : (
                    <button
                      disabled
                      className="px-4 py-2 bg-green-100 text-green-700 rounded cursor-not-allowed"
                    >
                      Pickup Address Submitted ✓
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showPickupModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">
              Submit Pickup Address
            </h2>

            <label className="block text-sm font-medium mb-2">
              Pickup Address
            </label>

            <input
              type="text"
              placeholder="Enter pickup address"
              className="border rounded px-3 py-2 w-full"
              value={pickupInput}
              onChange={(e) => setPickupInput(e.target.value)}
            />

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={closePickupModal}
                disabled={submittingPickup}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={submitPickupAddress}
                disabled={submittingPickup}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                {submittingPickup ? "Submitting..." : "Done"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}