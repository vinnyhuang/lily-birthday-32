"use client";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  allowClear?: boolean;
  presets?: string[];
}

// Default color presets - neutrals + theme colors
const defaultPresets = [
  // Neutrals
  "#000000", "#333333", "#666666", "#999999", "#CCCCCC", "#FFFFFF",
  // Theme colors (warm scrapbook palette)
  "#F97066", "#E8846E", "#D4AF37", "#F5D89A",
  "#9DC88D", "#A8D4E6", "#DDA0DD", "#F5B8C4",
  "#8B4513", "#2F4F4F",
];

export function ColorPicker({
  value,
  onChange,
  label,
  allowClear = false,
  presets = defaultPresets,
}: ColorPickerProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <div className="text-xs font-medium text-gray-500">{label}</div>
      )}
      <div className="flex flex-wrap gap-1.5">
        {/* Clear button (no color) */}
        {allowClear && (
          <button
            type="button"
            onClick={() => onChange("")}
            className={`w-6 h-6 rounded border flex items-center justify-center ${
              !value
                ? "ring-2 ring-primary ring-offset-1"
                : "border-gray-200 hover:border-gray-300"
            }`}
            title="No color"
          >
            {/* Diagonal line to indicate "none" */}
            <svg width="14" height="14" viewBox="0 0 14 14" className="text-red-400">
              <line x1="2" y1="12" x2="12" y2="2" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        )}

        {/* Preset colors */}
        {presets.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={`w-6 h-6 rounded border transition-all ${
              value === color
                ? "ring-2 ring-primary ring-offset-1 border-primary"
                : "border-gray-200 hover:border-gray-400 hover:scale-110"
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}

        {/* Custom color picker */}
        <div className="relative">
          <input
            type="color"
            value={value || "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="w-6 h-6 rounded border border-gray-200 cursor-pointer opacity-0 absolute inset-0"
            title="Custom color"
          />
          <div
            className={`w-6 h-6 rounded border flex items-center justify-center ${
              value && !presets.includes(value)
                ? "ring-2 ring-primary ring-offset-1 border-primary"
                : "border-gray-200"
            }`}
            style={{
              background: value && !presets.includes(value)
                ? value
                : "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
            }}
          >
            {(!value || presets.includes(value)) && (
              <span className="text-[8px] font-bold text-white drop-shadow-sm">+</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
