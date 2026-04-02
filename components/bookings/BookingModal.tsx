"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import SuccessPopup from "@/components/ui/SuccessPopup";
import { fetchWithAuth } from "@/lib/api";

interface Props {
  listingId: number;
  onClose: () => void;
}

export default function BookingModal({ listingId, onClose }: Props) {
  const [description, setDescription] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const submitBooking = async () => {
  setLoading(true);

  try {
    await fetchWithAuth("/bookings", {
      method: "POST",
      body: JSON.stringify({
        listing_id: listingId,
        description: description,
        contact_number: contactNumber,
        preferred_time: preferredTime || null,
      }),
    });

    setShowSuccessPopup(true);

  } catch {
    alert("Failed to create booking");
  }

  setLoading(false);
};

  const handleSuccessClose = () => {
    setShowSuccessPopup(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
          <h2 className="text-xl font-bold">
            Book Service
          </h2>

          <textarea
            placeholder="Describe the service you need..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 w-full rounded"
          />

          <input
            type="text"
            placeholder="Contact number"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            className="border p-2 w-full rounded"
          />

          <input
            type="datetime-local"
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value)}
            className="border p-2 w-full rounded"
          />

          <div className="flex gap-3">
            <Button
              onClick={submitBooking}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Booking"}
            </Button>

            <Button
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {showSuccessPopup && (
        <SuccessPopup
          title="Booking Submitted Successfully"
          message="Your booking has been successfully submitted to the merchant."
          note="Visit the merchant storefront to view their contact details and follow up on your booking if needed."
          encouragement="The Yard is full of trusted discoveries — keep exploring."
          onClose={handleSuccessClose}
        />
      )}
    </>
  );
}