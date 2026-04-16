"use client";

import { useEffect, useRef, useState } from "react";

import ListingCard from "@/components/marketplace/ListingCard";
import CategoryFilter from "@/components/marketplace/CategoryFilter";

import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import { fetchPublic, fetchWithAuth } from "@/lib/api";

/* ================= TYPES ================= */

interface Listing {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  listing_type: "product" | "service";

  image_urls?: string[];
  video_url?: string;

  merchant: {
    id: number;
    business_name: string;
    location?: string;
    merchant_type?: string;
  };

  subcategory: {
    id: number;
    name: string;
    category_id: number;
  };
}

/* ================= PAGE ================= */

export default function MarketplacePage() {

  const [listings, setListings] = useState<Listing[]>([]);
  const [trending, setTrending] = useState<Listing[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  
  // 🔥 NEW: Product/Service filter state - default to "service"
  const [listingTypeFilter, setListingTypeFilter] = useState<"product" | "service">("service");
  
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const trendingRef = useRef<HTMLDivElement>(null);
  const recentRef = useRef<HTMLDivElement>(null);
  
  // 🔥 Store refs for each category row
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isLoggedIn =
    typeof window !== "undefined" &&
    !!localStorage.getItem("access_token");

  useEffect(() => {
  loadLocation();
  fetchListings();
  fetchCategories();
  fetchTrending();

  if (isLoggedIn) fetchRecentlyViewed();

  const handleStorage = () => {
    const stored = localStorage.getItem("selectedLocation") || "";

    setLocation(stored);

    // 🔥 trigger refresh
    setRefreshKey(prev => prev + 1);
  };

  window.addEventListener("locationChanged", handleStorage);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener("locationChanged", handleStorage);
    window.removeEventListener("storage", handleStorage);
  };

}, []);

useEffect(() => {
  fetchListings();
}, [refreshKey]);

  /* ================= NORMALIZER ================= */

  const normalizeListing = (l: any): Listing => ({
    id: l.id,
    name: l.name,
    description: l.description || "",
    price: l.price,
    currency: l.currency,
    listing_type: l.listing_type,

    image_urls: l.image_urls || [],
    video_url: l.video_url || undefined,

    merchant: {
      id: l.merchant?.id || 0,
      business_name: l.merchant?.business_name || "Verified Seller",
      location: l.merchant?.location || "",
      merchant_type: l.merchant?.merchant_type || "",
    },

    subcategory: {
      id: l.subcategory?.id || 0,
      name: l.subcategory?.name || "General",
      category_id: l.subcategory?.category_id || 0,
    },
  });

  /* ================= FETCH ================= */

  const loadLocation = () => {
    const stored = localStorage.getItem("selectedLocation") || "";
    setLocation(stored);
  };

  const fetchTrending = async () => {
    try {
      // 🔥 EXTENDED: Request more trending items (limit=50)
      const data = await fetchPublic("/trending/?limit=50");
      setTrending((data || []).map(normalizeListing));
    } catch {
      setTrending([]);
    }
  };

  const fetchRecentlyViewed = async () => {
    try {
      // 🔥 EXTENDED: Request more recently viewed items (limit=50)
      const data = await fetchWithAuth("/recently-viewed/?limit=50");

      const normalized = (data || []).map((item: any) =>
        normalizeListing(item.listing)
      );

      setRecentlyViewed(normalized);

    } catch {
      setRecentlyViewed([]);
    }
  };

  const fetchListings = async () => {

    setLoading(true);

    try {
      let url = "/listings/marketplace?page=1&page_size=100";

      const storedLocation = localStorage.getItem("selectedLocation");

      if (storedLocation) {
        url += `&location=${encodeURIComponent(storedLocation)}`;
      }

      const data = await fetchPublic(url, {},);

      setListings((data || []).map(normalizeListing));

    } catch {
      setListings([]);
    }

    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const data = await fetchPublic("/categories/");
      setCategories(data);
    } catch {
      setCategories([]);
    }
  };

  const recordView = async (listingId: number) => {
    try {
      await fetchWithAuth(`/recently-viewed/${listingId}`, {
        method: "POST",
      });
    } catch (err) {
      console.error("Record view failed", err);
    }
  };

  /* ================= FILTER ================= */

  // 🔥 Combined filtering logic (category + listing_type)
  const filteredListings = listings.filter((l) => {
    // Category filter
    if (selectedCategory && l.subcategory.category_id !== selectedCategory) return false;
    // Product/Service filter
    if (listingTypeFilter && l.listing_type !== listingTypeFilter) return false;
    return true;
  });

  // 🔥 Group filtered listings by category name
  const groupedListings = filteredListings.reduce((acc, listing) => {
    const categoryName = listing.subcategory?.name || "Uncategorized";
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(listing);
    return acc;
  }, {} as Record<string, Listing[]>);

  /* ================= SCROLL ================= */

  const scroll = (
    ref: React.RefObject<HTMLDivElement | null>,
    dir: "left" | "right"
  ) => {
    if (!ref.current) return;

    ref.current.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  // 🔥 Category-specific scroll handler
  const scrollCategory = (categoryName: string, dir: "left" | "right") => {
    const ref = { current: categoryRefs.current[categoryName] };
    scroll(ref, dir);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 space-y-12">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">
          Marketplace
        </h1>
        <p className="text-gray-500 text-sm">
          Discover trusted products & services
        </p>
      </div>

      {/* TRENDING */}
      {trending.length > 0 && (
        <SectionCarousel
          title="🔥 Trending"
          listings={trending}
          scrollRef={trendingRef}
          onScroll={scroll}
        />
      )}

      {/* RECENTLY VIEWED */}
      {isLoggedIn && recentlyViewed.length > 0 && (
        <SectionCarousel
          title="👁️ Recently Viewed"
          listings={recentlyViewed}
          scrollRef={recentRef}
          onScroll={scroll}
        />
      )}

      {/* LOCATION */}
      {location && (
        <p className="text-sm text-gray-500">
          Showing in{" "}
          <span className="font-semibold">{location}</span>
        </p>
      )}

      {/* 🔥 FILTERS ROW: Category Filter + Product/Service Toggle (tight gap) */}
      <div className="flex flex-wrap items-center gap-2">
        <CategoryFilter
          categories={categories}
          onChange={setSelectedCategory}
        />

        <div className="flex gap-2">
          <button
            onClick={() => setListingTypeFilter("service")}
            className={`
              px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
              ${listingTypeFilter === "service" 
                ? "border-2 border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37] shadow-sm" 
                : "border border-gray-200 bg-white text-gray-500 hover:border-[#D4AF37]/50 hover:text-[#D4AF37]/70"
              }
            `}
          >
            Services
          </button>
          
          <button
            onClick={() => setListingTypeFilter("product")}
            className={`
              px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
              ${listingTypeFilter === "product" 
                ? "border-2 border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37] shadow-sm" 
                : "border border-gray-200 bg-white text-gray-500 hover:border-[#D4AF37]/50 hover:text-[#D4AF37]/70"
              }
            `}
          >
            Products
          </button>
        </div>
      </div>

      {loading && <LoadingState />}

      {!loading && filteredListings.length === 0 && (
        <EmptyState
          title="Nothing here… yet"
          message="Be the first to define this space."
        />
      )}

      {/* 🔥 Category-based horizontal rows (same behavior as Trending) */}
      {!loading && filteredListings.length > 0 && (
        <div className="space-y-10">
          {Object.entries(groupedListings).map(([categoryName, categoryListings]) => (
            <div key={categoryName} className="space-y-4">
              
              <h2 className="text-xl font-semibold text-emerald-700">
                {categoryName}
              </h2>

              <div className="relative group overflow-hidden">
                <button
                  onClick={() => scrollCategory(categoryName, "left")}
                  className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full px-3 py-2 opacity-0 group-hover:opacity-100 transition"
                >
                  ‹
                </button>

                <button
                  onClick={() => scrollCategory(categoryName, "right")}
                  className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full px-3 py-2 opacity-0 group-hover:opacity-100 transition"
                >
                  ›
                </button>

                <div
                  ref={(el) => {
                    categoryRefs.current[categoryName] = el;
                  }}
                  className="flex gap-5 overflow-x-auto scroll-smooth no-scrollbar"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  {categoryListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="min-w-[200px] sm:min-w-[240px] max-w-[240px] flex-shrink-0"
                    >
                      <div
                        onClick={() => {
                          if (isLoggedIn) recordView(listing.id);
                        }}
                      >
                        <ListingCard listing={listing} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

/* ================= CAROUSEL ================= */

function SectionCarousel({
  title,
  listings,
  scrollRef,
  onScroll,
}: {
  title: string;
  listings: Listing[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onScroll: (
    ref: React.RefObject<HTMLDivElement | null>,
    dir: "left" | "right"
  ) => void;
}) {

  return (
    <div className="space-y-4">

      <h2 className="text-xl font-semibold text-emerald-700">
        {title}
      </h2>

      <div className="relative group overflow-hidden">

        <button
          onClick={() => onScroll(scrollRef, "left")}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full px-3 py-2 opacity-0 group-hover:opacity-100"
        >
          ‹
        </button>

        <button
          onClick={() => onScroll(scrollRef, "right")}
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full px-3 py-2 opacity-0 group-hover:opacity-100"
        >
          ›
        </button>

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scroll-smooth no-scrollbar"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="min-w-[200px] sm:min-w-[240px] max-w-[240px] flex-shrink-0"
            >
              <div
                onClick={() => {
                  const token = localStorage.getItem("access_token");
                  if (token) {
                    fetchWithAuth(`/recently-viewed/${listing.id}`, {
                      method: "POST",
                    });
                  }
                }}
              >
                <ListingCard listing={listing} />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}