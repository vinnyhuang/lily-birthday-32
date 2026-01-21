"use client";

import { FrameStyle } from "@/lib/canvas/types";
import { frames } from "@/lib/canvas/frames";

interface ElementOptionsPanelProps {
  type: "image" | "sticker" | "text";
  selectedCount: number;
  // Image-specific props
  currentFrame?: FrameStyle;
  onFrameSelect?: (frame: FrameStyle) => void;
}

export function ElementOptionsPanel({
  type,
  selectedCount,
  currentFrame,
  onFrameSelect,
}: ElementOptionsPanelProps) {
  if (type === "image") {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden w-[200px]">
        {/* Header */}
        <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">
            Photo Options{selectedCount > 1 ? ` (${selectedCount})` : ""}
          </span>
        </div>

        {/* Frame Style Section */}
        <div className="p-3">
          <div className="text-xs font-medium text-gray-500 mb-2">Frame Style</div>
          <div className="grid grid-cols-2 gap-2">
            {frames.map((frame) => (
              <button
                key={frame.id}
                onClick={() => onFrameSelect?.(frame.id)}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all ${
                  currentFrame === frame.id
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600"
                }`}
              >
                <FramePreview frameId={frame.id} isSelected={currentFrame === frame.id} />
                <span className="text-xs">{frame.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Placeholder for other element types (sticker, text)
  return null;
}

function FramePreview({ frameId, isSelected }: { frameId: FrameStyle; isSelected: boolean }) {
  const size = 36;
  const strokeWidth = 1.5;
  const strokeColor = isSelected ? "currentColor" : "#6B7280";

  switch (frameId) {
    case "none":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <line x1="8" y1="8" x2="16" y2="8" strokeOpacity="0.3" />
          <line x1="8" y1="12" x2="14" y2="12" strokeOpacity="0.3" />
        </svg>
      );
    case "polaroid":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}>
          <rect x="4" y="2" width="16" height="20" rx="1" fill={isSelected ? "rgba(249,112,102,0.1)" : "#F9FAFB"} />
          <rect x="6" y="4" width="12" height="10" fill={isSelected ? "rgba(249,112,102,0.2)" : "#E5E7EB"} />
          <line x1="8" y1="17" x2="16" y2="17" strokeOpacity="0.5" />
        </svg>
      );
    case "torn":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}>
          <path
            d="M4 5 L6 4 L8 5 L10 4 L12 5 L14 4 L16 5 L18 4 L20 5 L20 19 L18 20 L16 19 L14 20 L12 19 L10 20 L8 19 L6 20 L4 19 Z"
            fill={isSelected ? "rgba(249,112,102,0.1)" : "#F9FAFB"}
          />
        </svg>
      );
    case "taped":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}>
          <rect x="5" y="5" width="14" height="14" rx="1" fill={isSelected ? "rgba(249,112,102,0.1)" : "#F9FAFB"} />
          <path d="M2 2 L8 8" strokeWidth={2.5} stroke={isSelected ? "#F5B8C4" : "#D1D5DB"} />
          <path d="M22 2 L16 8" strokeWidth={2.5} stroke={isSelected ? "#9DC88D" : "#D1D5DB"} />
        </svg>
      );
    case "circle":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}>
          <circle cx="12" cy="12" r="9" fill={isSelected ? "rgba(249,112,102,0.1)" : "#F9FAFB"} />
        </svg>
      );
    case "rounded":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}>
          <rect x="4" y="4" width="16" height="16" rx="6" fill={isSelected ? "rgba(249,112,102,0.1)" : "#F9FAFB"} />
        </svg>
      );
    default:
      return null;
  }
}
