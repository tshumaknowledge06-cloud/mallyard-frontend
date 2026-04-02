"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";

export default function DeliveryHistory() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data =
        await fetchWithAuth("/delivery-requests/partner");

      const history = data.filter(
        (d: any) => ["delivered", "verified", "rejected"].includes(d.status)
      );

      setItems(history);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <p>Loading history...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">
        Delivery History
      </h1>

      {items.length === 0 ? (
        <p className="text-gray-500">
          No delivery history yet.
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((d) => (
            <div
              key={d.delivery_request_id}
              className="bg-white p-4 rounded shadow"
            >
              <p className="font-semibold">
                {d.listing_name}
              </p>

              <p className="text-sm text-gray-600">
                {d.pickup_address} → {d.dropoff_address}
              </p>

              <p
                className={`text-sm mt-1 capitalize ${
                  d.status === "rejected"
                    ? "text-red-600"
                    : d.status === "verified"
                    ? "text-emerald-700"
                    : "text-gray-700"
                }`}
              >
                {d.status}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}