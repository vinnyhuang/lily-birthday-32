"use client";

import { useState, useRef, useEffect } from "react";
import { fonts, categoryLabels, categoryOrder, getFontByFamily } from "@/lib/canvas/fonts";

interface FontPickerProps {
  value: string;
  onChange: (fontFamily: string) => void;
}

export function FontPicker({ value, onChange }: FontPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get current font info
  const currentFont = getFontByFamily(value);
  const displayName = currentFont?.name || value;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Scroll to selected font when opening
  useEffect(() => {
    if (isOpen && dropdownRef.current && currentFont) {
      const selectedElement = dropdownRef.current.querySelector(`[data-font="${currentFont.id}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "center", behavior: "auto" });
      }
    }
  }, [isOpen, currentFont]);

  const handleSelect = (fontFamily: string) => {
    onChange(fontFamily);
    setIsOpen(false);
  };

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <div className="text-xs font-medium text-gray-500">Font</div>

      {/* Selected Font Display / Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left text-sm border border-gray-200 rounded-md bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary flex items-center justify-between"
        style={{ fontFamily: value }}
      >
        <span className="truncate">{displayName}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-[220px] max-h-[300px] overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg"
        >
          {categoryOrder.map((category) => {
            const categoryFonts = fonts.filter((f) => f.category === category);
            if (categoryFonts.length === 0) return null;

            return (
              <div key={category}>
                {/* Category Header */}
                <div className="px-3 py-1.5 text-[10px] font-medium text-gray-400 uppercase tracking-wide bg-gray-50 sticky top-0">
                  {categoryLabels[category]}
                </div>

                {/* Fonts in Category */}
                {categoryFonts.map((font) => (
                  <button
                    key={font.id}
                    type="button"
                    data-font={font.id}
                    onClick={() => handleSelect(font.family)}
                    className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                      value === font.family
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    style={{ fontFamily: font.family }}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Alternative grid-based font picker for more visual selection
interface FontGridPickerProps {
  value: string;
  onChange: (fontFamily: string) => void;
  showCategories?: boolean;
}

export function FontGridPicker({
  value,
  onChange,
  showCategories = true,
}: FontGridPickerProps) {
  return (
    <div className="space-y-3">
      {showCategories ? (
        // Grouped by category
        categoryOrder.map((category) => {
          const categoryFonts = fonts.filter((f) => f.category === category);
          if (categoryFonts.length === 0) return null;

          return (
            <div key={category} className="space-y-1.5">
              <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                {categoryLabels[category]}
              </div>
              <div className="grid grid-cols-2 gap-1">
                {categoryFonts.map((font) => (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => onChange(font.family)}
                    className={`px-2 py-1.5 text-sm text-left rounded border transition-all truncate ${
                      value === font.family
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    style={{ fontFamily: font.family }}
                    title={font.name}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            </div>
          );
        })
      ) : (
        // Flat grid
        <div className="grid grid-cols-2 gap-1">
          {fonts.map((font) => (
            <button
              key={font.id}
              type="button"
              onClick={() => onChange(font.family)}
              className={`px-2 py-1.5 text-sm text-left rounded border transition-all truncate ${
                value === font.family
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
              style={{ fontFamily: font.family }}
              title={font.name}
            >
              {font.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
