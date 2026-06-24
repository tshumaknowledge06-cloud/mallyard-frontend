"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import Button from "@/components/ui/Button";
import ListingCard from "@/components/marketplace/ListingCard";

import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";

import OrderModal from "@/components/orders/OrderModal";
import BookingModal from "@/components/bookings/BookingModal";
import { fetchWithAuth, fetchPublic } from "@/lib/api";
import { getMediaUrl } from "@/lib/getMediaUrl";

interface Merchant {
  id: number;
  business_name: string;
  location: string;
  merchant_type: string;
  user_id?: number;
}

interface SubCategory {
  id: number;
  name: string;
  category_id: number;
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
  subcategory: SubCategory;
}

interface Review {
  id: number;
  content: string;
  created_at: string;
}

export default function ListingPage() {
  const { id } = useParams();

  const [listing, setListing] = useState<Listing | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similar, setSimilar] = useState<Listing[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [showReviews, setShowReviews] = useState(false);

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const [wishlistAdded, setWishlistAdded] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);
  const [showSelfPopup, setShowSelfPopup] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);

  // 🔥 FULLSCREEN MEDIA VIEWER STATE
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const thumbnailScrollRef = useRef<HTMLDivElement>(null);

  // 🔥 NEW: State for showing full listing name in modal/popup
  const [showFullNameModal, setShowFullNameModal] = useState(false);

  // 🔥 Helper function to truncate listing name
  const truncateName = (name: string, maxLength: number = 15) => {
    if (!name) return "";
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + "...";
  };

  useEffect(() => {
    fetchListing();
  }, []);

  useEffect(() => {
    if (listing) fetchSimilar();
  }, [listing]);

  const fetchListing = async () => {
    try {
      const data = await fetchPublic(`/listings/${id}`);
      setListing(data);
    } catch {
      setError(true);
    }
    setLoading(false);
  };

  const fetchSimilar = async () => {
    try {
      const data = await fetchPublic("/listings/marketplace");

      const filtered = data.filter(
        (l: Listing) =>
          l.subcategory?.id === listing?.subcategory?.id &&
          l.id !== listing?.id
      );

      setSimilar(filtered);
    } catch {
      setSimilar([]);
    }
  };

  const fetchReviews = async () => {
    try {
      const data = await fetchPublic(`/reviews/${id}`);
      setReviews(data);
    } catch {}
  };

  function requireAuth() {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Please log in to continue.");
      return false;
    }
    return true;
  }

  function isOwnListing() {
    const userId = Number(localStorage.getItem("user_id"));
    return listing?.merchant?.user_id === userId;
  }

  function blockSelfAction() {
    setShowSelfPopup(true);
  }

  const handleOpenOrderModal = () => {
    if (!requireAuth()) return;
    if (isOwnListing()) return blockSelfAction();
    setShowOrderModal(true);
  };

  const handleOpenBookingModal = () => {
    if (!requireAuth()) return;
    if (isOwnListing()) return blockSelfAction();
    setShowBookingModal(true);
  };

  const handleAddToCart = async () => {
    if (!requireAuth()) return;
    if (isOwnListing()) return blockSelfAction();

    try {
      await fetchWithAuth(`/cart/add?listing_id=${listing?.id}`, {
        method: "POST",
      });

      setCartAdded(true);
      window.dispatchEvent(new Event("cartUpdated"));
      setTimeout(() => setCartAdded(false), 2500);
    } catch {
      alert("Could not add item to cart.");
    }
  };

  const addToWishlist = async () => {
    if (!requireAuth()) return;
    if (isOwnListing()) return blockSelfAction();

    try {
      await fetchWithAuth("/wishlist/", {
        method: "POST",
        body: JSON.stringify({
          listing_id: listing?.id,
        }),
      });

      setWishlistAdded(true);
    } catch (err: any) {
      if (err?.message?.toLowerCase().includes("already")) {
        setWishlistAdded(true);
        return;
      }
      alert("Failed to add to wishlist.");
    }
  };

  const handleCompare = () => {
    if (!listing) return;
    window.location.href = `/compare?base=${listing.id}`;
  };

  const toggleReviews = () => {
    if (!showReviews) fetchReviews();
    setShowReviews(!showReviews);
  };

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;

    const amount = 300;

    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  // 🔥 FULLSCREEN MEDIA FUNCTIONS
  const openFullscreen = (index: number) => {
    setFullscreenIndex(index);
    setFullscreenOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeFullscreen = () => {
    setFullscreenOpen(false);
    document.body.style.overflow = "auto";
  };

  const goToPrev = () => {
    setFullscreenIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setFullscreenIndex((prev) => (prev + 1) % media.length);
  };

  // 🔥 Touch swipe handlers for fullscreen
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 50) goToNext();
    if (diff < -50) goToPrev();
    setTouchStartX(null);
  };

  // 🔥 Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!fullscreenOpen) return;
      if (e.key === "Escape") closeFullscreen();
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fullscreenOpen]);

  const media = [
    ...(listing?.image_urls || []).map((img) => ({
      type: "image",
      src: getMediaUrl(img),
    })),
    ...(listing?.video_url
      ? [{ type: "video", src: getMediaUrl(listing.video_url) }]
      : []),
  ];

  if (loading) return <LoadingState />;
  if (error || !listing) return <ErrorState message="Listing not found" />;

  return (
    <div className="w-full">

      {/* 🔥 FULLSCREEN MEDIA VIEWER */}
      {fullscreenOpen && media.length > 0 && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* CLOSE BUTTON */}
          <button
            onClick={closeFullscreen}
            className="absolute top-4 right-4 z-10 text-white/80 hover:text-white text-2xl p-2"
          >
            ✕
          </button>

          {/* MAIN MEDIA (75% of screen) */}
          <div className="flex-1 flex items-center justify-center p-4 relative h-[75vh]">
            {media[fullscreenIndex].type === "image" ? (
              <img
                src={media[fullscreenIndex].src}
                className="max-w-full max-h-full object-contain"
                alt="Fullscreen media"
              />
            ) : (
              <video
                src={media[fullscreenIndex].src}
                className="max-w-full max-h-full object-contain"
                controls
                autoPlay
              />
            )}

            {/* Navigation Arrows - Only if more than 1 media */}
            {media.length > 1 && (
              <>
                <button
                  onClick={goToPrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition"
                >
                  ‹
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition"
                >
                  ›
                </button>
              </>
            )}
          </div>

          {/* THUMBNAIL CAROUSEL (25% of screen) */}
          {media.length > 1 && (
            <div className="h-[25vh] bg-black/50 p-3">
              <div
                ref={thumbnailScrollRef}
                className="flex gap-3 h-full overflow-x-auto no-scrollbar items-center"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {media.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setFullscreenIndex(idx)}
                    className={`h-[80%] w-auto flex-shrink-0 rounded-lg overflow-hidden transition-all duration-200 ${
                      idx === fullscreenIndex
                        ? "ring-2 ring-[#D4AF37] scale-105"
                        : "ring-1 ring-white/20 hover:ring-white/50"
                    }`}
                  >
                    {item.type === "image" ? (
                      <img
                        src={item.src}
                        className="h-full w-auto object-cover"
                        alt={`Thumbnail ${idx + 1}`}
                      />
                    ) : (
                      <div className="h-full w-24 bg-gray-700 flex items-center justify-center text-white/60 text-xs">
                        ▶ Video
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 🔥 FULL NAME MODAL/POPUP */}
      {showFullNameModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Listing Name
            </h3>
            <p className="text-gray-700 break-words">
              {listing.name}
            </p>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowFullNameModal(false)}
                className="px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN */}
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">

        <div className="grid lg:grid-cols-2 gap-10">

          <div className="space-y-4">

            <div
              className="relative w-full h-[380px] bg-gray-100 rounded-2xl overflow-hidden cursor-pointer"
              onClick={() => openFullscreen(currentIndex)}
            >
              {media.length > 0 ? (
                <>
                  {media[currentIndex].type === "image" ? (
                    <img
                      src={media[currentIndex].src}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={media[currentIndex].src}
                      className="w-full h-full object-cover"
                      controls
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}

                  {/* 🔥 FULLSCREEN HINT */}
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white/70 text-xs px-2 py-1 rounded-full">
                    ⛶
                  </div>

                  {media.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentIndex((prev) =>
                            prev === 0 ? media.length - 1 : prev - 1
                          );
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white px-3 py-2 rounded-full hover:bg-black/60 transition"
                      >
                        ‹
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentIndex((prev) => (prev + 1) % media.length);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white px-3 py-2 rounded-full hover:bg-black/60 transition"
                      >
                        ›
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Media
                </div>
              )}
            </div>

            {/* dots */}
            {media.length > 1 && (
              <div className="flex justify-center gap-2">
                {media.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full cursor-pointer ${
                      i === currentIndex ? "bg-emerald-700" : "bg-gray-300"
                    }`}
                    onClick={() => setCurrentIndex(i)}
                  />
                ))}
              </div>
            )}

          </div>

          {/* DETAILS */}
          <div className="space-y-6">

            {/* 🔥 TRUNCATED LISTING NAME WITH CLICK TO VIEW FULL */}
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">
                {truncateName(listing.name, 15)}
              </h1>
              {listing.name.length > 15 && (
                <button
                  onClick={() => setShowFullNameModal(true)}
                  className="text-emerald-600 hover:text-emerald-800 transition text-sm font-medium"
                  title="Click to see full name"
                >
                  ⓘ
                </button>
              )}
            </div>

            <Link
              href={`/store/${listing.merchant.id}`}
              className="inline-block px-4 py-1 rounded-full text-sm bg-yellow-50 text-yellow-700 animate-pulse"
            >
              ✨ By {listing.merchant.business_name}
            </Link>

            <div className="text-3xl font-bold text-emerald-700">
              {listing.currency} {listing.price}
            </div>

            <p className="text-gray-600">{listing.description}</p>

            <div className="flex flex-wrap gap-3">

              {listing.listing_type === "product" && (
                <>
                  <Button onClick={handleOpenOrderModal}>Order</Button>
                  <Button onClick={handleAddToCart}>
                    {cartAdded ? "Added ✓" : "Add to Cart"}
                  </Button>
                </>
              )}

              {listing.listing_type === "service" && (
                <Button onClick={handleOpenBookingModal}>Book</Button>
              )}

              <Button onClick={addToWishlist}>
                {wishlistAdded ? "Saved ✓" : "Wishlist"}
              </Button>

              <Button onClick={handleCompare}>Compare</Button>

              <button onClick={toggleReviews}>
                {showReviews ? "Hide reviews" : "See reviews →"}
              </button>

            </div>

          </div>
        </div>

        {/* 🔥 REVIEWS STRIP (MALLYARD STANDARD) */}
        {showReviews && (
          <div className="space-y-3 pt-4">

            <h3 className="text-sm font-semibold text-gray-800">
              Customer Reviews
            </h3>

            {reviews.length === 0 ? (
              <p className="text-sm text-gray-500">
                No reviews yet.
              </p>
            ) : (
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">

                {reviews.map((r) => (
                  <div
                    key={r.id}
                    className="
                      min-w-[240px] max-w-[240px]
                      bg-white border rounded-xl p-3
                      shadow-sm
                    "
                  >
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {r.content}
                    </p>

                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}

              </div>
            )}
          </div>
        )}

        {/* 🔥 SIMILAR LISTINGS */}
        {similar.length > 0 && (
          <div className="space-y-4">

            <h2 className="text-xl font-semibold">
              Similar Listings
            </h2>

            <div className="relative group">

              {/* arrows */}
              <button
                onClick={() => scroll("left")}
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow px-3 py-2 rounded-full opacity-0 group-hover:opacity-100"
              >
                ‹
              </button>

              <button
                onClick={() => scroll("right")}
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow px-3 py-2 rounded-full opacity-0 group-hover:opacity-100"
              >
                ›
              </button>

              <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth"
              >
                {similar.map((item) => (
                  <div
                    key={item.id}
                    className="min-w-[260px] max-w-[260px]"
                  >
                    <ListingCard listing={item} />
                  </div>
                ))}
              </div>

            </div>

          </div>
        )}

      </div>

      {/* MODALS */}
      {showOrderModal && (
        <OrderModal listingId={listing.id} onClose={() => setShowOrderModal(false)} />
      )}

      {showBookingModal && (
        <BookingModal listingId={listing.id} onClose={() => setShowBookingModal(false)} />
      )}
    </div>
  );
}