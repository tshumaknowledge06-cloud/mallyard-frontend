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
  const animationFrameRef = useRef<number | null>(null);

  // ✅ MOVED UP - Define selectedCategory BEFORE the useEffect that uses it
  const selectedCategory = selectedId
    ? categories.find((c) => c.id === selectedId)
    : null;

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

  // Infinite scrolling description
  useEffect(() => {
    const element = scrollRef.current;
    const description = selectedCategory?.description;

    if (!element || !description) return;

    const contentWidth = element.scrollWidth;
    const containerWidth = element.clientWidth;

    if (contentWidth > containerWidth) {
      // Clone content for infinite loop
      const originalContent = element.innerHTML;
      element.innerHTML = originalContent + originalContent;

      let scrollAmount = 0;
      const step = () => {
        if (!element) return;
        scrollAmount += 1;
        element.scrollLeft = scrollAmount;
        if (scrollAmount >= contentWidth) {
          scrollAmount = 0;
          element.scrollLeft = 0;
        }
        animationFrameRef.current = requestAnimationFrame(step);
      };
      animationFrameRef.current = requestAnimationFrame(step);
    }

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      // Restore original content on cleanup
      if (element && description) {
        element.innerHTML = description;
      }
    };
  }, [selectedCategory]);

  const handleSelect = (id: number | null) => {
    setSelectedId(id);
    onChange(id); // ✅ Pass the category ID to parent for filtering
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 🔥 PREMIUM SELECTOR BUTTON */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="
          flex items-center justify-between gap-2
          px-4 py-2
          bg-white
          border-2
          rounded-xl
          transition-all duration-300
          shadow-sm hover:shadow-md
          focus:outline-none focus:ring-2 focus:ring-emerald-500/30
          text-sm
        "
        style={{
          borderColor: selectedId ? "#D4AF37" : "#e5e7eb",
          minWidth: "160px",
        }}
      >
        <span className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: selectedId ? "#D4AF37" : "#9ca3af" }}
          />
          <span className="font-medium text-gray-700">
            {selectedCategory?.name || "All Categories"}
          </span>
        </span>

        <svg
          className={`w-3.5 h-3.5 transition-transform duration-300 ${
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

      {/* 🔥 DROPDOWN MENU - FIXED POSITION, NO PAGE DISTORTION */}
      {showDropdown && (
        <div
          className="
            absolute top-full left-0 mt-2
            bg-white
            border border-gray-100
            rounded-xl
            shadow-xl
            z-50
            overflow-hidden
            animate-in fade-in slide-in-from-top-2 duration-200
          "
          style={{
            minWidth: "200px",
            maxWidth: "280px",
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          {/* All Categories Option */}
          <button
            onClick={() => handleSelect(null)}
            className={`
              w-full text-left px-4 py-2.5
              flex items-center gap-2
              transition-all duration-200
              hover:bg-gradient-to-r hover:from-emerald-50 hover:to-transparent
              border-b border-gray-50
              text-sm
              ${!selectedId ? "bg-gradient-to-r from-emerald-50 to-transparent" : ""}
            `}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: !selectedId ? "#D4AF37" : "#d1d5db" }}
            />
            <span className="font-medium text-gray-700">All Categories</span>
          </button>

          {/* Category Options */}
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleSelect(cat.id)}
              className={`
                w-full text-left px-4 py-2.5
                flex flex-col gap-0.5
                transition-all duration-200
                hover:bg-gradient-to-r hover:from-emerald-50 hover:to-transparent
                border-b border-gray-50 last:border-0
                ${selectedId === cat.id ? "bg-gradient-to-r from-emerald-50 to-transparent" : ""}
              `}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: selectedId === cat.id ? "#D4AF37" : "#d1d5db" }}
                />
                <span className="font-medium text-gray-800 text-sm">
                  {cat.name}
                </span>
              </div>
              {cat.description && (
                <p className="text-[11px] text-gray-400 line-clamp-1 pl-3.5">
                  {cat.description}
                </p>
              )}
            </button>
          ))}
        </div>
      )}

      {/* 🔥 SELECTED CATEGORY BANNER - COMPACT */}
      {selectedCategory && selectedCategory.description && (
        <div
          className="
            mt-3
            overflow-hidden
            bg-gradient-to-r from-emerald-50/50 via-white to-emerald-50/50
            border-l-3 rounded-lg
            py-1.5 px-3
          "
          style={{ borderLeftColor: "#D4AF37", borderLeftWidth: "3px" }}
        >
          <div
            ref={scrollRef}
            className="
              overflow-x-hidden whitespace-nowrap
              text-xs text-gray-500
              cursor-default
            "
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {selectedCategory.description}
          </div>
        </div>
      )}
    </div>
  );
}