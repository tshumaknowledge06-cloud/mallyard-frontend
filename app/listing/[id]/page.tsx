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

  const scrollRef = useRef<HTMLDivElement>(null);

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

      {/* MAIN */}
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">

        <div className="grid lg:grid-cols-2 gap-10">

          <div className="space-y-4">

            <div className="relative w-full h-[380px] bg-gray-100 rounded-2xl overflow-hidden">

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
                    />
                  )}

                  {media.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setCurrentIndex((prev) =>
                            prev === 0 ? media.length - 1 : prev - 1
                          )
                        }
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white px-3 py-2 rounded-full"
                      >
                        ‹
                      </button>

                      <button
                        onClick={() =>
                          setCurrentIndex((prev) => (prev + 1) % media.length)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white px-3 py-2 rounded-full"
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
                    className={`w-2 h-2 rounded-full ${
                      i === currentIndex ? "bg-emerald-700" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            )}

          </div>

          {/* DETAILS */}
          <div className="space-y-6">

            <h1 className="text-3xl font-bold">{listing.name}</h1>

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