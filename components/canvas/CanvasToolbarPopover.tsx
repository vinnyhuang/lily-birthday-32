"use client";

import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { StickerPicker } from "@/components/decorations/StickerPicker";
import { BackgroundPicker } from "@/components/decorations/BackgroundPicker";
import { PhotoPicker } from "@/components/decorations/PhotoPicker";
import { WashiTapePicker } from "@/components/decorations/WashiTapePicker";
import { DecorativeElementsPicker } from "@/components/decorations/DecorativeElementsPicker";
import { Sticker } from "@/components/decorations/stickers";
import { WashiTape } from "@/components/decorations/washiTapes";
import { Doodle } from "@/components/decorations/doodles";
import { Shape } from "@/components/decorations/shapes";
import { PhotoCorner } from "@/components/decorations/photoCorners";
import { CanvasBackground, MediaItem } from "@/lib/canvas/types";

export type PopoverType = "photos" | "stickers" | "washi" | "decor" | "text" | "background" | null;

interface CanvasToolbarPopoverProps {
  type: PopoverType;
  onClose: () => void;
  onAddSticker: (sticker: Sticker, src: string) => void;
  onChangeBackground: (background: CanvasBackground) => void;
  onAddText: () => void;
  onAddPhotos: (media: MediaItem[]) => void;
  currentBackground: CanvasBackground;
  media: MediaItem[];
  onCanvasMediaIds: string[];
}

export function CanvasToolbarPopover({
  type,
  onClose,
  onAddSticker,
  onChangeBackground,
  onAddText,
  onAddPhotos,
  currentBackground,
  media,
  onCanvasMediaIds,
}: CanvasToolbarPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Close on escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  if (!type) return null;

  const handleAddSticker = (sticker: Sticker, src: string) => {
    onAddSticker(sticker, src);
    onClose();
  };

  const handleAddWashiTape = (tape: WashiTape, dataUrl: string) => {
    const stickerLike: Sticker = {
      id: tape.id,
      emoji: tape.label,
      label: tape.label,
      category: "washi",
    };
    onAddSticker(stickerLike, dataUrl);
    onClose();
  };

  const handleAddDoodle = (doodle: Doodle, dataUrl: string) => {
    const stickerLike: Sticker = {
      id: doodle.id,
      emoji: doodle.label,
      label: doodle.label,
      category: "doodle",
    };
    onAddSticker(stickerLike, dataUrl);
    onClose();
  };

  const handleAddShape = (shape: Shape, dataUrl: string) => {
    const stickerLike: Sticker = {
      id: shape.id,
      emoji: shape.label,
      label: shape.label,
      category: "shape",
    };
    onAddSticker(stickerLike, dataUrl);
    onClose();
  };

  const handleAddCorner = (corner: PhotoCorner, dataUrl: string) => {
    const stickerLike: Sticker = {
      id: corner.id,
      emoji: corner.label,
      label: corner.label,
      category: "photo-corner",
    };
    onAddSticker(stickerLike, dataUrl);
    onClose();
  };

  const handleAddText = () => {
    onAddText();
    onClose();
  };

  const handleAddPhotos = (mediaItems: MediaItem[]) => {
    onAddPhotos(mediaItems);
    onClose();
  };

  const titles: Record<Exclude<PopoverType, null>, string> = {
    photos: "Add Photos",
    stickers: "Stickers",
    washi: "Washi Tape",
    decor: "Decorations",
    text: "Add Text",
    background: "Background",
  };

  return (
    <div
      ref={popoverRef}
      className="absolute top-2 left-2 z-50 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
      style={{ maxHeight: "calc(100% - 16px)", maxWidth: "320px" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50">
        <span className="text-sm font-medium text-gray-700">{titles[type]}</span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-3 overflow-y-auto" style={{ maxHeight: "400px" }}>
        {type === "photos" && (
          <PhotoPicker
            media={media}
            onCanvasMediaIds={onCanvasMediaIds}
            onSelect={handleAddPhotos}
          />
        )}

        {type === "stickers" && (
          <StickerPicker onSelect={handleAddSticker} />
        )}

        {type === "washi" && (
          <WashiTapePicker onSelect={handleAddWashiTape} />
        )}

        {type === "decor" && (
          <DecorativeElementsPicker
            onSelectDoodle={handleAddDoodle}
            onSelectShape={handleAddShape}
            onSelectCorner={handleAddCorner}
          />
        )}

        {type === "text" && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">
              Add a text box for messages or captions
            </p>
            <Button onClick={handleAddText} size="sm">
              Add Text Box
            </Button>
          </div>
        )}

        {type === "background" && (
          <BackgroundPicker
            currentBackground={currentBackground}
            onSelect={onChangeBackground}
          />
        )}
      </div>
    </div>
  );
}
