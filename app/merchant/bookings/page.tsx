"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";

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
    <div className="max-w-5xl mx-auto px-3 sm:px-0">
      <h1 className="text-xl sm:text-2xl font-semibold mb-2">
        Service Bookings
      </h1>

      <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
        Tip: contact customer for more info or to adjust service time.
      </p>

      {bookings.length === 0 && (
        <p className="text-gray-500 text-sm">No service bookings at the moment.</p>
      )}

      <div className="space-y-3 sm:space-y-4">
        {bookings.map((b) => (
          <div
            key={b.id}
            className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow border border-gray-100"
          >
            <p className="text-sm sm:text-base font-medium text-gray-900 break-words">
              {b.description}
            </p>

            {/* 🔥 CUSTOMER CONTACT WITH CALL BUTTON & COPY */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs sm:text-sm text-gray-600">
                Contact:
              </span>
              {getTelLink(b.contact_number) ? (
                <>
                  <a
                    href={getTelLink(b.contact_number)!}
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
                    onClick={() => copyToClipboard(b.contact_number)}
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

            <p className="text-xs sm:text-sm text-gray-600 mt-2">
              Requested Time: {formatTime(b.preferred_time)}
            </p>

            <p className="text-xs sm:text-sm mt-2">
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
              <div className="flex flex-wrap gap-2 sm:gap-3 mt-4">
                <button
                  onClick={() => update(b.id, "accepted")}
                  className="
                    px-3 sm:px-4 py-1.5 sm:py-2
                    text-xs sm:text-sm
                    bg-emerald-600 text-white
                    rounded-lg
                    hover:bg-emerald-700
                    transition
                  "
                >
                  Accept
                </button>

                <button
                  onClick={() => update(b.id, "rejected")}
                  className="
                    px-3 sm:px-4 py-1.5 sm:py-2
                    text-xs sm:text-sm
                    bg-red-500 text-white
                    rounded-lg
                    hover:bg-red-600
                    transition
                  "
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}