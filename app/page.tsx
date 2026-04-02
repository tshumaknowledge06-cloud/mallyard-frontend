"use client";

import Link from "next/link";
import { useState } from "react";

export default function HomePage() {

  const [registerOpen, setRegisterOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <section className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-emerald-50 relative overflow-hidden">

  {/* BACKGROUND */}
  <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 via-white to-emerald-50 opacity-80" />

  <div className="relative max-w-5xl w-full px-4 sm:px-6 py-12 sm:py-20">

    {/* GLASS CARD */}
    <div className="
      backdrop-blur-xl
      bg-white/30
      border border-white/40
      shadow-xl
      rounded-3xl
      p-6 sm:p-8 md:p-12
    ">

      <div className="w-full max-w-2xl mx-auto text-center md:text-left">

        {/* TAGLINE */}
        <p className="text-xs uppercase tracking-widest text-yellow-500 font-semibold mb-3">
          Trust-first African Marketplace
        </p>

        {/* HEADLINE */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-emerald-900 leading-tight mb-4">
          Find. Compare. Connect.
        </h1>

        {/* SUBTEXT */}
        <p className="text-sm sm:text-base text-gray-700 mb-8 leading-relaxed">
          The Mallyard connects you to verified sellers, quality products,
          and reliable services — all in one trusted marketplace built for growth
          and seamless discovery.
        </p>

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-center justify-center md:justify-start">

          {/* REGISTER */}
          <div className="relative w-full sm:w-auto">
            <button
              onClick={() => {
                setRegisterOpen(!registerOpen);
                setLoginOpen(false);
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-700 text-white rounded-full shadow hover:bg-emerald-800 transition text-sm font-medium"
            >
              Get Started
            </button>

            {registerOpen && (
              <div className="absolute left-0 sm:left-auto mt-2 w-full sm:w-52 bg-white border rounded-xl shadow-lg overflow-hidden z-50">
                <Link href="/register/customer" className="block px-4 py-2 hover:bg-gray-100">
                  Customer
                </Link>
                <Link href="/register/merchant" className="block px-4 py-2 hover:bg-gray-100">
                  Merchant
                </Link>
                <Link href="/register/delivery-partner" className="block px-4 py-2 hover:bg-gray-100">
                  Delivery Partner
                </Link>
              </div>
            )}
          </div>

          {/* LOGIN */}
          <div className="relative w-full sm:w-auto">
            <button
              onClick={() => {
                setLoginOpen(!loginOpen);
                setRegisterOpen(false);
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-white/80 border border-emerald-700 text-emerald-800 rounded-full hover:bg-white transition text-sm font-medium"
            >
              Login
            </button>

            {loginOpen && (
              <div className="absolute left-0 sm:left-auto mt-2 w-full sm:w-52 bg-white border rounded-xl shadow-lg overflow-hidden z-50">
                <Link href="/login/customer" className="block px-4 py-2 hover:bg-gray-100">
                  Customer
                </Link>
                <Link href="/login/merchant" className="block px-4 py-2 hover:bg-gray-100">
                  Merchant
                </Link>
                <Link href="/login/delivery-partner" className="block px-4 py-2 hover:bg-gray-100">
                  Delivery Partner
                </Link>
              </div>
            )}
          </div>

          {/* EXPLORE */}
          <Link
            href="/marketplace"
            className="w-full sm:w-auto text-center px-5 py-2.5 border border-emerald-700 text-emerald-800 rounded-full hover:bg-emerald-100 transition text-sm font-medium"
          >
            Explore The Yard
          </Link>

          {/* ADMIN */}
          <Link
            href="/admin/login"
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Admin Portal
          </Link>

        </div>

      </div>

    </div>

  </div>

</section>
  );
}