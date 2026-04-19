"use client";

import { useEffect, useMemo, useState } from "react";

const VARIANTS = [
  { label: "Syncing opportunities", className: "api-loader-orbit" },
  { label: "Tracking updates", className: "api-loader-wave" },
  { label: "Refreshing board", className: "api-loader-pulse-grid" },
  { label: "Finalizing request", className: "api-loader-chase" },
] as const;

const REQUEST_START = "opptracker:request-start";
const REQUEST_END = "opptracker:request-end";

function LoaderVisual({ variant }: { variant: typeof VARIANTS[number] }) {
  if (variant.className === "api-loader-pulse-grid") {
    return (
      <div className="api-loader-pulse-grid" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, index) => (
          <span key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className={variant.className} aria-hidden="true">
      {Array.from({ length: 4 }).map((_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}

export default function ApiActivityOverlay() {
  const [activeRequests, setActiveRequests] = useState(0);
  const [variantIndex, setVariantIndex] = useState(0);

  useEffect(() => {
    function handleStart() {
      setActiveRequests((count) => count + 1);
      setVariantIndex((index) => (index + 1) % VARIANTS.length);
    }

    function handleEnd() {
      setActiveRequests((count) => Math.max(0, count - 1));
    }

    window.addEventListener(REQUEST_START, handleStart);
    window.addEventListener(REQUEST_END, handleEnd);

    return () => {
      window.removeEventListener(REQUEST_START, handleStart);
      window.removeEventListener(REQUEST_END, handleEnd);
    };
  }, []);

  const activeVariant = useMemo(
    () => VARIANTS[variantIndex % VARIANTS.length],
    [variantIndex]
  );

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[90] flex items-center justify-center transition-all duration-200 ${
        activeRequests > 0 ? "opacity-100" : "opacity-0"
      } ${activeRequests > 0 ? "visible" : "invisible"}`}
      aria-hidden={activeRequests === 0}
    >
      <div className="absolute inset-0 bg-smoky13/18 backdrop-blur-[3px]" />
      <div className="relative flex min-w-[260px] flex-col items-center gap-4 rounded-[28px] bg-white/96 px-8 py-7 shadow-[0px_18px_60px_0px] shadow-smoky13/18">
        <LoaderVisual variant={activeVariant} />
        <div className="text-center">
          <p className="text-[15px] font-semibold text-smoky13">{activeVariant.label}</p>
          <p className="text-[13px] text-smoky7">Please wait while the API call completes.</p>
        </div>
      </div>
    </div>
  );
}
