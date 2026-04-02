"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import ListingCard from "@/components/marketplace/ListingCard";

import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";

import { fetchPublic } from "@/lib/api";

interface Merchant {
  id: number;
  business_name: string;
  description: string;
  merchant_type: string;
  location: string;
  contact_phone: string;
  email?: string; // ✅ added
  status: string;
  logo_url?: string;
}

interface Listing {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  listing_type: "product" | "service";

  image_urls?: string[];
  video_url?: string;

  merchant: Merchant;
  subcategory: any;
}

export default function MerchantStorefrontPage() {
  const params = useParams();
  // 🔥 SAFETY: Guard against undefined merchantId
  const merchantId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStorefront() {
      try {
        setLoading(true);

        const res = await fetchPublic(
          `/merchants/${merchantId}/storefront`
        );

        setMerchant(res.merchant);

        // ✅ Inject merchant into each listing (fix crash)
        const enrichedListings = (res.listings || []).map((l: any) => ({
          ...l,
          merchant: res.merchant,
        }));

        setListings(enrichedListings);
      } catch (err) {
        console.error(err);
        setError("Failed to load merchant storefront.");
      } finally {
        setLoading(false);
      }
    }

    if (merchantId) {
      loadStorefront();
    }
  }, [merchantId]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  if (!merchant) {
    return <EmptyState title="Merchant not found" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">

      {/* 🔥 MERCHANT HEADER (PREMIUM) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b pb-8">

        {/* LEFT */}
        <div className="space-y-3">

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            {merchant.business_name}
          </h1>

          <p className="text-gray-600 max-w-xl">
            {merchant.description || "Retail Outlet"}
          </p>

          {/* META */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">

            <span>📍 {merchant.location}</span>

            <span>☎ {merchant.contact_phone}</span>

            {merchant.email && (
              <span>✉ {merchant.email}</span>
            )}

            {merchant.status === "approved" && (
              <span className="text-emerald-700 font-semibold">
                ✓ Verified Merchant
              </span>
            )}

          </div>

        </div>

        {/* RIGHT LOGO - 🔥 FIXED: Removed localhost hardcode */}
        <div className="flex-shrink-0">

          {merchant.logo_url ? (
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${merchant.logo_url}`}
              alt="Merchant Logo"
              className="
                w-24 h-24 md:w-28 md:h-28
                object-cover
                rounded-2xl
                shadow-md
                border border-gray-200
              "
            />
          ) : (
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
              No Logo
            </div>
          )}

        </div>

      </div>

      {/* 🔥 LISTINGS */}
      <div className="space-y-6">

        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 tracking-tight">
          Listings
        </h2>

        {listings.length === 0 ? (
          <EmptyState title="This merchant has no listings yet." />
        ) : (

          <div
            className="
              grid gap-6
              sm:grid-cols-2
              md:grid-cols-3
              lg:grid-cols-4
            "
          >

            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
              />
            ))}

          </div>

        )}

      </div>

    </div>
  );
}