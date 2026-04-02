"use client";

import Link from "next/link";
import Card from "@/components/ui/Card";
import { useState, useRef, useMemo, useEffect } from "react";
import { Listing } from "@/types/listing";

interface Merchant {
  id: number;
  business_name: string;
  location?: string;
  merchant_type: string;
}

interface SubCategory {
  id: number;
  name: string;
  category_id: number;
}

interface Props {
  listing: Listing;
}

export default function ListingCard({ listing }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hovered, setHovered] = useState(false);

  const touchStartX = useRef<number | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  // 🔥 PERFORMANCE FIX: Media array rebuilt only when listing changes
  const media = useMemo(() => [
    ...(listing.image_urls || []).map((img) => ({
      type: "image",
      src: `${BASE_URL}${img}`,
    })),
    ...(listing.video_url
      ? [{
          type: "video",
          src: `${BASE_URL}${listing.video_url}`,
        }]
      : []),
  ], [listing, BASE_URL]);

  // 🔥 UX FIX: Reset media index when listing changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [listing.id]);

  function nextMedia(e?: any) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (media.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % media.length);
  }

  function prevMedia(e?: any) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (media.length === 0) return;
    setCurrentIndex((prev) =>
      prev === 0 ? media.length - 1 : prev - 1
    );
  }

  // 🔥 MOBILE SWIPE with threshold constant
  const SWIPE_THRESHOLD = 50;

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;

    const diff = touchStartX.current - e.changedTouches[0].clientX;

    if (diff > SWIPE_THRESHOLD) nextMedia(); // swipe left
    if (diff < -SWIPE_THRESHOLD) prevMedia(); // swipe right

    touchStartX.current = null;
  }

  return (
    <Link href={`/listing/${listing.id}`} className="block h-full">
      <div
        className="group"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Card
          className="
            h-full
            flex flex-col
            p-3
            rounded-2xl
            border border-gray-100
            hover:shadow-xl
            transition-all duration-300
          "
        >
          {/* ================= MEDIA ================= */}
          <div
            className="relative w-full aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {media.length > 0 ? (
              <>
                {media[currentIndex].type === "image" ? (
                  <img
                    src={media[currentIndex].src}
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    alt={listing.name}
                  />
                ) : (
                  <video
                    src={media[currentIndex].src}
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    muted
                  />
                )}

                {/* ARROWS */}
                {media.length > 1 && hovered && (
                  <>
                    <button
                      onClick={prevMedia}
                      className="hidden md:block absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-2 py-1 rounded"
                    >
                      ‹
                    </button>

                    <button
                      onClick={nextMedia}
                      className="hidden md:block absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-2 py-1 rounded"
                    >
                      ›
                    </button>
                  </>
                )}

                {/* DOTS */}
                {media.length > 1 && (
                  <div className="absolute bottom-2 w-full flex justify-center gap-1">
                    {media.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 w-1.5 rounded-full ${
                          i === currentIndex ? "bg-white" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                No Media
              </div>
            )}
          </div>

          {/* ================= CONTENT ================= */}
          <div className="flex-1 mt-3 flex flex-col justify-between min-h-[110px]">

            <div className="space-y-1 min-h-[70px]">
              <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 inline-block">
                {listing.listing_type === "product" ? "Product" : "Service"}
              </span>

              <h3 className="text-sm font-semibold line-clamp-2 leading-tight min-h-[36px]">
                {listing.name}
              </h3>

              {/* 🔥 SAFETY FIX: Optional chaining with fallback */}
              <p className="text-xs text-gray-500 line-clamp-1">
                {listing.merchant?.business_name || "Unknown Merchant"}
              </p>

              {/* 🔥 SAFETY FIX: Optional chaining with fallback */}
              <p className="text-[11px] text-gray-400 line-clamp-1">
                {listing.subcategory?.name || "General"}
              </p>
            </div>

            {/* 🔥 PRICE FORMATTING FIX */}
            <div className="mt-2 pt-2 text-sm font-bold text-emerald-700">
              {listing.currency} {Number(listing.price).toFixed(2)}
            </div>

          </div>
        </Card>
      </div>
    </Link>
  );
}