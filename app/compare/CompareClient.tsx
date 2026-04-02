"use client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { fetchWithAuth } from "@/lib/api";

interface Merchant {
  business_name: string;
  location: string;
}

interface Listing {
  id: number;
  name: string;
  price: number;
  currency: string;
  listing_type: string;
  merchant: Merchant;

  image_urls?: string[];
  video_url?: string;
}

export default function ComparePage() {

  const params = useSearchParams();
  
  const baseId = params.get("base");
  const idsParam = params.get("ids");

  const [listings, setListings] = useState<Listing[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  if (!baseId && !idsParam) {
    setLoading(false);
    return;
  }

  if (idsParam) {
    fetchSelectedComparisons();
  } else if (baseId) {
    fetchComparables();
  }
}, [baseId, idsParam]);

  // =============================
  // FETCH COMPARABLES
  // =============================
  const fetchComparables = async () => {
    try {
      const data = await fetchWithAuth(`/listings/${baseId}/comparables`);
      const baseListing = await fetchWithAuth(`/listings/${baseId}`);

      setListings([baseListing, ...(Array.isArray(data) ? data : [])]);
      setSelected([Number(baseId)]);

    } catch {
      alert("Failed to load comparables");
    }

    setLoading(false);
  };

  // =============================
  // FETCH FINAL TABLE DATA
  // =============================
  const fetchSelectedComparisons = async () => {
    try {
      const query = idsParam
        ?.split(",")
        .map(id => `ids=${id}`)
        .join("&");

      const data = await fetchWithAuth(`/listings/compare?${query}`);

      setListings(Array.isArray(data) ? data : []);

    } catch {
      alert("Failed to load comparisons");
      setListings([]);
    }

    setLoading(false);
  };

  const toggleSelect = (id: number) => {
    if (selected.includes(id)) {
      if (id === Number(baseId)) return;
      setSelected(selected.filter((i) => i !== id));
    } else {
      if (selected.length >= 5) {
        alert("Max 5 listings");
        return;
      }
      setSelected([...selected, id]);
    }
  };

  const goToComparison = () => {
    if (selected.length < 2) {
      alert("Select at least 2 listings");
      return;
    }

    window.location.href = `/compare?ids=${selected.join(",")}`;
  };

  if (!baseId && !idsParam) {
    return <p className="p-10">Invalid comparison request</p>;
  }

  if (loading) return <p className="p-10">Loading...</p>;

  // =============================
  // 🟡 SELECTION MODE
  // =============================
  if (!idsParam) {
    return (
      <div className="max-w-7xl mx-auto p-6">

        <h1 className="text-3xl font-bold mb-8">
          Select Listings to Compare
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {listings.map((listing) => {

            const images = listing.image_urls || [];
            const video = listing.video_url;

            const isSelected = selected.includes(listing.id);
            const isBase = listing.id === Number(baseId);

            return (
              <div
                key={listing.id}
                onClick={() => toggleSelect(listing.id)}
                className={`
                  border rounded-xl p-4 cursor-pointer transition shadow-sm
                  ${isSelected ? "border-yellow-500 ring-2 ring-yellow-300 shadow-lg" : ""}
                  ${isBase ? "bg-yellow-50" : "bg-white"}
                `}
              >

                {/* MEDIA */}
                <div className="w-full h-40 bg-gray-100 rounded overflow-hidden">

                  {images.length > 0 ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${images[0]}`}
                      className="w-full h-full object-cover"
                    />
                  ) : video ? (
                    <video
                      src={`${process.env.NEXT_PUBLIC_API_URL}${video}`}
                      className="w-full h-full object-cover"
                      muted
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No Media
                    </div>
                  )}

                </div>

                <h2 className="font-semibold mt-3">
                  {listing.name}
                </h2>

                <p className="text-sm text-gray-500">
                  {listing.merchant.business_name}
                </p>

                {/* ✅ CURRENCY FIX */}
                <p className="text-yellow-600 font-bold">
                  {listing.currency} {listing.price}
                </p>

                {isBase && (
                  <p className="text-xs text-yellow-600 mt-1">
                    Base Listing
                  </p>
                )}

              </div>
            );
          })}

        </div>

        <div className="mt-8 text-right">
          <button
            onClick={goToComparison}
            className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600 shadow"
          >
            Get Comparison
          </button>
        </div>

      </div>
    );
  }

  // =============================
  // 🟢 TABLE MODE (UPGRADED)
  // =============================
  return (
    <div className="max-w-7xl mx-auto p-6 overflow-x-auto">

      <h1 className="text-3xl font-bold mb-10">
        Comparison Table
      </h1>

      <table className="min-w-full border rounded-lg overflow-hidden">

        <thead>
          <tr className="bg-yellow-50">
            <th className="p-3 text-left">Feature</th>

            {listings.map(l => (
              <th key={l.id} className="p-3 text-left">
                <Link
                  href={`/listing/${l.id}`}
                  className="text-yellow-700 font-semibold hover:underline"
                >
                  {l.name}
                </Link>
              </th>
            ))}
           </tr>
        </thead>

        <tbody>

          {/* 🖼 MEDIA ROW */}
          <tr className="border-t">
            <td className="p-3 font-medium">Media</td>

            {listings.map(l => (
              <td key={l.id} className="p-3">

                {l.image_urls?.length ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}${l.image_urls[0]}`}
                    className="w-24 h-24 object-cover rounded"
                  />
                ) : l.video_url ? (
                  <video
                    src={`${process.env.NEXT_PUBLIC_API_URL}${l.video_url}`}
                    className="w-24 h-24 object-cover rounded"
                    muted
                  />
                ) : (
                  <span className="text-gray-400 text-sm">
                    No media
                  </span>
                )}

               </td>
            ))}
          </tr>

          {/* 💰 PRICE */}
          <tr className="border-t">
            <td className="p-3 font-medium">Price</td>

            {listings.map(l => (
              <td key={l.id} className="p-3 text-yellow-600 font-semibold">
                {l.currency} {l.price}
               </td>
            ))}
          </tr>

          {/* 🏪 MERCHANT */}
          <tr className="border-t">
            <td className="p-3 font-medium">Merchant</td>

            {listings.map(l => (
              <td key={l.id} className="p-3">
                {l.merchant.business_name}
               </td>
            ))}
          </tr>

          {/* 📍 LOCATION */}
          <tr className="border-t">
            <td className="p-3 font-medium">Location</td>

            {listings.map(l => (
              <td key={l.id} className="p-3">
                {l.merchant.location}
               </td>
            ))}
          </tr>

          {/* 🧾 TYPE */}
          <tr className="border-t">
            <td className="p-3 font-medium">Type</td>

            {listings.map(l => (
              <td key={l.id} className="p-3 capitalize">
                {l.listing_type}
               </td>
            ))}
          </tr>

        </tbody>

      </table>

    </div>
  );
}