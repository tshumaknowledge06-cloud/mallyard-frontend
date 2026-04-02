"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import ListingCard from "@/components/marketplace/ListingCard";
import { fetchPublic } from "@/lib/api";
import { Listing } from "@/types/listing";

export default function SearchPage() {

  const params = useSearchParams();
  const query = params.get("q");

  const [results, setResults] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchResults();
  }, [query]);

  const fetchResults = async () => {
    try {
      if (!query) {
        setResults([]);
        setLoading(false);
        return;
      }

      const data = await fetchPublic(
        `/sandy/discovery?query=${encodeURIComponent(query)}`,
        {},
      );

      setResults((Array.isArray(data) ? data : []) as Listing[]);

    } catch (err) {
      console.error("Search error", err);
      setResults([]);
    }

    setLoading(false);
  };

  // 🔥 TRIGGER SANDY (PRESERVED)
  const askSandy = () => {
    window.dispatchEvent(
      new CustomEvent("openSandy", {
        detail: {
          message: "how to become a merchant",
        },
      })
    );
  };

  if (loading) {
    return <p className="p-6 text-gray-500">Searching...</p>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

      {/* TITLE */}
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
        Results for "{query}"
      </h1>

      {results.length === 0 && (
        <div className="text-center py-16 space-y-4">

          <div className="text-gray-800 text-lg font-semibold">
            Nothing found… yet.
          </div>

          <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
            No products or services match your search. This is your opportunity.
            Be the first to list, stand out early, and capture demand before the market fills.
          </p>

          {/* 🔥 INLINE SANDY LINK */}
          <p className="text-sm text-gray-600">
            <span
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent("openSandy", {
                    detail: {
                      message: "how to become a merchant",
                    },
                  })
                );
              }}
              className="
                cursor-pointer
                text-emerald-700 font-semibold
                hover:underline
                hover:text-emerald-800
                transition
              "
            >
              Consult Sandy for more information →
            </span>
          </p>

        </div>
      )}

      {/* RESULTS GRID (MALLYARD STANDARD) */}
      {results.length > 0 && (
        <div
          className="
            grid gap-6
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
          "
        >
          {results.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
            />
          ))}
        </div>
      )}

    </div>
  );
}