"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import Button from "@/components/ui/Button";
import { fetchWithAuth } from "@/lib/api";
import { getMediaUrl } from "@/lib/getMediaUrl";

interface CartItem {
  cart_item_id: number;
  listing_id: number;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export default function MerchantCartPage() {

  const params = useParams();
  const merchantId = Number(params.merchantId);

  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [businessName, setBusinessName] = useState("Merchant");
  const [currencyMap, setCurrencyMap] = useState<Record<number, string>>({});

  const [imageMap, setImageMap] = useState<Record<number, string[]>>({});
  const [videoMap, setVideoMap] = useState<Record<number, string>>({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState("delivery");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [instructions, setInstructions] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const data = await fetchWithAuth("/cart");

      const merchantCart = data.merchant_carts.find(
        (c: any) => c.merchant_id === merchantId
      );

      try {
        const store = await fetchWithAuth(`/merchants/${merchantId}/storefront`);
        setBusinessName(store?.merchant?.business_name || "Merchant");
      } catch {}

      if (!merchantCart) {
        setItems([]);
        setTotal(0);
      } else {
        setItems(merchantCart.items || []);
        setTotal(merchantCart.total || 0);

        const currencyObj: Record<number, string> = {};
        const imageObj: Record<number, string[]> = {};
        const videoObj: Record<number, string> = {};

        await Promise.all(
          merchantCart.items.map(async (item: CartItem) => {
            try {
              const data = await fetchWithAuth(`/listings/${item.listing_id}`);
              currencyObj[item.listing_id] = data.currency || "$";
              imageObj[item.listing_id] = data.image_urls || [];
              videoObj[item.listing_id] = data.video_url || "";
            } catch {
              currencyObj[item.listing_id] = "$";
            }
          })
        );

        setCurrencyMap(currencyObj);
        setImageMap(imageObj);
        setVideoMap(videoObj);
      }

    } catch {
      setError(true);
    }

    setLoading(false);
  };

  const increaseQty = async (item: CartItem) => {
    try {
      await fetchWithAuth(`/cart/add?listing_id=${item.listing_id}`, {
        method: "POST",
      });

      await fetchCart();
      window.dispatchEvent(new Event("cartUpdated"));

    } catch {
      alert("Failed to increase quantity");
    }
  };

  const decreaseQty = async (item: CartItem) => {
    try {
      await fetchWithAuth(`/cart/remove/${item.cart_item_id}`, {
        method: "DELETE",
      });

      if (item.quantity > 1) {
        for (let i = 0; i < item.quantity - 1; i++) {
          await fetchWithAuth(`/cart/add?listing_id=${item.listing_id}`, {
            method: "POST",
          });
        }
      }

      await fetchCart();
      window.dispatchEvent(new Event("cartUpdated"));

    } catch {
      alert("Failed to decrease quantity");
    }
  };

  const removeItem = async (cartItemId: number) => {
    try {
      await fetchWithAuth(`/cart/remove/${cartItemId}`, {
        method: "DELETE",
      });

      await fetchCart();
      window.dispatchEvent(new Event("cartUpdated"));

    } catch {
      alert("Failed to remove item");
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      alert("Cart is empty");
      return;
    }
    setShowCheckoutModal(true);
  };

  const submitCheckout = async () => {

    if (deliveryMethod === "delivery" && !dropoffAddress) {
      alert("Please enter delivery address");
      return;
    }

    if (!phone) {
      alert("Please enter phone number");
      return;
    }

    try {
      setSubmitting(true);

      await fetchWithAuth(`/cart/checkout/${merchantId}`, {
        method: "POST",
        body: JSON.stringify({
          delivery_method: deliveryMethod,
          dropoff_address: dropoffAddress,
          delivery_instructions: instructions,
          customer_phone: phone
        })
      });

      setShowCheckoutModal(false);
      setShowSuccess(true);

      fetchCart();
      window.dispatchEvent(new Event("cartUpdated"));

    } catch (err: any) {
      alert(err.message || "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message="Failed to load cart" />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
          Your Cart
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          From <span className="font-semibold text-gray-800">{businessName}</span>
        </p>
      </div>

      {/* ITEMS */}
      <div className="space-y-6">

        {items.map((item) => {

          const currency = currencyMap[item.listing_id] || "$";
          const images = imageMap[item.listing_id] || [];
          const video = videoMap[item.listing_id];

          return (
            <div
              key={item.cart_item_id}
              className="
                group
                bg-white border rounded-2xl
                p-4 md:p-5
                flex gap-4 items-center
                shadow-sm hover:shadow-md
                transition
              "
            >

              {/* MEDIA */}
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">

                {images.length > 0 ? (
                  <img
                    src={getMediaUrl(images[0])}
                    className="w-full h-full object-cover"
                  />
                ) : video ? (
                  <video
                    src={getMediaUrl(video)}
                    className="w-full h-full object-cover"
                    muted
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    No Media
                  </div>
                )}

              </div>

              {/* DETAILS */}
              <div className="flex-1 space-y-2">

                <h3 className="font-semibold text-gray-900 text-base md:text-lg">
                  {item.name}
                </h3>

                <p className="text-sm text-gray-500">
                  {currency} {formatPrice(item.price)}
                </p>

                {/* QUANTITY */}
                <div className="flex items-center gap-2 pt-1">

                  <button
                    onClick={() => decreaseQty(item)}
                    className="w-8 h-8 border rounded-lg hover:bg-gray-100"
                  >
                    −
                  </button>

                  <span className="w-6 text-center font-medium">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => increaseQty(item)}
                    className="w-8 h-8 border rounded-lg hover:bg-gray-100"
                  >
                    +
                  </button>

                </div>

              </div>

              {/* RIGHT */}
              <div className="text-right space-y-2">

                <div className="font-semibold text-lg text-emerald-700">
                  {currency} {formatPrice(item.subtotal)}
                </div>

                <button
                  onClick={() => removeItem(item.cart_item_id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>

              </div>

            </div>
          );
        })}

      </div>

      {/* TOTAL */}
      {items.length > 0 && (
        <div className="border-t pt-6 space-y-6">

          <div className="flex justify-between items-center text-xl font-semibold">
            <span>Total</span>
            <span className="text-emerald-700">
              {Object.values(currencyMap)[0] || "$"} {formatPrice(total)}
            </span>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleCheckout} className="px-6 py-3 text-sm">
              Proceed to Checkout →
            </Button>
          </div>

        </div>
      )}

      {/* MODAL + SUCCESS */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">

            <h2 className="text-xl font-bold">Checkout</h2>

            <select
              value={deliveryMethod}
              onChange={(e) => setDeliveryMethod(e.target.value)}
              className="w-full border p-2 rounded-lg"
            >
              <option value="delivery">Delivery</option>
              <option value="onsite">Pick up from seller</option>
            </select>

            {deliveryMethod === "delivery" && (
              <input
                placeholder="Dropoff Address"
                value={dropoffAddress}
                onChange={(e) => setDropoffAddress(e.target.value)}
                className="w-full border p-2 rounded-lg"
              />
            )}

            <input
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border p-2 rounded-lg"
            />

            <textarea
              placeholder="Delivery Instructions (optional)"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full border p-2 rounded-lg"
            />

            <div className="flex justify-end gap-3 pt-3">

              <Button
                variant="secondary"
                onClick={() => setShowCheckoutModal(false)}
              >
                Cancel
              </Button>

              <Button onClick={submitCheckout} disabled={submitting}>
                {submitting ? "Processing..." : "Confirm Order"}
              </Button>

            </div>

          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center space-y-5 shadow-xl">

            <div className="text-5xl">✨</div>

            <h2 className="text-xl font-bold">
              Order Confirmed
            </h2>

            <p className="text-gray-600 text-sm">
              Your order has been successfully placed.
            </p>

            <Button
              onClick={() => setShowSuccess(false)}
              className="w-full"
            >
              Continue Shopping
            </Button>

          </div>
        </div>
      )}

    </div>
  );
}