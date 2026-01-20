"use client";

import { useState, useMemo } from "react";
import { stickers, getStickerSrc, Sticker } from "./stickers";

interface StickerPickerProps {
  onSelect: (sticker: Sticker, src: string) => void;
}

export function StickerPicker({ onSelect }: StickerPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<"emoji" | "stamp">("emoji");

  // Pre-generate sticker sources using useMemo
  const stickerSources = useMemo(() => {
    const sources: Record<string, string> = {};
    stickers.forEach((sticker) => {
      sources[sticker.id] = getStickerSrc(sticker);
    });
    return sources;
  }, []);

  const filteredStickers = stickers.filter((s) => s.category === selectedCategory);

  const handleStickerClick = (sticker: Sticker) => {
    const src = stickerSources[sticker.id];
    if (src) {
      onSelect(sticker, src);
    }
  };

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedCategory("emoji")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === "emoji"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          Emojis
        </button>
        <button
          onClick={() => setSelectedCategory("stamp")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === "stamp"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          Stamps
        </button>
      </div>

      {/* Sticker grid */}
      <div className="grid grid-cols-6 gap-2">
        {filteredStickers.map((sticker) => (
          <button
            key={sticker.id}
            onClick={() => handleStickerClick(sticker)}
            className="aspect-square flex items-center justify-center rounded-lg border-2 border-transparent hover:border-primary hover:bg-primary/5 transition-all p-2"
            title={sticker.label}
          >
            {selectedCategory === "emoji" ? (
              <span className="text-3xl">{sticker.emoji}</span>
            ) : (
              <span className="text-xs font-bold text-primary whitespace-nowrap">
                {sticker.emoji}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
