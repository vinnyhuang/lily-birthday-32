"use client";

import { useState, useEffect } from "react";
import { CanvasBackground } from "@/lib/canvas/types";
import { textures, TextureDefinition } from "@/lib/canvas/textures";

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
  const [textureImages, setTextureImages] = useState<Record<string, string>>({});

  // Pre-load texture previews
  useEffect(() => {
    const loadTextures = async () => {
      const images: Record<string, string> = {};
      textures.forEach((texture) => {
        images[texture.id] = texture.pattern;
      });
      setTextureImages(images);
    };
    loadTextures();
  }, []);

  return (
    <div className="space-y-6">
      {/* Solid Colors */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Solid Colors</h4>
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

      {/* Textures */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Textures</h4>
        <div className="grid grid-cols-4 gap-3">
          {textures.map((texture) => (
            <TextureButton
              key={texture.id}
              texture={texture}
              isSelected={
                currentBackground.type === "texture" &&
                currentBackground.value === texture.id
              }
              onSelect={() => onSelect({ type: "texture", value: texture.id })}
              previewUrl={textureImages[texture.id]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface TextureButtonProps {
  texture: TextureDefinition;
  isSelected: boolean;
  onSelect: () => void;
  previewUrl?: string;
}

function TextureButton({
  texture,
  isSelected,
  onSelect,
  previewUrl,
}: TextureButtonProps) {
  return (
    <button
      onClick={onSelect}
      className={`aspect-square rounded-xl border-2 transition-all overflow-hidden ${
        isSelected
          ? "border-primary ring-2 ring-primary ring-offset-2"
          : "border-border hover:border-primary/50"
      }`}
      title={texture.name}
    >
      {previewUrl && (
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("${previewUrl}")`,
            backgroundRepeat: "repeat",
            backgroundSize: `${texture.tileSize}px ${texture.tileSize}px`,
          }}
        />
      )}
      <span className="sr-only">{texture.name}</span>
    </button>
  );
}
