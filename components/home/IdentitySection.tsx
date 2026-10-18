"use client";

import Image from "next/image";

/* ================= COMPONENT ================= */

export default function IdentitySection() {
  return (
    <section className="full-bleed bg-[#F9F7F3] py-20 md:py-28">
      <div className="container-page">
        <div className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto">

          {/* ================= LOGO (much larger) ================= */}
          <div className="relative w-48 h-48 md:w-72 md:h-72 -mb-4">
            <Image
              src="/images/home/Vert logo.png"
              alt="The Mallyard"
              fill
              sizes="(max-width: 768px) 192px, 288px"
              className="object-contain"
            />
          </div>

          {/* ================= COMPANY ================= */}
          <div className="flex flex-col gap-3">
            <p className="text-sm md:text-base text-[var(--emerald-main)] leading-relaxed">
              Proudly a product of Mallyard Enterprises (Private) Limited.
            </p>
            <p className="text-xs md:text-sm tracking-widest uppercase text-gray-500 font-medium">
              Building Infrastructure. Empowering Commerce.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}