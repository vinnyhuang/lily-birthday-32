"use client";

import { CanvasBackground } from "@/lib/canvas/types";

interface BackgroundPickerProps {
  currentBackground: CanvasBackground;
  onSelect: (background: CanvasBackground) => void;
}

// Warm, celebratory color palette
const backgroundColors = [
  { id: "cream", value: "#FFF8F0", label: "Cream" },
  { id: "blush", value: "#FDE8E8", label: "Blush" },
  { id: "peach", value: "#FEEBC8", label: "Peach" },
  { id: "sage", value: "#E8F5E9", label: "Sage" },
  { id: "lavender", value: "#EDE7F6", label: "Lavender" },
  { id: "sky", value: "#E3F2FD", label: "Sky" },
  { id: "coral", value: "#FFCCBC", label: "Coral" },
  { id: "lemon", value: "#FFF9C4", label: "Lemon" },
  { id: "white", value: "#FFFFFF", label: "White" },
  { id: "warm-gray", value: "#F5F5F4", label: "Warm Gray" },
];

export function BackgroundPicker({
  currentBackground,
  onSelect,
}: BackgroundPickerProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Choose a background color for your scrapbook page
      </p>

      <div className="grid grid-cols-5 gap-3">
        {backgroundColors.map((color) => (
          <button
            key={color.id}
            onClick={() => onSelect({ type: "color", value: color.value })}
            className={`aspect-square rounded-xl border-2 transition-all ${
              currentBackground.type === "color" &&
              currentBackground.value === color.value
                ? "border-primary ring-2 ring-primary ring-offset-2"
                : "border-border hover:border-primary/50"
            }`}
            style={{ backgroundColor: color.value }}
            title={color.label}
          >
            <span className="sr-only">{color.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
