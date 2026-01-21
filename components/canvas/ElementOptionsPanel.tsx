"use client";

import { useState } from "react";
import { FrameStyle, FilterType } from "@/lib/canvas/types";
import { frames, borderColorOptions } from "@/lib/canvas/frames";
import { filters } from "@/lib/canvas/filters";

interface ElementOptionsPanelProps {
  type: "image" | "sticker" | "text";
  selectedCount: number;
  // Image-specific props
  currentFrame?: FrameStyle;
  currentBorderColor?: string;
  currentFilter?: FilterType;
  currentFilterIntensity?: number;
  onFrameSelect?: (frame: FrameStyle) => void;
  onBorderColorSelect?: (color: string) => void;
  onFilterSelect?: (filter: FilterType) => void;
  onFilterIntensityChange?: (intensity: number) => void;
}

type TabType = "frames" | "filters";

export function ElementOptionsPanel({
  type,
  selectedCount,
  currentFrame,
  currentBorderColor,
  currentFilter = "none",
  currentFilterIntensity = 100,
  onFrameSelect,
  onBorderColorSelect,
  onFilterSelect,
  onFilterIntensityChange,
}: ElementOptionsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("frames");
  const showColorPicker = currentFrame === "simple-border" || currentFrame === "rounded";

  if (type === "image") {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden w-[240px]">
        {/* Header with tabs */}
        <div className="border-b border-gray-100">
          <div className="px-3 py-2 bg-gray-50">
            <span className="text-sm font-medium text-gray-700">
              Photo Options{selectedCount > 1 ? ` (${selectedCount})` : ""}
            </span>
          </div>
          <div className="flex">
            <button
              onClick={() => setActiveTab("frames")}
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === "frames"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Frames
            </button>
            <button
              onClick={() => setActiveTab("filters")}
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === "filters"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Filters
            </button>
          </div>
        </div>

        {/* Frames Tab */}
        {activeTab === "frames" && (
          <>
            {/* Frame Style Section */}
            <div className="p-3">
              <div className="text-xs font-medium text-gray-500 mb-2">Frame Style</div>
              <div className="grid grid-cols-3 gap-1.5">
                {frames.map((frame) => (
                  <button
                    key={frame.id}
                    onClick={() => onFrameSelect?.(frame.id)}
                    className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all ${
                      currentFrame === frame.id
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600"
                    }`}
                    title={frame.description}
                  >
                    <FramePreview frameId={frame.id} isSelected={currentFrame === frame.id} />
                    <span className="text-[10px] leading-tight text-center">{frame.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Border Color Section - only for simple-border and rounded */}
            {showColorPicker && (
              <div className="px-3 pb-3">
                <div className="text-xs font-medium text-gray-500 mb-2">Border Color</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {borderColorOptions.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => onBorderColorSelect?.(color.value)}
                      className={`w-full aspect-square rounded-lg border-2 transition-all ${
                        currentBorderColor === color.value
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Filters Tab */}
        {activeTab === "filters" && (
          <div className="p-3 space-y-3">
            {/* Filter Type Selection */}
            <div>
              <div className="text-xs font-medium text-gray-500 mb-2">Filter</div>
              <div className="grid grid-cols-4 gap-1.5">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => onFilterSelect?.(filter.id)}
                    className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all ${
                      currentFilter === filter.id
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600"
                    }`}
                    title={filter.description}
                  >
                    <FilterPreview filterId={filter.id} isSelected={currentFilter === filter.id} />
                    <span className="text-[9px] leading-tight text-center">{filter.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Intensity Slider - only show when a filter is selected */}
            {currentFilter !== "none" && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-gray-500">Intensity</span>
                  <span className="text-xs text-gray-400">{currentFilterIntensity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentFilterIntensity}
                  onChange={(e) => onFilterIntensityChange?.(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Placeholder for other element types (sticker, text)
  return null;
}

function FramePreview({ frameId, isSelected }: { frameId: FrameStyle; isSelected: boolean }) {
  const size = 32;
  const strokeWidth = 1.5;
  const strokeColor = isSelected ? "currentColor" : "#6B7280";
  const fillColor = isSelected ? "rgba(249,112,102,0.1)" : "#F9FAFB";
  const accentFill = isSelected ? "rgba(249,112,102,0.2)" : "#E5E7EB";

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
          <rect x="4" y="2" width="16" height="20" rx="1" fill={fillColor} />
          <rect x="6" y="4" width="12" height="10" fill={accentFill} />
          <line x1="8" y1="17" x2="16" y2="17" strokeOpacity="0.5" />
        </svg>
      );
    case "torn":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}>
          <path
            d="M4 5 L6 4 L8 5 L10 4 L12 5 L14 4 L16 5 L18 4 L20 5 L20 19 L18 20 L16 19 L14 20 L12 19 L10 20 L8 19 L6 20 L4 19 Z"
            fill={fillColor}
          />
        </svg>
      );
    case "taped":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}>
          <rect x="5" y="5" width="14" height="14" rx="1" fill={fillColor} />
          <path d="M2 2 L8 8" strokeWidth={2.5} stroke={isSelected ? "#F5B8C4" : "#D1D5DB"} />
          <path d="M22 2 L16 8" strokeWidth={2.5} stroke={isSelected ? "#9DC88D" : "#D1D5DB"} />
          <path d="M2 22 L8 16" strokeWidth={2.5} stroke={isSelected ? "#A8D4E6" : "#D1D5DB"} />
          <path d="M22 22 L16 16" strokeWidth={2.5} stroke={isSelected ? "#F5D89A" : "#D1D5DB"} />
        </svg>
      );
    case "circle":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}>
          <circle cx="12" cy="12" r="9" fill={fillColor} />
        </svg>
      );
    case "heart":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}>
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill={fillColor}
          />
        </svg>
      );
    case "rounded":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}>
          <rect x="3" y="3" width="18" height="18" rx="2" fill={fillColor} />
          <rect x="5" y="5" width="14" height="14" rx="5" fill={accentFill} />
        </svg>
      );
    case "simple-border":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}>
          <rect x="3" y="3" width="18" height="18" fill={fillColor} />
          <rect x="5" y="5" width="14" height="14" fill={accentFill} />
        </svg>
      );
    case "scalloped":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}>
          <path
            d="M4 6 Q6 4 8 6 Q10 4 12 6 Q14 4 16 6 Q18 4 20 6 L20 18 Q18 20 16 18 Q14 20 12 18 Q10 20 8 18 Q6 20 4 18 Z"
            fill={fillColor}
          />
        </svg>
      );
    case "floral":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}>
          <rect x="5" y="5" width="14" height="14" rx="1" fill={fillColor} />
          <circle cx="5" cy="5" r="2.5" fill={isSelected ? "#F5B8C4" : "#E5E7EB"} />
          <circle cx="19" cy="5" r="2" fill={isSelected ? "#DDA0DD" : "#E5E7EB"} />
          <circle cx="5" cy="19" r="2" fill={isSelected ? "#87CEEB" : "#E5E7EB"} />
          <circle cx="19" cy="19" r="2.5" fill={isSelected ? "#FFDAB9" : "#E5E7EB"} />
          <ellipse cx="3" cy="12" rx="1.5" ry="3" fill={isSelected ? "#9DC88D" : "#D1D5DB"} />
          <ellipse cx="21" cy="12" rx="1.5" ry="3" fill={isSelected ? "#9DC88D" : "#D1D5DB"} />
        </svg>
      );
    case "celebration":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}>
          <rect x="5" y="5" width="14" height="14" rx="1" fill={fillColor} />
          <ellipse cx="5" cy="6" rx="2.5" ry="3" fill={isSelected ? "#FF6B6B" : "#E5E7EB"} />
          <ellipse cx="8" cy="4" rx="2" ry="2.5" fill={isSelected ? "#4ECDC4" : "#E5E7EB"} />
          <ellipse cx="19" cy="5" rx="2" ry="2.5" fill={isSelected ? "#AA96DA" : "#E5E7EB"} />
          <ellipse cx="16" cy="7" rx="1.5" ry="2" fill={isSelected ? "#FCBAD3" : "#E5E7EB"} />
          <polygon points="20,19 21,21 19,20 17,21 18,19 17,17 19,18 21,17" fill={isSelected ? "#FFE66D" : "#D1D5DB"} />
          <rect x="2" y="20" width="4" height="1.5" rx="0.5" fill={isSelected ? "#FF6B6B" : "#D1D5DB"} transform="rotate(-15 4 20)" />
          <rect x="18" y="21" width="4" height="1.5" rx="0.5" fill={isSelected ? "#4ECDC4" : "#D1D5DB"} transform="rotate(15 20 21)" />
        </svg>
      );
    default:
      return null;
  }
}

function FilterPreview({ filterId, isSelected }: { filterId: FilterType; isSelected: boolean }) {
  const size = 28;
  const bgColor = isSelected ? "rgba(249,112,102,0.15)" : "#F3F4F6";
  const borderColor = isSelected ? "currentColor" : "#D1D5DB";

  // Different visual representations for each filter
  switch (filterId) {
    case "none":
      return (
        <div
          className="rounded overflow-hidden"
          style={{ width: size, height: size, backgroundColor: bgColor, border: `1px solid ${borderColor}` }}
        >
          <div className="w-full h-full bg-gradient-to-br from-blue-300 via-green-200 to-yellow-200" />
        </div>
      );
    case "grayscale":
      return (
        <div
          className="rounded overflow-hidden"
          style={{ width: size, height: size, backgroundColor: bgColor, border: `1px solid ${borderColor}` }}
        >
          <div className="w-full h-full bg-gradient-to-br from-gray-700 via-gray-400 to-gray-200" />
        </div>
      );
    case "sepia":
      return (
        <div
          className="rounded overflow-hidden"
          style={{ width: size, height: size, backgroundColor: bgColor, border: `1px solid ${borderColor}` }}
        >
          <div className="w-full h-full bg-gradient-to-br from-amber-700 via-amber-500 to-amber-200" />
        </div>
      );
    case "warm":
      return (
        <div
          className="rounded overflow-hidden"
          style={{ width: size, height: size, backgroundColor: bgColor, border: `1px solid ${borderColor}` }}
        >
          <div className="w-full h-full bg-gradient-to-br from-orange-400 via-yellow-300 to-orange-200" />
        </div>
      );
    case "cool":
      return (
        <div
          className="rounded overflow-hidden"
          style={{ width: size, height: size, backgroundColor: bgColor, border: `1px solid ${borderColor}` }}
        >
          <div className="w-full h-full bg-gradient-to-br from-blue-600 via-blue-400 to-blue-200" />
        </div>
      );
    case "faded":
      return (
        <div
          className="rounded overflow-hidden"
          style={{ width: size, height: size, backgroundColor: bgColor, border: `1px solid ${borderColor}` }}
        >
          <div className="w-full h-full bg-gradient-to-br from-gray-400 via-slate-300 to-gray-200 opacity-70" />
        </div>
      );
    case "contrast":
      return (
        <div
          className="rounded overflow-hidden"
          style={{ width: size, height: size, backgroundColor: bgColor, border: `1px solid ${borderColor}` }}
        >
          <div className="w-full h-full bg-gradient-to-br from-black via-gray-500 to-white" />
        </div>
      );
    case "soft":
      return (
        <div
          className="rounded overflow-hidden"
          style={{ width: size, height: size, backgroundColor: bgColor, border: `1px solid ${borderColor}` }}
        >
          <div className="w-full h-full bg-gradient-to-br from-pink-200 via-purple-100 to-blue-100 opacity-80" />
        </div>
      );
    default:
      return null;
  }
}
