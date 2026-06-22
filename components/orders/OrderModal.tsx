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
  const [orderSpecifications, setOrderSpecifications] = useState(""); // 🔥 NEW
  const [loading, setLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // 🔥 ORDER SUMMARY STATE
  const [orderSummary, setOrderSummary] = useState<{
    total_price: number | null;
    delivery_price: number | null;
    estimated_delivery_days: number | null;
  }>({
    total_price: null,
    delivery_price: null,
    estimated_delivery_days: null,
  });

  const qtyRef = useRef<HTMLInputElement>(null);
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
          order_specifications: orderSpecifications || null, // 🔥 NEW
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

      // 🔥 STORE ORDER SUMMARY FROM RESPONSE
      setOrderSummary({
        total_price: data.total_price || null,
        delivery_price: data.delivery_price || null,
        estimated_delivery_days: data.estimated_delivery_days || null,
      });

      // 🔥 SUCCESS UX POLISH: Reset form
      setQuantity(1);
      setDropoffAddress("");
      setDeliveryInstructions("");
      setCustomerPhone("");
      setOrderSpecifications(""); // 🔥 NEW

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

          {/* 🔥 PREMIUM DELIVERY FEE INFO LINE */}
          {deliveryMethod === "delivery" && (
            <div
              className="
                mt-1 px-4 py-3
                rounded-xl
                border border-yellow-300/40
                bg-gradient-to-br from-yellow-50/60 to-transparent
                backdrop-blur-sm
                text-[13px]
                text-yellow-700
                shadow-[0_4px_20px_rgba(234,179,8,0.15)]
              "
            >
              ✨ Delivery charges may apply based on your location and will be communicated by the seller after your request.
            </div>
          )}

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

          {/* 🔥 NEW: ORDER SPECIFICATIONS */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Order Specifications
              <span className="text-gray-400 text-xs font-normal ml-1">(Optional)</span>
            </label>

            <textarea
              value={orderSpecifications}
              onChange={(e) => setOrderSpecifications(e.target.value)}
              placeholder="Order Specifications (e.g. Toyota Avensis Rim Size 17, Black Finish)"
              className="w-full border p-2 rounded-lg text-sm"
              rows={3}
            />

            <p className="text-xs text-gray-500">
              Specify the exact product variation, size, model, color, or requirements you need.
            </p>
          </div>

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
          totalPrice={orderSummary.total_price || undefined}
          deliveryPrice={orderSummary.delivery_price || undefined}
          estimatedDays={orderSummary.estimated_delivery_days || undefined}
          onClose={handleSuccessClose}
        />
      )}
    </>
  );
}