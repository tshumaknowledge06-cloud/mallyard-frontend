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

const HANDYMAN_CARD = {
  image: "/images/home/service-provider-handyman.png",
  href: "/marketplace?type=service",
};

const MAX_REAL_SERVICES = 6;

/* ================= COMPONENT ================= */

export default function ServiceShowcase() {
  const [services, setServices] = useState<Listing[]>([]);
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
          throw new Error("Failed to load services");
        }

        const data = await res.json();
        const all = Array.isArray(data) ? data : [];

        const realServices = all
          .filter((l: Listing) => l.listing_type === "service")
          .slice(0, MAX_REAL_SERVICES);

        if (!cancelled) {
          setServices(realServices);
        }
      } catch {
        if (!cancelled) {
          setHasError(true);
          setServices([]);
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
      eyebrow="SERVICES"
      headline="The right skills. Within reach."
      copy="From everyday tasks to specialised work, find service providers who can help you get it done."
      cta={{
        label: "Explore Services",
        href: "/marketplace?type=service",
      }}
      tone="white"
      layout="eyebrow-rail-headline-cta"
    >
      <HorizontalRail autoScroll autoScrollSpeed={18}>

        {/* ================= CARD 1 — STATIC HANDYMAN ================= */}
        <div className="min-w-[240px] sm:min-w-[280px] max-w-[280px] flex-shrink-0">
          <Link href={HANDYMAN_CARD.href} className="block">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
              <Image
                src={HANDYMAN_CARD.image}
                alt="Service provider"
                fill
                sizes="(max-width: 640px) 240px, 280px"
                className="object-cover"
              />
            </div>
          </Link>
        </div>

        {/* ================= LOADING SKELETONS (cards 2–7) ================= */}
        {loading &&
          Array.from({ length: MAX_REAL_SERVICES }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="min-w-[240px] sm:min-w-[280px] max-w-[280px] flex-shrink-0"
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 animate-pulse" />
            </div>
          ))}

        {/* ================= REAL SERVICE CARDS (cards 2–7) ================= */}
        {!loading &&
          services.map((service) => {
            const image =
              service.image_urls && service.image_urls.length > 0
                ? getMediaUrl(service.image_urls[0])
                : null;

            return (
              <div
                key={service.id}
                className="min-w-[240px] sm:min-w-[280px] max-w-[280px] flex-shrink-0"
              >
                <Link href={`/listing/${service.id}`} className="block group">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
                    {image ? (
                      <Image
                        src={image}
                        alt={service.name}
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
        {!loading && services.length === 0 && (
          <div className="min-w-[240px] sm:min-w-[280px] max-w-[280px] flex-shrink-0 flex items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white/40">
            <p className="text-xs text-gray-400 text-center px-4 py-10 leading-relaxed">
              {hasError
                ? "More services coming soon."
                : "More service providers are joining The Yard soon."}
            </p>
          </div>
        )}

      </HorizontalRail>
    </SectionShell>
  );
}