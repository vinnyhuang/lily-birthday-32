"use client";

import { useState } from "react";
import { FrameStyle, FilterType, ContainerShape } from "@/lib/canvas/types";
import { frames, borderColorOptions } from "@/lib/canvas/frames";
import { filters } from "@/lib/canvas/filters";
import { ColorPicker } from "./ColorPicker";
import { FontPicker } from "./FontPicker";

// Container shape definitions for the picker
const containerShapes: { id: ContainerShape; label: string; icon: React.ReactNode }[] = [
  {
    id: "rectangle",
    label: "Rectangle",
    icon: (
      <svg width="32" height="24" viewBox="0 0 32 24" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5">
        <rect x="4" y="4" width="24" height="16" rx="2" />
      </svg>
    ),
  },
  {
    id: "oval",
    label: "Oval",
    icon: (
      <svg width="32" height="24" viewBox="0 0 32 24" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5">
        <ellipse cx="16" cy="12" rx="12" ry="8" />
      </svg>
    ),
  },
  {
    id: "pill",
    label: "Pill",
    icon: (
      <svg width="32" height="24" viewBox="0 0 32 24" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5">
        <rect x="4" y="4" width="24" height="16" rx="8" />
      </svg>
    ),
  },
  {
    id: "heart",
    label: "Heart",
    icon: (
      <svg width="32" height="24" viewBox="0 0 32 24" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5">
        <path d="M16 21 C16 21 4 14 4 8.5 C4 5.5 6.5 3 9.5 3 C11.5 3 13.5 4 16 6 C18.5 4 20.5 3 22.5 3 C25.5 3 28 5.5 28 8.5 C28 14 16 21 16 21Z" />
      </svg>
    ),
  },
  {
    id: "star",
    label: "Star",
    icon: (
      <svg width="32" height="24" viewBox="0 0 32 24" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5">
        <path d="M16 2 L18.5 9 L26 9 L20 13.5 L22.5 21 L16 16.5 L9.5 21 L12 13.5 L6 9 L13.5 9 Z" />
      </svg>
    ),
  },
  {
    id: "scalloped",
    label: "Scalloped",
    icon: (
      <svg width="32" height="24" viewBox="0 0 32 24" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 8 Q7 4 10 8 Q13 4 16 8 Q19 4 22 8 Q25 4 28 8 L28 16 Q25 20 22 16 Q19 20 16 16 Q13 20 10 16 Q7 20 4 16 Z" />
      </svg>
    ),
  },
  {
    id: "starburst",
    label: "Starburst",
    icon: (
      <svg width="32" height="24" viewBox="0 0 32 24" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5">
        <path d="M16 2 L18 7 L24 4 L20 9 L28 12 L20 15 L24 20 L18 17 L16 22 L14 17 L8 20 L12 15 L4 12 L12 9 L8 4 L14 7 Z" />
      </svg>
    ),
  },
  {
    id: "cloud",
    label: "Cloud",
    icon: (
      <svg width="32" height="24" viewBox="0 0 32 24" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 18 Q4 18 4 14 Q4 10 8 10 Q8 6 14 6 Q18 6 20 8 Q22 6 26 8 Q28 10 28 14 Q28 18 24 18 Z" />
      </svg>
    ),
  },
  {
    id: "arrow",
    label: "Arrow",
    icon: (
      <svg width="32" height="24" viewBox="0 0 32 24" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 8 L20 8 L20 4 L28 12 L20 20 L20 16 L4 16 Z" />
      </svg>
    ),
  },
  {
    id: "banner-ribbon",
    label: "Ribbon",
    icon: (
      <svg width="32" height="24" viewBox="0 0 32 24" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 6 L4 4 L4 20 L4 18" />
        <path d="M28 6 L28 4 L28 20 L28 18" />
        <rect x="4" y="4" width="24" height="16" />
      </svg>
    ),
  },
  {
    id: "banner-flag",
    label: "Flag",
    icon: (
      <svg width="32" height="24" viewBox="0 0 32 24" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 4 L28 4 L28 16 L16 22 L4 16 Z" />
      </svg>
    ),
  },
  {
    id: "ticket-classic",
    label: "Ticket",
    icon: (
      <svg width="32" height="24" viewBox="0 0 32 24" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 4 L26 4 Q28 4 28 6 L28 9 Q26 9 26 12 Q26 15 28 15 L28 18 Q28 20 26 20 L6 20 Q4 20 4 18 L4 15 Q6 15 6 12 Q6 9 4 9 L4 6 Q4 4 6 4" />
      </svg>
    ),
  },
  {
    id: "label-tag",
    label: "Tag",
    icon: (
      <svg width="32" height="24" viewBox="0 0 32 24" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5">
        <path d="M10 4 L26 4 Q28 4 28 6 L28 18 Q28 20 26 20 L10 20 L4 12 Z" />
        <circle cx="10" cy="12" r="2" fill="white" />
      </svg>
    ),
  },
  {
    id: "bubble-speech",
    label: "Speech",
    icon: (
      <svg width="32" height="24" viewBox="0 0 32 24" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 4 L26 4 Q28 4 28 6 L28 14 Q28 16 26 16 L12 16 L6 22 L8 16 L6 16 Q4 16 4 14 L4 6 Q4 4 6 4" />
      </svg>
    ),
  },
  {
    id: "bubble-thought",
    label: "Thought",
    icon: (
      <svg width="32" height="24" viewBox="0 0 32 24" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5">
        <ellipse cx="16" cy="10" rx="12" ry="8" />
        <circle cx="8" cy="20" r="2" />
        <circle cx="5" cy="23" r="1" />
      </svg>
    ),
  },
];

interface ElementOptionsPanelProps {
  type: "image" | "video" | "sticker" | "text";
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
  // Text-specific props
  currentFontFamily?: string;
  currentFontSize?: number;
  currentFontWeight?: "normal" | "bold";
  currentFontStyle?: "normal" | "italic";
  currentTextDecoration?: "none" | "underline";
  currentFill?: string;
  currentBackgroundColor?: string;
  currentAlign?: "left" | "center" | "right";
  currentVerticalAlign?: "top" | "middle" | "bottom";
  currentBackgroundPadding?: number;
  currentBackgroundCornerRadius?: number;
  currentContainerShape?: ContainerShape;
  onFontFamilyChange?: (family: string) => void;
  onFontSizeChange?: (size: number) => void;
  onFontWeightChange?: (weight: "normal" | "bold") => void;
  onFontStyleChange?: (style: "normal" | "italic") => void;
  onTextDecorationChange?: (decoration: "none" | "underline") => void;
  onFillChange?: (color: string) => void;
  onBackgroundColorChange?: (color: string) => void;
  onAlignChange?: (align: "left" | "center" | "right") => void;
  onVerticalAlignChange?: (align: "top" | "middle" | "bottom") => void;
  onBackgroundPaddingChange?: (padding: number) => void;
  onBackgroundCornerRadiusChange?: (radius: number) => void;
  onContainerShapeChange?: (shape: ContainerShape) => void;
}

type ImageTabType = "frames" | "filters";
type TextTabType = "style" | "container";

export function ElementOptionsPanel({
  type,
  selectedCount,
  // Image props
  currentFrame,
  currentBorderColor,
  currentFilter = "none",
  currentFilterIntensity = 100,
  onFrameSelect,
  onBorderColorSelect,
  onFilterSelect,
  onFilterIntensityChange,
  // Text props
  currentFontFamily = "Caveat",
  currentFontSize = 24,
  currentFontWeight = "normal",
  currentFontStyle = "normal",
  currentTextDecoration = "none",
  currentFill = "#3D3D3D",
  currentBackgroundColor,
  currentAlign = "center",
  currentVerticalAlign = "top",
  currentBackgroundPadding = 0,
  currentBackgroundCornerRadius = 0,
  currentContainerShape = "rectangle",
  onFontFamilyChange,
  onFontSizeChange,
  onFontWeightChange,
  onFontStyleChange,
  onTextDecorationChange,
  onFillChange,
  onBackgroundColorChange,
  onAlignChange,
  onVerticalAlignChange,
  onBackgroundPaddingChange,
  onBackgroundCornerRadiusChange,
  onContainerShapeChange,
}: ElementOptionsPanelProps) {
  const [imageTab, setImageTab] = useState<ImageTabType>("frames");
  const [textTab, setTextTab] = useState<TextTabType>("style");
  const showColorPicker = currentFrame === "simple-border" || currentFrame === "rounded";

  // ============ IMAGE PANEL ============
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
              onClick={() => setImageTab("frames")}
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                imageTab === "frames"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Frames
            </button>
            <button
              onClick={() => setImageTab("filters")}
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                imageTab === "filters"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Filters
            </button>
          </div>
        </div>

        {/* Frames Tab */}
        {imageTab === "frames" && (
          <>
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
        {imageTab === "filters" && (
          <div className="p-3 space-y-3">
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

  // ============ VIDEO PANEL ============
  if (type === "video") {
    const showVideoColorPicker = currentFrame === "simple-border" || currentFrame === "rounded";
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden w-[240px]">
        {/* Header */}
        <div className="border-b border-gray-100">
          <div className="px-3 py-2 bg-gray-50">
            <span className="text-sm font-medium text-gray-700">
              Video Options{selectedCount > 1 ? ` (${selectedCount})` : ""}
            </span>
          </div>
        </div>

        {/* Frames */}
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

        {showVideoColorPicker && (
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
      </div>
    );
  }

  // ============ TEXT PANEL ============
  if (type === "text") {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden w-[240px]">
        {/* Header with tabs */}
        <div className="border-b border-gray-100">
          <div className="px-3 py-2 bg-gray-50">
            <span className="text-sm font-medium text-gray-700">
              Text Options{selectedCount > 1 ? ` (${selectedCount})` : ""}
            </span>
          </div>
          <div className="flex">
            <button
              onClick={() => setTextTab("style")}
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                textTab === "style"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Style
            </button>
            <button
              onClick={() => setTextTab("container")}
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                textTab === "container"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Container
            </button>
          </div>
        </div>

        {/* Style Tab */}
        {textTab === "style" && (
          <div className="p-3 space-y-4">
            {/* Font Family */}
            <FontPicker value={currentFontFamily} onChange={(f) => onFontFamilyChange?.(f)} />

            {/* Font Size & Style Toggles */}
            <div className="flex items-end gap-2">
              {/* Font Size */}
              <div className="flex-1">
                <div className="text-xs font-medium text-gray-500 mb-1.5">Size</div>
                <div className="flex items-center border border-gray-200 rounded-md">
                  <button
                    onClick={() => onFontSizeChange?.(Math.max(12, currentFontSize - 2))}
                    className="px-2 py-1 text-gray-500 hover:bg-gray-50"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="12"
                    max="120"
                    value={currentFontSize}
                    onChange={(e) => onFontSizeChange?.(parseInt(e.target.value) || 24)}
                    className="w-12 text-center text-sm border-x border-gray-200 py-1 focus:outline-none"
                  />
                  <button
                    onClick={() => onFontSizeChange?.(Math.min(120, currentFontSize + 2))}
                    className="px-2 py-1 text-gray-500 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Bold / Italic / Underline */}
              <div className="flex border border-gray-200 rounded-md overflow-hidden">
                <button
                  onClick={() => onFontWeightChange?.(currentFontWeight === "bold" ? "normal" : "bold")}
                  className={`px-2.5 py-1.5 text-sm font-bold transition-colors ${
                    currentFontWeight === "bold"
                      ? "bg-primary text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                  title="Bold"
                >
                  B
                </button>
                <button
                  onClick={() => onFontStyleChange?.(currentFontStyle === "italic" ? "normal" : "italic")}
                  className={`px-2.5 py-1.5 text-sm italic border-l border-gray-200 transition-colors ${
                    currentFontStyle === "italic"
                      ? "bg-primary text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                  title="Italic"
                >
                  I
                </button>
                <button
                  onClick={() => onTextDecorationChange?.(currentTextDecoration === "underline" ? "none" : "underline")}
                  className={`px-2.5 py-1.5 text-sm underline border-l border-gray-200 transition-colors ${
                    currentTextDecoration === "underline"
                      ? "bg-primary text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                  title="Underline"
                >
                  U
                </button>
              </div>
            </div>

            {/* Horizontal Alignment */}
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1.5">Alignment</div>
              <div className="flex border border-gray-200 rounded-md overflow-hidden">
                {(["left", "center", "right"] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => onAlignChange?.(align)}
                    className={`flex-1 px-3 py-1.5 text-xs transition-colors ${
                      currentAlign === align
                        ? "bg-primary text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    } ${align !== "left" ? "border-l border-gray-200" : ""}`}
                    title={`Align ${align}`}
                  >
                    {align === "left" && "Left"}
                    {align === "center" && "Center"}
                    {align === "right" && "Right"}
                  </button>
                ))}
              </div>
            </div>

            {/* Vertical Alignment */}
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1.5">Vertical</div>
              <div className="flex border border-gray-200 rounded-md overflow-hidden">
                {(["top", "middle", "bottom"] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => onVerticalAlignChange?.(align)}
                    className={`flex-1 px-3 py-1.5 text-xs transition-colors ${
                      currentVerticalAlign === align
                        ? "bg-primary text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    } ${align !== "top" ? "border-l border-gray-200" : ""}`}
                    title={`Align ${align}`}
                  >
                    {align === "top" && "Top"}
                    {align === "middle" && "Middle"}
                    {align === "bottom" && "Bottom"}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Color */}
            <ColorPicker
              label="Text Color"
              value={currentFill}
              onChange={(c) => onFillChange?.(c)}
            />

            {/* Background Color */}
            <ColorPicker
              label="Background"
              value={currentBackgroundColor || ""}
              onChange={(c) => onBackgroundColorChange?.(c)}
              allowClear
            />
          </div>
        )}

        {/* Container Tab */}
        {textTab === "container" && (
          <div className="p-3 space-y-4">
            {/* Shape Selection */}
            <div>
              <div className="text-xs font-medium text-gray-500 mb-2">Shape</div>
              <div className="grid grid-cols-4 gap-1.5">
                {containerShapes.map((shape) => (
                  <button
                    key={shape.id}
                    onClick={() => onContainerShapeChange?.(shape.id)}
                    className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all ${
                      currentContainerShape === shape.id
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-500"
                    }`}
                    title={shape.label}
                  >
                    {shape.icon}
                    <span className="text-[9px] leading-tight">{shape.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Padding */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-gray-500">Padding</span>
                <span className="text-xs text-gray-400">{currentBackgroundPadding}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="32"
                value={currentBackgroundPadding}
                onChange={(e) => onBackgroundPaddingChange?.(parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Corner Radius - only for rectangle */}
            {currentContainerShape === "rectangle" && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-gray-500">Corner Radius</span>
                  <span className="text-xs text-gray-400">{currentBackgroundCornerRadius}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="24"
                  value={currentBackgroundCornerRadius}
                  onChange={(e) => onBackgroundCornerRadiusChange?.(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Placeholder for sticker type
  return null;
}

// ============ PREVIEW COMPONENTS ============

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
          <path d="M4 5 L6 4 L8 5 L10 4 L12 5 L14 4 L16 5 L18 4 L20 5 L20 19 L18 20 L16 19 L14 20 L12 19 L10 20 L8 19 L6 20 L4 19 Z" fill={fillColor} />
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
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill={fillColor} />
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
          <path d="M4 6 Q6 4 8 6 Q10 4 12 6 Q14 4 16 6 Q18 4 20 6 L20 18 Q18 20 16 18 Q14 20 12 18 Q10 20 8 18 Q6 20 4 18 Z" fill={fillColor} />
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

  switch (filterId) {
    case "none":
      return (
        <div className="rounded overflow-hidden" style={{ width: size, height: size, backgroundColor: bgColor, border: `1px solid ${borderColor}` }}>
          <div className="w-full h-full bg-gradient-to-br from-blue-300 via-green-200 to-yellow-200" />
        </div>
      );
    case "grayscale":
      return (
        <div className="rounded overflow-hidden" style={{ width: size, height: size, backgroundColor: bgColor, border: `1px solid ${borderColor}` }}>
          <div className="w-full h-full bg-gradient-to-br from-gray-700 via-gray-400 to-gray-200" />
        </div>
      );
    case "sepia":
      return (
        <div className="rounded overflow-hidden" style={{ width: size, height: size, backgroundColor: bgColor, border: `1px solid ${borderColor}` }}>
          <div className="w-full h-full bg-gradient-to-br from-amber-700 via-amber-500 to-amber-200" />
        </div>
      );
    case "warm":
      return (
        <div className="rounded overflow-hidden" style={{ width: size, height: size, backgroundColor: bgColor, border: `1px solid ${borderColor}` }}>
          <div className="w-full h-full bg-gradient-to-br from-orange-400 via-yellow-300 to-orange-200" />
        </div>
      );
    case "cool":
      return (
        <div className="rounded overflow-hidden" style={{ width: size, height: size, backgroundColor: bgColor, border: `1px solid ${borderColor}` }}>
          <div className="w-full h-full bg-gradient-to-br from-blue-600 via-blue-400 to-blue-200" />
        </div>
      );
    case "faded":
      return (
        <div className="rounded overflow-hidden" style={{ width: size, height: size, backgroundColor: bgColor, border: `1px solid ${borderColor}` }}>
          <div className="w-full h-full bg-gradient-to-br from-gray-400 via-slate-300 to-gray-200 opacity-70" />
        </div>
      );
    case "contrast":
      return (
        <div className="rounded overflow-hidden" style={{ width: size, height: size, backgroundColor: bgColor, border: `1px solid ${borderColor}` }}>
          <div className="w-full h-full bg-gradient-to-br from-black via-gray-500 to-white" />
        </div>
      );
    case "soft":
      return (
        <div className="rounded overflow-hidden" style={{ width: size, height: size, backgroundColor: bgColor, border: `1px solid ${borderColor}` }}>
          <div className="w-full h-full bg-gradient-to-br from-pink-200 via-purple-100 to-blue-100 opacity-80" />
        </div>
      );
    default:
      return null;
  }
}
