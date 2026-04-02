"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import OrderTimeline from "@/components/ui/OrderTimeline";

interface Order {
  id: number;
  status: string;
  delivery_method?: string;
  dropoff_address?: string;
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

export default function MerchantOrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryRequests, setDeliveryRequests] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);

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

      const historyOrders = (Array.isArray(ordersData) ? ordersData : []).filter(
        (o: Order) => {
          const deliveryStatus = deliveryMap.get(o.id)?.status;
          const timelineStatus = getTimelineStatus(o.status, deliveryStatus);

          return (
            timelineStatus === "verified" ||
            timelineStatus === "completed" ||
            o.status === "rejected"
          );
        }
      );

      setOrders(historyOrders);
      setDeliveryRequests(deliveryList);
    } catch (error) {
      console.error("Failed to load order history:", error);
    } finally {
      setLoading(false);
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
    return <p>Loading order history...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Order History</h1>

      {orders.length === 0 && (
        <p className="text-gray-500">
          No completed, verified, or rejected orders yet.
        </p>
      )}

      <div className="space-y-6">
        {orders.map((o) => {
          const deliveryRequest = deliveryMap.get(o.id);
          const timelineStatus = getTimelineStatus(
            o.status,
            deliveryRequest?.status
          );

          const statusColor =
            timelineStatus === "verified"
              ? "text-emerald-600"
              : timelineStatus === "rejected"
              ? "text-red-500"
              : "text-gray-600";

          return (
            <div key={o.id} className="bg-white p-6 rounded shadow">
              <div className="flex justify-between items-center">
                <p className="font-semibold">Order ID: {o.id}</p>

                <p className={`text-sm font-medium capitalize ${statusColor}`}>
                  {formatStatus(timelineStatus)}
                </p>
              </div>

              <OrderTimeline status={timelineStatus} />

              <div className="mt-4 text-sm text-gray-700">
                <p>Delivery Method: {o.delivery_method}</p>
                <p>Dropoff: {deliveryRequest?.dropoff_address || o.dropoff_address}</p>

                {deliveryRequest?.status && (
                  <p className="text-xs text-gray-500 mt-1">
                    Delivery Status: {formatStatus(deliveryRequest.status)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}