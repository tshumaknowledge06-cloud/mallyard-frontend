"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";

export default function MerchantBookings() {
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await fetchWithAuth("/bookings");
    setBookings(data);
  }

  async function update(id: number, status: string) {
    await fetchWithAuth(`/bookings/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });

    load();
  }

  function formatTime(dateString: string) {
    const d = new Date(dateString);

    return d.toLocaleString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getStatusColor(status: string) {
    if (status === "accepted") return "text-emerald-600";
    if (status === "rejected") return "text-red-500";
    return "text-amber-600";
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Service Bookings</h1>

      <p className="text-sm text-gray-600 mb-6">
        Tip: contact customer for more info or to adjust service time.
      </p>

      {bookings.length === 0 && (
        <p className="text-gray-500">No service bookings at the moment.</p>
      )}

      {bookings.map((b) => (
        <div key={b.id} className="bg-white p-6 rounded shadow mb-4">
          <p className="font-medium">{b.description}</p>

          <p className="text-sm text-gray-600 mt-1">
            Contact: {b.contact_number}
          </p>

          <p className="text-sm text-gray-600 mt-1">
            Requested Time: {formatTime(b.preferred_time)}
          </p>

          <p className="text-sm mt-1">
            Status:
            <span
              className={`ml-1 font-medium capitalize ${getStatusColor(
                b.status
              )}`}
            >
              {b.status}
            </span>
          </p>

          {b.status === "pending" && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => update(b.id, "accepted")}
                className="px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
              >
                Accept
              </button>

              <button
                onClick={() => update(b.id, "rejected")}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}