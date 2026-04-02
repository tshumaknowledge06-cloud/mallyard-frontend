"use client";

import Link from "next/link";
import { Instagram, Facebook, Linkedin, Twitter, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-emerald-900 text-gray-300 mt-20 border-t border-emerald-800">

      {/* MAIN FOOTER */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-5 gap-10 text-sm">

        {/* BRAND STORY */}
        <div className="md:col-span-2">
          <h3 className="text-white font-semibold mb-3 text-base">
            The Mallyard
          </h3>
          <p className="text-gray-400 leading-relaxed">
            The Mallyard is a trust-first African marketplace built to connect
            people with quality products, reliable services, and verified sellers.
            Find, Compare, and Connect — all in one place.
          </p>
        </div>

        {/* CONTACT */}
        <div>
          <h3 className="text-white font-semibold mb-3 text-base">
            Contact Us
          </h3>
          <ul className="space-y-2 text-gray-400">
            <li>Bulawayo, Zimbabwe</li>
            <li>+263 777 469 206</li>
            <li>themallyard09@gmail.com</li>
          </ul>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h3 className="text-white font-semibold mb-3 text-base">
            Quick Links
          </h3>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="hover:text-white transition">
                Home
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-white transition">
                About
              </Link>
            </li>
            <li>
              <Link href="/marketplace" className="hover:text-white transition">
                Marketplace
              </Link>
            </li>
          </ul>
        </div>

        {/* SOCIAL + NEWSLETTER */}
        <div>
          <h3 className="text-white font-semibold mb-3 text-base">
            Connect With Us
          </h3>

          {/* SOCIAL LINKS */}
          <ul className="space-y-3 mb-6">

            <li>
              <a
                href="https://instagram.com/themallyard"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition"
              >
                <Instagram size={16} />
                <span>@themallyard</span>
              </a>
            </li>

            <li>
              <a
                href="https://facebook.com/themallyard"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition"
              >
                <Facebook size={16} />
                <span>@themallyard</span>
              </a>
            </li>

            <li>
              <a
                href="https://x.com/themallyard"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition"
              >
                <Twitter size={16} />
                <span>@themallyard</span>
              </a>
            </li>

            <li>
              <a
                href="https://linkedin.com/company/themallyard"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition"
              >
                <Linkedin size={16} />
                <span>@themallyard</span>
              </a>
            </li>

            <li>
              <a
                href="https://wa.me/263777469206"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition"
              >
                <MessageCircle size={16} />
                <span>@themallyard</span>
              </a>
            </li>

          </ul>

        </div>

      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-emerald-800">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">

          <p className="text-center md:text-left">
            © {new Date().getFullYear()} The Mallyard. All rights reserved.
          </p>

          <p className="text-center">
            A trust-first African marketplace.
          </p>

          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-white transition">
              Terms of Service
            </Link>

            <span className="text-gray-600">|</span>

            <Link href="/privacy" className="hover:text-white transition">
              Privacy Policy
            </Link>
          </div>

        </div>
      </div>

    </footer>
  );
}