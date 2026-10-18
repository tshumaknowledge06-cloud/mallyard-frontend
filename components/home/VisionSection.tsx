"use client";

import Image from "next/image";

import SectionShell from "./SectionShell";

/* ================= COMPONENT ================= */

export default function VisionSection() {
  return (
    <SectionShell
      eyebrow="OUR VISION"
      headline="Building better connections for African commerce."
      copy="We are building infrastructure that helps businesses become more visible, helps people access products and services, and creates pathways for enterprise and delivery opportunities."
      tone="ivory"
    >
      {/* ================= WIDE VISION IMAGE ================= */}
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden shadow-xl border border-white/60">
        <Image
          src="/images/home/vision-african-commerce.png"
          alt="African commerce — connected shops, business owners and delivery activity"
          fill
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-cover"
          loading="lazy"
        />
      </div>

      {/* ================= HONEST NOTE ================= */}
      <p className="mt-8 text-xs text-gray-500 text-center max-w-2xl mx-auto leading-relaxed">
        This is the direction we are building towards. Features, coverage and
        services continue to grow as The Mallyard develops.
      </p>
    </SectionShell>
  );
}