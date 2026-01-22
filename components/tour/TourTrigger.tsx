"use client";

import { useTour } from "./TourProvider";

export function TourTrigger() {
  const { start, isActive } = useTour();

  if (isActive) return null;

  return (
    <button
      onClick={start}
      className="fixed bottom-4 right-4 z-40 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-[#E8DFD6] shadow-md flex items-center justify-center text-primary hover:bg-white hover:shadow-lg transition-all"
      aria-label="Help tour"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <path d="M12 17h.01" />
      </svg>
    </button>
  );
}
