"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { fetchWithAuth } from "@/lib/api";

interface Merchant {
  business_name: string;
}

interface Listing {
  id: number;
  name: string;
  price: number;
  currency: string;
  merchant: Merchant;

  image_urls?: string[];
  video_url?: string;
}

interface WishlistItem {
  id: number;
  listing: Listing;
}

export default function WishlistPage() {

  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);

      const data = await fetchWithAuth("/wishlist");

      setWishlist(Array.isArray(data) ? data : []);

    } catch {
      alert("Failed to load wishlist");
    }

    setLoading(false);
  };

  const removeFromWishlist = async (listingId: number) => {
    try {
      await fetchWithAuth(`/wishlist/${listingId}`, {
        method: "DELETE",
      });

      setWishlist(
        wishlist.filter(item => item.listing.id !== listingId)
      );

    } catch {
      alert("Failed to remove item");
    }
  };

  if (loading) {
    return (
      <p className="p-10 text-center text-gray-500">
        Loading your curated wishlist...
      </p>
    );
  }

  return (

    <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">

      {/* TITLE */}
      <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight">
        Your Wishlist
      </h1>

      {/* EMPTY STATE */}
      {wishlist.length === 0 && (

        <div className="text-center border border-gray-200 rounded-2xl p-12 bg-gradient-to-b from-gray-50 to-white shadow-sm space-y-5">

          <div className="text-5xl text-emerald-600">
            ♥
          </div>

          <h2 className="text-xl font-semibold text-gray-900">
            Your Wishlist is waiting
          </h2>

          <p className="text-gray-500 max-w-md mx-auto">
            Discover exceptional products and services and save them here.
          </p>

          <Link
            href="/"
            className="bg-emerald-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-800 transition shadow-md"
          >
            Explore Listings
          </Link>

        </div>

      )}

      {/* GRID */}
      {wishlist.length > 0 && (

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">

          {wishlist.map((item) => {

            const listing = item.listing;

            return (

              <div
                key={item.id}
                className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300"
              >

                <Link href={`/listing/${listing.id}`}>

                  {/* MEDIA */}
                  <div className="relative w-full h-36 bg-gray-100 overflow-hidden">

                    {listing.image_urls?.length > 0 ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}${listing.image_urls[0]}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : listing.video_url ? (
                      <video
                        src={`${process.env.NEXT_PUBLIC_API_URL}${listing.video_url}`}
                        className="w-full h-full object-cover"
                        muted
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No Media
                      </div>
                    )}

                  </div>

                  {/* CONTENT */}
                  <div className="p-3 space-y-1">

                    <h2 className="text-xs font-semibold text-gray-900 line-clamp-2">
                      {listing.name}
                    </h2>

                    <p className="text-[11px] text-gray-500 line-clamp-1">
                      {listing.merchant?.business_name}
                    </p>

                    <p className="text-sm font-bold text-emerald-700">
                      {listing.currency} {listing.price}
                    </p>

                  </div>

                </Link>

                {/* ✅ MOBILE DELETE (ALWAYS VISIBLE) */}
                <button
                  onClick={() => removeFromWishlist(listing.id)}
                  className="md:hidden absolute bottom-2 right-2 bg-white/90 text-red-600 p-2 rounded-full shadow"
                >
                  🗑️
                </button>

                {/* ✅ DESKTOP DELETE (HOVER) */}
                <button
                  onClick={() => removeFromWishlist(listing.id)}
                  className="hidden md:flex absolute top-3 right-3 bg-white/90 backdrop-blur text-red-600 text-sm px-2 py-1 rounded-full shadow opacity-0 group-hover:opacity-100 transition hover:bg-red-50"
                >
                  ✕
                </button>

              </div>

            );

          })}

        </div>

      )}

    </div>
  );
}