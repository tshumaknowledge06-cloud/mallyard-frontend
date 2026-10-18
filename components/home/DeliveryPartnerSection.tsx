"use client";

import Image from "next/image";

import SectionShell from "./SectionShell";
import HorizontalRail from "./HorizontalRail";

/* ================= VEHICLES ================= */

interface Vehicle {
  image: string;
}

const VEHICLES: Vehicle[] = [
  { image: "/images/home/vehicle-bicycle.png" },
  { image: "/images/home/vehicle-motorbike.png" },
  { image: "/images/home/vehicle-car.png" },
  { image: "/images/home/vehicle-van.png" },
];

/* ================= COMPONENT ================= */

export default function DeliveryPartnerSection() {
  return (
    <SectionShell
      eyebrow="DELIVERY PARTNERS"
      headline="Turn your vehicle into an opportunity."
      copy="Have a suitable vehicle and want to earn through delivery opportunities? Join the network and apply to become a delivery partner."
      cta={{
        label: "Become a Delivery Partner",
        href: "/register/delivery-partner",
      }}
      tone="ivory"
      layout="eyebrow-rail-headline-cta"
      footerNote="Vehicle types are shown as examples of delivery modes. Availability and acceptance depend on your service area and the current delivery requirements."
    >
      <HorizontalRail autoScroll autoScrollSpeed={16}>
        {VEHICLES.map((vehicle, index) => (
          <div
            key={`vehicle-${index}`}
            className="min-w-[240px] sm:min-w-[280px] max-w-[280px] flex-shrink-0"
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
              <Image
                src={vehicle.image}
                alt="Delivery vehicle"
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