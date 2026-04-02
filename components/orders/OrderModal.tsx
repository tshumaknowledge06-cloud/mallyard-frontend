"use client";

import { useState, useRef, useEffect } from "react";
import Button from "@/components/ui/Button";
import SuccessPopup from "@/components/ui/SuccessPopup";

interface Props {
  listingId: number;
  onClose: () => void;
}

export default function OrderModal({ listingId, onClose }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [deliveryMethod, setDeliveryMethod] = useState("delivery");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const qtyRef = useRef<HTMLInputElement>(null);
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    qtyRef.current?.focus();
  }, []);

  const submitOrder = async () => {
    // 🔥 PREVENT DOUBLE SUBMIT
    if (loading) return;

    // 🔥 VALIDATION: Quantity must be at least 1
    if (quantity < 1) {
      alert("Quantity must be at least 1");
      return;
    }

    // 🔥 VALIDATION: Phone number required
    if (!customerPhone.trim()) {
      alert("Please enter your phone number");
      return;
    }

    // 🔥 VALIDATION: Dropoff address required for delivery
    if (deliveryMethod === "delivery" && !dropoffAddress.trim()) {
      alert("Please enter dropoff address");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        alert("Please log in as a customer first.");
        setLoading(false);
        return;
      }

      const res = await fetch(`${BASE_URL}/orders/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          listing_id: listingId,
          quantity,
          delivery_method: deliveryMethod,
          dropoff_address: deliveryMethod === "delivery" ? dropoffAddress : null,
          delivery_instructions: deliveryInstructions || null,
          customer_phone: customerPhone
        })
      });

      // 🔥 BETTER ERROR HANDLING
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.detail || "Order failed");
        setLoading(false);
        return;
      }

      // 🔥 SUCCESS UX POLISH: Reset form
      setQuantity(1);
      setDropoffAddress("");
      setDeliveryInstructions("");
      setCustomerPhone("");

      setShowSuccessPopup(true);
    } catch {
      alert("Failed to place order.");
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
        <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
          <h2 className="text-xl font-bold">
            Place Order
          </h2>

          <input
            ref={qtyRef}
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => {
              const val = Number(e.target.value);
              setQuantity(val < 1 ? 1 : val);
            }}
            placeholder="Quantity"
            className="border p-2 w-full rounded"
          />

          <select
            value={deliveryMethod}
            onChange={(e) => {
              const method = e.target.value;
              setDeliveryMethod(method);

              // 🔥 AUTO CLEAR ADDRESS when switching to pickup
              if (method !== "delivery") {
                setDropoffAddress("");
              }
            }}
            className="border p-2 w-full rounded"
          >
            <option value="delivery">
              Get it delivered to you
            </option>
            <option value="onsite">
              Pick it up from seller
            </option>
          </select>

          <input
            type="text"
            value={dropoffAddress}
            onChange={(e) => setDropoffAddress(e.target.value)}
            placeholder="Dropoff Address"
            disabled={deliveryMethod !== "delivery"}
            className="border p-2 w-full rounded disabled:bg-gray-100"
          />

          <textarea
            value={deliveryInstructions}
            onChange={(e) => setDeliveryInstructions(e.target.value)}
            placeholder="Delivery Instructions"
            className="border p-2 w-full rounded"
          />

          <input
            type="tel"
            inputMode="numeric"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="Customer Phone Number"
            className="border p-2 w-full rounded"
          />

          <div className="flex gap-3">
            <Button
              onClick={submitOrder}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Order"}
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
          title="Order Submitted Successfully"
          message="Your order has been successfully submitted to the merchant."
          note="Visit the merchant storefront to view their contact details and follow up on your order if needed."
          encouragement="Keep exploring The Yard — your next great find could be just ahead."
          onClose={handleSuccessClose}
        />
      )}
    </>
  );
}