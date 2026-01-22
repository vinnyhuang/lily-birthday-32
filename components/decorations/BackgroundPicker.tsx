"use client";

import { useState, useEffect } from "react";
import { CanvasBackground } from "@/lib/canvas/types";
import { textures, TextureDefinition } from "@/lib/canvas/textures";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  { id: "charcoal", value: "#4A4543", label: "Charcoal" },
];

// Check if a color is a preset or custom
function isPresetColor(value: string): boolean {
  return backgroundColors.some((c) => c.value.toLowerCase() === value.toLowerCase());
}

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
        <div className="grid grid-cols-4 gap-3">
          {backgroundColors.map((color) => (
            <Tooltip key={color.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSelect({ type: "color", value: color.value })}
                  className={`w-full aspect-square rounded-xl border-2 transition-all ${
                    currentBackground.type === "color" &&
                    currentBackground.value === color.value
                      ? "border-primary ring-2 ring-primary ring-offset-2"
                      : "border-border hover:border-primary/50"
                  }`}
                  style={{ backgroundColor: color.value }}
                >
                  <span className="sr-only">{color.label}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{color.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}

          {/* Custom color picker */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  const input = document.getElementById('custom-bg-color-input') as HTMLInputElement;
                  input?.click();
                }}
                className={`w-full aspect-square rounded-xl border-2 transition-all ${
                  currentBackground.type === "color" && !isPresetColor(currentBackground.value)
                    ? "border-primary ring-2 ring-primary ring-offset-2"
                    : "border-border hover:border-primary/50"
                }`}
                style={{
                  background:
                    currentBackground.type === "color" && !isPresetColor(currentBackground.value)
                      ? currentBackground.value
                      : "conic-gradient(from 0deg, #FF6B6B, #FFE66D, #4ECDC4, #45B7D1, #96E6A1, #DDA0DD, #FF6B6B)",
                }}
              >
                <span className="sr-only">Custom Color</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Custom Color</p>
            </TooltipContent>
          </Tooltip>
        </div>
        {/* Hidden color input - outside grid to not affect layout */}
        <input
          id="custom-bg-color-input"
          type="color"
          value={
            currentBackground.type === "color" && !isPresetColor(currentBackground.value)
              ? currentBackground.value
              : "#FF6B6B"
          }
          onChange={(e) => onSelect({ type: "color", value: e.target.value })}
          className="sr-only"
        />
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
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onSelect}
          className={`w-full aspect-square rounded-xl border-2 transition-all overflow-hidden ${
            isSelected
              ? "border-primary ring-2 ring-primary ring-offset-2"
              : "border-border hover:border-primary/50"
          }`}
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
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>{texture.name}</p>
      </TooltipContent>
    </Tooltip>
  );
}
