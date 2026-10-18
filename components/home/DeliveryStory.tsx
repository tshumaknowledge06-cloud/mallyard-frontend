"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import SectionShell from "./SectionShell";

/* ================= STAGES ================= */

interface Stage {
  step: number;
  image: string;
  label: string;
  description: string;
}

const STAGES: Stage[] = [
  {
    step: 1,
    image: "/images/home/delivery-01-order.png",
    label: "Place the order",
    description:
      "The customer chooses a product and connects with the seller.",
  },
  {
    step: 2,
    image: "/images/home/delivery-02-packing.png",
    label: "Prepare the order",
    description:
      "The seller packs and prepares the product.",
  },
  {
    step: 3,
    image: "/images/home/delivery-03-pickup.png",
    label: "Collect the order",
    description:
      "A delivery partner collects the order when pickup has been coordinated.",
  },
  {
    step: 4,
    image: "/images/home/delivery-04-handover.png",
    label: "Deliver the order",
    description:
      "The delivery partner brings the order to the customer.",
  },
  {
    step: 5,
    image: "/images/home/delivery-05-complete.png",
    label: "Complete the handover",
    description:
      "The customer receives the order and completion is confirmed through the applicable process.",
  },
];

/* ================= COMPONENT ================= */

export default function DeliveryStory() {
  const [activeStep, setActiveStep] = useState(0);

  /* Gentle auto-advance — pauses on reduced motion */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STAGES.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <SectionShell
      eyebrow="HOW IT WORKS"
      headline="From their hands to yours."
      copy="The Mallyard connects customers, sellers and delivery partners to help move orders forward."
      tone="white"
    >
      {/* ================= DESKTOP — HORIZONTAL SEQUENCE ================= */}
      <div className="hidden md:block w-full min-w-0">
        <div className="relative">
          {/* CONNECTOR LINE */}
          <div
            className="absolute top-16 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"
            aria-hidden="true"
          />

          <div className="grid grid-cols-5 gap-4 relative">
            {STAGES.map((stage, index) => {
              const isActive = index === activeStep;

              return (
                <button
                  key={stage.step}
                  type="button"
                  onClick={() => setActiveStep(index)}
                  className="flex flex-col items-center text-center group min-w-0"
                  aria-label={`Step ${stage.step}: ${stage.label}`}
                >
                  <div
                    className={`
                      relative aspect-[4/3] w-full rounded-2xl overflow-hidden
                      bg-gray-100 shadow-sm transition-all duration-300
                      ${
                        isActive
                          ? "ring-2 ring-[var(--gold-soft)] scale-[1.02]"
                          : "opacity-80 group-hover:opacity-100"
                      }
                    `}
                  >
                    <Image
                      src={stage.image}
                      alt={stage.label}
                      fill
                      sizes="(max-width: 1024px) 0px, 220px"
                      className="object-cover"
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-center gap-2">
                    <span
                      className={`
                        inline-flex items-center justify-center
                        w-6 h-6 rounded-full text-xs font-bold
                        ${
                          isActive
                            ? "bg-[var(--gold-soft)] text-[var(--emerald-dark)]"
                            : "bg-[var(--emerald-main)] text-white"
                        }
                      `}
                    >
                      {stage.step}
                    </span>
                    <p className="text-sm font-semibold text-[var(--emerald-main)]">
                      {stage.label}
                    </p>
                  </div>

                  <p className="mt-2 text-xs text-gray-600 leading-relaxed px-2">
                    {stage.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= MOBILE — SWIPEABLE ================= */}
      <div className="md:hidden w-full max-w-full min-w-0">
        <div className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar snap-x snap-mandatory w-full max-w-full min-w-0">
          {STAGES.map((stage) => (
            <div
              key={stage.step}
              className="min-w-[85%] max-w-[85%] snap-center flex-shrink-0"
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
                <Image
                  src={stage.image}
                  alt={stage.label}
                  fill
                  sizes="85vw"
                  className="object-cover"
                />
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-[var(--emerald-main)] text-white">
                  {stage.step}
                </span>
                <p className="text-sm font-semibold text-[var(--emerald-main)]">
                  {stage.label}
                </p>
              </div>

              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                {stage.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}