"use client";

import { useEffect, useRef, useState } from "react";

interface Category {
  id: number;
  name: string;
  description?: string;
}

interface Props {
  categories: Category[];
  onChange: (value: number | null) => void;
}

export default function CategoryFilter({ categories, onChange }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (id: number | null) => {
    setSelectedId(id);
    onChange(id);
    setShowDropdown(false);
  };

  const selectedCategory = selectedId
    ? categories.find((c) => c.id === selectedId)
    : null;

  // Auto-scroll horizontal on mobile for description
  useEffect(() => {
    if (scrollRef.current && selectedCategory?.description) {
      const scrollWidth = scrollRef.current.scrollWidth;
      const clientWidth = scrollRef.current.clientWidth;
      if (scrollWidth > clientWidth) {
        let scrollAmount = 0;
        const step = () => {
          if (!scrollRef.current) return;
          scrollAmount += 1;
          scrollRef.current.scrollLeft = scrollAmount;
          if (scrollAmount < scrollWidth - clientWidth) {
            requestAnimationFrame(step);
          } else {
            // Reset and loop
            setTimeout(() => {
              if (scrollRef.current) {
                scrollRef.current.scrollLeft = 0;
                requestAnimationFrame(step);
              }
            }, 2000);
          }
        };
        requestAnimationFrame(step);
      }
    }
  }, [selectedCategory]);

  return (
    <div className="space-y-4" ref={dropdownRef}>
      {/* 🔥 PREMIUM SELECTOR BUTTON */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="
            w-full sm:w-auto
            group
            flex items-center justify-between gap-3
            px-5 py-3
            bg-white
            border-2
            rounded-2xl
            transition-all duration-300
            shadow-sm hover:shadow-md
            focus:outline-none focus:ring-2 focus:ring-emerald-500/30
          "
          style={{
            borderColor: selectedId ? "#D4AF37" : "#e5e7eb",
          }}
        >
          <span className="flex items-center gap-2">
            {selectedId ? (
              <>
                <span className="text-base sm:text-lg">✨</span>
                <span className="font-medium text-gray-800 text-sm sm:text-base">
                  {selectedCategory?.name || "Category"}
                </span>
              </>
            ) : (
              <>
                <span className="text-base sm:text-lg">📂</span>
                <span className="font-medium text-gray-500 text-sm sm:text-base">
                  All Categories
                </span>
              </>
            )}
          </span>

          <svg
            className={`w-4 h-4 transition-transform duration-300 ${
              showDropdown ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: selectedId ? "#D4AF37" : "#9ca3af" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* 🔥 DROPDOWN MENU - PREMIUM */}
        {showDropdown && (
          <div
            className="
              absolute top-full left-0 right-0 mt-2
              bg-white
              border border-gray-100
              rounded-2xl
              shadow-xl
              z-50
              overflow-hidden
              animate-in fade-in slide-in-from-top-2 duration-200
            "
          >
            {/* All Categories Option */}
            <button
              onClick={() => handleSelect(null)}
              className={`
                w-full text-left px-5 py-3
                flex items-center justify-between
                transition-all duration-200
                hover:bg-gradient-to-r hover:from-emerald-50 hover:to-transparent
                border-b border-gray-50
                ${!selectedId ? "bg-gradient-to-r from-emerald-50 to-transparent" : ""}
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">📂</span>
                <div>
                  <p className="font-medium text-gray-800">All Categories</p>
                  <p className="text-xs text-gray-400">Browse everything</p>
                </div>
              </div>
              {!selectedId && (
                <span
                  className="text-xs font-semibold px-2 py-1 rounded-full"
                  style={{ backgroundColor: "#D4AF37", color: "#1a1a1a" }}
                >
                  Active
                </span>
              )}
            </button>

            {/* Category Options */}
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleSelect(cat.id)}
                className={`
                  w-full text-left px-5 py-3
                  flex items-center justify-between
                  transition-all duration-200
                  hover:bg-gradient-to-r hover:from-emerald-50 hover:to-transparent
                  border-b border-gray-50 last:border-0
                  ${selectedId === cat.id ? "bg-gradient-to-r from-emerald-50 to-transparent" : ""}
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">✨</span>
                  <div>
                    <p className="font-medium text-gray-800">{cat.name}</p>
                    {cat.description && (
                      <p className="text-xs text-gray-400 line-clamp-1">
                        {cat.description}
                      </p>
                    )}
                  </div>
                </div>
                {selectedId === cat.id && (
                  <span
                    className="text-xs font-semibold px-2 py-1 rounded-full"
                    style={{ backgroundColor: "#D4AF37", color: "#1a1a1a" }}
                  >
                    Active
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 🔥 SELECTED CATEGORY BANNER (When a category is selected) */}
      {selectedCategory && (
        <div
          className="
            relative overflow-hidden
            bg-gradient-to-r from-emerald-50 via-white to-emerald-50
            border-l-4 rounded-xl
            p-4
            shadow-sm
            animate-in slide-in-from-top-1 duration-300
          "
          style={{ borderLeftColor: "#D4AF37" }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                {selectedCategory.name}
              </h3>
              {selectedCategory.description && (
                <div
                  ref={scrollRef}
                  className="
                    overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300
                    mt-1
                  "
                  style={{
                    scrollbarWidth: "thin",
                    msOverflowStyle: "none",
                  }}
                >
                  <p className="text-xs text-gray-500 whitespace-nowrap inline-block">
                    {selectedCategory.description}
                    <span className="inline-block w-8" />
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => handleSelect(null)}
              className="
                text-xs px-3 py-1.5 rounded-full
                transition-all duration-200
                hover:scale-105
              "
              style={{
                backgroundColor: "#D4AF37",
                color: "#1a1a1a",
              }}
            >
              Clear Filter
            </button>
          </div>

          {/* 🔥 DECORATIVE GOLD LINE */}
          <div
            className="absolute bottom-0 left-0 h-0.5"
            style={{
              width: "30%",
              background: "linear-gradient(90deg, #D4AF37, transparent)",
            }}
          />
        </div>
      )}
    </div>
  );
}