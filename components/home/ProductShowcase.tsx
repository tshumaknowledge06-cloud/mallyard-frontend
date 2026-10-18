"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import SectionShell from "./SectionShell";
import HorizontalRail from "./HorizontalRail";
import { getMediaUrl } from "@/lib/getMediaUrl";

/* ================= TYPES ================= */

interface Listing {
  id: number;
  name: string;
  price: number;
  currency: string;
  listing_type: "product" | "service";
  image_urls?: string[];
}

/* ================= STATIC FIRST CARD ================= */

const LAMP_CARD = {
  image: "/images/home/product-table-lamp.png",
  href: "/marketplace?type=product",
};

const MAX_REAL_PRODUCTS = 6;

/* ================= COMPONENT ================= */

export default function ProductShowcase() {
  const [products, setProducts] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setHasError(false);

        const base = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await fetch(
          `${base}/listings/marketplace?page=1&page_size=100`
        );

        if (!res.ok) {
          throw new Error("Failed to load products");
        }

        const data = await res.json();
        const all = Array.isArray(data) ? data : [];

        const realProducts = all
          .filter((l: Listing) => l.listing_type === "product")
          .slice(0, MAX_REAL_PRODUCTS);

        if (!cancelled) {
          setProducts(realProducts);
        }
      } catch {
        if (!cancelled) {
          setHasError(true);
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SectionShell
      eyebrow="PRODUCTS"
      headline="What you need. More ways to find it."
      copy="Browse products, compare your options and connect with sellers."
      cta={{
        label: "Explore Products",
        href: "/marketplace?type=product",
      }}
      tone="ivory"
      layout="eyebrow-rail-headline-cta"
    >
      <HorizontalRail autoScroll autoScrollSpeed={18}>

        {/* ================= CARD 1 — STATIC TABLE LAMP ================= */}
        <div className="min-w-[240px] sm:min-w-[280px] max-w-[280px] flex-shrink-0">
          <Link href={LAMP_CARD.href} className="block">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
              <Image
                src={LAMP_CARD.image}
                alt="Product"
                fill
                sizes="(max-width: 640px) 240px, 280px"
                className="object-cover"
              />
            </div>
          </Link>
        </div>

        {/* ================= LOADING SKELETONS (cards 2–7) ================= */}
        {loading &&
          Array.from({ length: MAX_REAL_PRODUCTS }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="min-w-[240px] sm:min-w-[280px] max-w-[280px] flex-shrink-0"
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 animate-pulse" />
            </div>
          ))}

        {/* ================= REAL PRODUCT CARDS (cards 2–7) ================= */}
        {!loading &&
          products.map((product) => {
            const image =
              product.image_urls && product.image_urls.length > 0
                ? getMediaUrl(product.image_urls[0])
                : null;

            return (
              <div
                key={product.id}
                className="min-w-[240px] sm:min-w-[280px] max-w-[280px] flex-shrink-0"
              >
                <Link href={`/listing/${product.id}`} className="block group">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
                    {image ? (
                      <Image
                        src={image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 240px, 280px"
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}

        {/* ================= EMPTY / ERROR NOTE ================= */}
        {!loading && products.length === 0 && (
          <div className="min-w-[240px] sm:min-w-[280px] max-w-[280px] flex-shrink-0 flex items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white/40">
            <p className="text-xs text-gray-400 text-center px-4 py-10 leading-relaxed">
              {hasError
                ? "More products coming soon."
                : "More products are being added to The Yard soon."}
            </p>
          </div>
        )}

      </HorizontalRail>
    </SectionShell>
  );
}