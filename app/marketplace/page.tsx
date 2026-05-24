"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Store, Package, Zap, Eye } from "lucide-react";

import ListingCard from "@/components/marketplace/ListingCard";
import CategoryFilter from "@/components/marketplace/CategoryFilter";

import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import { fetchPublic, fetchWithAuth } from "@/lib/api";
import { getMediaUrl } from "@/lib/getMediaUrl";

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

interface FeaturedMerchant {
  id: number;
  business_name: string;
  logo_url?: string;
}

/* ================= PAGE ================= */

export default function MarketplacePage() {

  const [listings, setListings] = useState<Listing[]>([]);
  const [trending, setTrending] = useState<Listing[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  
  // 🔥 Product/Service filter state - default to "service"
  const [listingTypeFilter, setListingTypeFilter] = useState<"product" | "service">("service");
  
  // 🔥 Featured Merchants state
  const [featuredMerchants, setFeaturedMerchants] = useState<FeaturedMerchant[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const trendingRef = useRef<HTMLDivElement>(null);
  const recentRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  
  // 🔥 Store refs for each category row
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isLoggedIn =
    typeof window !== "undefined" &&
    !!localStorage.getItem("access_token");

  // 🔥 Function to clear location filter
  const clearLocationFilter = () => {
    localStorage.removeItem("selectedLocation");
    setLocation("");
    window.dispatchEvent(new Event("locationChanged"));
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    loadLocation();
    fetchListings();
    fetchCategories();
    fetchTrending();
    fetchFeaturedMerchants();

    if (isLoggedIn) fetchRecentlyViewed();

    const handleStorage = () => {
      const stored = localStorage.getItem("selectedLocation") || "";
      setLocation(stored);
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
      const data = await fetchPublic("/trending/?limit=50");
      setTrending((data || []).map(normalizeListing));
    } catch {
      setTrending([]);
    }
  };

  const fetchFeaturedMerchants = async () => {
    try {
      // ✅ FIXED: Using the new /merchants/approved endpoint
      const data = await fetchPublic("/merchants/approved");
      setFeaturedMerchants(data || []);
    } catch {
      setFeaturedMerchants([]);
    }
  };

  const fetchRecentlyViewed = async () => {
    try {
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

  // Combined filtering logic (category + listing_type)
  const filteredListings = listings.filter((l) => {
    if (selectedCategory && l.subcategory.category_id !== selectedCategory) return false;
    if (listingTypeFilter && l.listing_type !== listingTypeFilter) return false;
    return true;
  });

  // Group filtered listings by category name
  const groupedListings = filteredListings.reduce((acc, listing) => {
    const categoryName = listing.subcategory?.name || "Uncategorized";
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(listing);
    return acc;
  }, {} as Record<string, Listing[]>);

  // 🔥 Split trending into products and services
  const trendingProducts = trending.filter(item => item.listing_type === "product");
  const trendingServices = trending.filter(item => item.listing_type === "service");

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

  // Category-specific scroll handler
  const scrollCategory = (categoryName: string, dir: "left" | "right") => {
    const ref = { current: categoryRefs.current[categoryName] };
    scroll(ref, dir);
  };

  // 🔥 Glassy emerald box styling for section titles
  const SectionTitle = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50/40 backdrop-blur-sm border border-emerald-200/50 shadow-sm">
      <Icon className="w-4 h-4 text-emerald-700" />
      <h2 className="text-base md:text-lg font-semibold text-emerald-800">
        {title}
      </h2>
    </div>
  );

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

      {/* 🔥 FEATURED MERCHANTS (NEW SECTION - TOP) */}
      {featuredMerchants.length > 0 && (
        <MerchantCarousel
          title="Featured Merchants"
          merchants={featuredMerchants}
          scrollRef={featuredRef}
          onScroll={scroll}
        />
      )}

      {/* 🔥 TRENDING PRODUCTS */}
      {trendingProducts.length > 0 && (
        <SectionCarousel
          title="Trending Products"
          listings={trendingProducts}
          scrollRef={trendingRef}
          onScroll={scroll}
          icon={Package}
        />
      )}

      {/* 🔥 POPULAR SERVICES */}
      {trendingServices.length > 0 && (
        <SectionCarousel
          title="Popular Services"
          listings={trendingServices}
          scrollRef={trendingRef}
          onScroll={scroll}
          icon={Zap}
        />
      )}

      {/* RECENTLY VIEWED */}
      {isLoggedIn && recentlyViewed.length > 0 && (
        <SectionCarousel
          title="Recently Viewed"
          listings={recentlyViewed}
          scrollRef={recentRef}
          onScroll={scroll}
          icon={Eye}
        />
      )}

      {/* LOCATION WITH EXIT LINK */}
      {location && (
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50/40 backdrop-blur-sm border border-emerald-200/50 shadow-sm">
            <span className="text-sm text-emerald-700">📍</span>
            <span className="text-sm font-medium text-emerald-800">
              Showing in {location}
            </span>
          </div>
          <button
            onClick={clearLocationFilter}
            className="text-sm text-blue-600 underline hover:text-blue-800 transition"
          >
            Exit
          </button>
        </div>
      )}

      {/* 🔥 FILTERS ROW: Category Filter + Product/Service Toggle */}
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

      {/* 🔥 Category-based horizontal rows */}
      {!loading && filteredListings.length > 0 && (
        <div className="space-y-10">
          {Object.entries(groupedListings).map(([categoryName, categoryListings]) => (
            <div key={categoryName} className="space-y-4">
              
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50/40 backdrop-blur-sm border border-emerald-200/50 shadow-sm">
                <span className="text-sm text-emerald-700">📂</span>
                <h2 className="text-base md:text-lg font-semibold text-emerald-800">
                  {categoryName}
                </h2>
              </div>

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

/* ================= MERCHANT CAROUSEL ================= */

function MerchantCarousel({
  title,
  merchants,
  scrollRef,
  onScroll,
}: {
  title: string;
  merchants: FeaturedMerchant[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onScroll: (
    ref: React.RefObject<HTMLDivElement | null>,
    dir: "left" | "right"
  ) => void;
}) {

  return (
    <div className="space-y-4">

      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50/40 backdrop-blur-sm border border-emerald-200/50 shadow-sm">
        <Store className="w-4 h-4 text-emerald-700" />
        <h2 className="text-base md:text-lg font-semibold text-emerald-800">
          {title}
        </h2>
      </div>

      <div className="relative group overflow-hidden">

        <button
          onClick={() => onScroll(scrollRef, "left")}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full px-3 py-2 opacity-0 group-hover:opacity-100 transition"
        >
          ‹
        </button>

        <button
          onClick={() => onScroll(scrollRef, "right")}
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full px-3 py-2 opacity-0 group-hover:opacity-100 transition"
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
          {merchants.map((merchant) => (
            <Link
              key={merchant.id}
              href={`/store/${merchant.id}`}
              className="min-w-[160px] sm:min-w-[180px] max-w-[180px] flex-shrink-0 group/merchant"
            >
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all duration-200 text-center">
                <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-gray-100 mb-3">
                  {merchant.logo_url ? (
                    <img
                      src={getMediaUrl(merchant.logo_url)}
                      className="w-full h-full object-cover"
                      alt={merchant.business_name}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-emerald-100 to-emerald-50">
                      🏪
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">
                  {merchant.business_name}
                </h3>
                <p className="text-[10px] text-emerald-600 mt-1 opacity-0 group-hover/merchant:opacity-100 transition">
                  Visit Store →
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}

/* ================= CAROUSEL ================= */

function SectionCarousel({
  title,
  listings,
  scrollRef,
  onScroll,
  icon: Icon,
}: {
  title: string;
  listings: Listing[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onScroll: (
    ref: React.RefObject<HTMLDivElement | null>,
    dir: "left" | "right"
  ) => void;
  icon: React.ElementType;
}) {

  return (
    <div className="space-y-4">

      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50/40 backdrop-blur-sm border border-emerald-200/50 shadow-sm">
        <Icon className="w-4 h-4 text-emerald-700" />
        <h2 className="text-base md:text-lg font-semibold text-emerald-800">
          {title}
        </h2>
      </div>

      <div className="relative group overflow-hidden">

        <button
          onClick={() => onScroll(scrollRef, "left")}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full px-3 py-2 opacity-0 group-hover:opacity-100 transition"
        >
          ‹
        </button>

        <button
          onClick={() => onScroll(scrollRef, "right")}
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full px-3 py-2 opacity-0 group-hover:opacity-100 transition"
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