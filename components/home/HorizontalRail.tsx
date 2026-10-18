"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

interface HorizontalRailProps {
  children: React.ReactNode;
  /** Optional slow auto-scroll speed in px per second */
  autoScrollSpeed?: number;
  /** Whether to enable slow auto-scroll */
  autoScroll?: boolean;
  className?: string;
}

export default function HorizontalRail({
  children,
  autoScrollSpeed = 20,
  autoScroll = false,
  className = "",
}: HorizontalRailProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const directionRef = useRef<1 | -1>(1);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  /* ================= ARROW VISIBILITY ================= */

  const updateArrows = useCallback(() => {
    const el = railRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(
      el.scrollLeft + el.clientWidth < el.scrollWidth - 4
    );
  }, []);

  useEffect(() => {
    updateArrows();
    const el = railRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);

    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows]);

  /* ================= MANUAL SCROLL ================= */

  function scrollByAmount(dir: "left" | "right") {
    const el = railRef.current;
    if (!el) return;

    el.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth",
    });
  }

  /* ================= AUTO-SCROLL ================= */

  useEffect(() => {
    if (!autoScroll) return;
    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    function step(time: number) {
      const el = railRef.current;
      if (!el) return;

      if (lastTimeRef.current === null) {
        lastTimeRef.current = time;
      }

      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (!isPaused && !isInteracting) {
        const maxScroll =
          el.scrollWidth - el.clientWidth;

        if (maxScroll > 0) {
          el.scrollLeft +=
            directionRef.current *
            autoScrollSpeed *
            delta;

          if (el.scrollLeft >= maxScroll - 1) {
            directionRef.current = -1;
          } else if (el.scrollLeft <= 1) {
            directionRef.current = 1;
          }
        }
      }

      animationRef.current =
        requestAnimationFrame(step);
    }

    animationRef.current = requestAnimationFrame(step);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      lastTimeRef.current = null;
    };
  }, [autoScroll, autoScrollSpeed, isPaused, isInteracting]);

  /* ================= PAUSE HANDLERS ================= */

  function pause() {
    setIsPaused(true);
  }

  function resume() {
    setIsPaused(false);
  }

  function handleInteractionStart() {
    setIsInteracting(true);
  }

  function handleInteractionEnd() {
    setIsInteracting(false);
  }

  return (
    <div
      className={`relative group ${className}`}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocusCapture={pause}
      onBlurCapture={resume}
    >
      {/* LEFT ARROW */}

      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByAmount("left")}
          aria-label="Scroll left"
          className="
            hidden md:flex
            absolute left-2 top-1/2 -translate-y-1/2 z-10
            bg-white shadow-lg rounded-full
            w-10 h-10 items-center justify-center
            opacity-0 group-hover:opacity-100
            transition-opacity duration-200
          "
        >
          ‹
        </button>
      )}

      {/* RAIL */}

      <div
        ref={railRef}
        className="flex gap-5 overflow-x-auto scroll-smooth no-scrollbar"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        onTouchStart={handleInteractionStart}
        onTouchEnd={handleInteractionEnd}
        onMouseDown={handleInteractionStart}
        onMouseUp={handleInteractionEnd}
      >
        {children}
      </div>

      {/* RIGHT ARROW */}

      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByAmount("right")}
          aria-label="Scroll right"
          className="
            hidden md:flex
            absolute right-2 top-1/2 -translate-y-1/2 z-10
            bg-white shadow-lg rounded-full
            w-10 h-10 items-center justify-center
            opacity-0 group-hover:opacity-100
            transition-opacity duration-200
          "
        >
          ›
        </button>
      )}
    </div>
  );
}