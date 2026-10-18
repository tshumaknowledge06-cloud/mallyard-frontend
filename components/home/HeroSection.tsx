"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function HeroSection() {
  const [registerOpen, setRegisterOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <section className="relative overflow-hidden bg-[#F9F7F3]">
      {/* BACKGROUND GRADIENT */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-[#F9F7F3] opacity-90" />

      <div className="relative container-page py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* ================= LEFT — CONTENT ================= */}
          <div className="order-2 lg:order-1 flex flex-col gap-6 text-center lg:text-left">

            {/* EYEBROW */}
            <p className="text-xs uppercase tracking-widest font-semibold text-[var(--gold-soft)]">
              THE MALLYARD WORLD
            </p>

            {/* HEADLINE */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[var(--emerald-main)] leading-tight">
              Everything you need. Connected in one place.
            </h1>

            {/* SUPPORTING COPY */}
            <p className="text-base md:text-lg text-gray-700 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Find products, skilled people and businesses. Compare your
              options. Connect directly through The Mallyard.
            </p>

            {/* ================= ACTIONS (EXISTING LOGIC PRESERVED) ================= */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-center justify-center lg:justify-start mt-2">

              {/* EXPLORE THE YARD — PRIMARY */}
              <Link
                href="/marketplace"
                className="w-full sm:w-auto text-center px-7 py-3 bg-[var(--emerald-main)] text-white rounded-full shadow-lg hover:bg-[var(--emerald-soft)] transition text-sm font-semibold"
              >
                Explore the Yard
              </Link>

              {/* GET STARTED — DROPDOWN (UNCHANGED LOGIC) */}
              <div className="relative w-full sm:w-auto">
                <button
                  onClick={() => {
                    setRegisterOpen(!registerOpen);
                    setLoginOpen(false);
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-white/80 border border-[var(--emerald-main)] text-[var(--emerald-main)] rounded-full hover:bg-white transition text-sm font-semibold"
                >
                  Get Started
                </button>

                {registerOpen && (
                  <div className="absolute left-0 sm:left-auto mt-2 w-full sm:w-52 bg-white border rounded-xl shadow-lg overflow-hidden z-50 animate-fade-in">
                    <Link
                      href="/register/customer"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Customer
                    </Link>
                    <Link
                      href="/register/merchant"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Merchant
                    </Link>
                    <Link
                      href="/register/delivery-partner"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Delivery Partner
                    </Link>
                  </div>
                )}
              </div>

              {/* LOGIN — DROPDOWN (UNCHANGED LOGIC) */}
              <div className="relative w-full sm:w-auto">
                <button
                  onClick={() => {
                    setLoginOpen(!loginOpen);
                    setRegisterOpen(false);
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-white/80 border border-[var(--emerald-main)] text-[var(--emerald-main)] rounded-full hover:bg-white transition text-sm font-semibold"
                >
                  Login
                </button>

                {loginOpen && (
                  <div className="absolute left-0 sm:left-auto mt-2 w-full sm:w-52 bg-white border rounded-xl shadow-lg overflow-hidden z-50 animate-fade-in">
                    <Link
                      href="/login/customer"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Customer
                    </Link>
                    <Link
                      href="/login/merchant"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Merchant
                    </Link>
                    <Link
                      href="/login/delivery-partner"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Delivery Partner
                    </Link>
                  </div>
                )}
              </div>

              {/* ADMIN PORTAL — UNCHANGED */}
              <Link
                href="/admin/login"
                className="text-xs text-gray-500 hover:text-gray-700 underline w-full sm:w-auto text-center"
              >
                Admin Portal
              </Link>
            </div>
          </div>

          {/* ================= RIGHT — HERO IMAGE ================= */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md lg:max-w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-white/50">
              <Image
                src="/images/home/hero.png"
                alt="The Mallyard — connected commerce"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}