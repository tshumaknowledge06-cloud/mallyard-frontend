"use client";

import Image from "next/image";

import SectionShell from "./SectionShell";
import HorizontalRail from "./HorizontalRail";

/* ================= MERCHANT VISUALS ================= */

interface MerchantVisual {
  image: string;
}

const MERCHANT_VISUALS: MerchantVisual[] = [
  { image: "/images/home/merchant-shop-owner.png" },
  { image: "/images/home/merchant-product-seller.png" },
  { image: "/images/home/merchant-service-professional.png" },
  { image: "/images/home/merchant-customer-handover.png" },
];

/* ================= COMPONENT ================= */

export default function MerchantSection() {
  return (
    <SectionShell
      eyebrow="MERCHANTS"
      headline="Bring your business into view."
      copy="Create your presence on The Mallyard, showcase what you offer and connect with people looking for products and services like yours."
      cta={{
        label: "Open Your Store",
        href: "/register/merchant",
      }}
      tone="white"
      layout="eyebrow-rail-headline-cta"
      footerNote="Opening a store gives your business visibility on The Mallyard. Listing terms, verification and any applicable fees are shown during registration."
    >
      <HorizontalRail autoScroll autoScrollSpeed={16}>
        {MERCHANT_VISUALS.map((visual, index) => (
          <div
            key={`merchant-${index}`}
            className="min-w-[240px] sm:min-w-[280px] max-w-[280px] flex-shrink-0"
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
              <Image
                src={visual.image}
                alt="Merchant"
                fill
                sizes="(max-width: 640px) 240px, 280px"
                className="object-cover"
              />
            </div>
          </div>
        ))}
      </HorizontalRail>
    </SectionShell>
  );
}