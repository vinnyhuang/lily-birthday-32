"use client";

import { useState } from "react";
import { MediaItem } from "@/lib/canvas/types";
import { Button } from "@/components/ui/button";

interface PhotoPickerProps {
  media: MediaItem[];
  onCanvasMediaIds: string[];
  onSelect: (media: MediaItem[]) => void;
}

export function PhotoPicker({ media, onCanvasMediaIds, onSelect }: PhotoPickerProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter to show photos not already on canvas, and only photos (not videos for now)
  const availablePhotos = media.filter(
    (m) => m.type === "photo" && !onCanvasMediaIds.includes(m.id)
  );

  const photosOnCanvas = media.filter(
    (m) => m.type === "photo" && onCanvasMediaIds.includes(m.id)
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(availablePhotos.map((p) => p.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleAddSelected = () => {
    const selectedPhotos = availablePhotos.filter((p) => selectedIds.has(p.id));
    if (selectedPhotos.length > 0) {
      onSelect(selectedPhotos);
      setSelectedIds(new Set());
    }
  };

  if (media.filter((m) => m.type === "photo").length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No photos uploaded yet.</p>
        <p className="text-sm mt-1">Upload photos from the main page first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {availablePhotos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              Available to add ({availablePhotos.length})
            </p>
            <div className="flex items-center gap-2">
              {selectedIds.size > 0 ? (
                <button
                  onClick={clearSelection}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              ) : null}
              <button
                onClick={selectAll}
                className="text-xs text-primary hover:underline"
              >
                Select all
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {availablePhotos.map((photo) => {
              const isSelected = selectedIds.has(photo.id);
              return (
                <button
                  key={photo.id}
                  onClick={() => toggleSelect(photo.id)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all relative ${
                    isSelected
                      ? "border-primary ring-2 ring-primary ring-offset-2"
                      : "border-transparent hover:border-primary/50"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.caption || "Photo"}
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Add selected button */}
          {selectedIds.size > 0 && (
            <Button onClick={handleAddSelected} className="w-full">
              Add {selectedIds.size} photo{selectedIds.size > 1 ? "s" : ""} to canvas
            </Button>
          )}
        </div>
      )}

      {photosOnCanvas.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Already on canvas ({photosOnCanvas.length})
          </p>
          <div className="grid grid-cols-4 gap-2 opacity-50">
            {photosOnCanvas.map((photo) => (
              <div
                key={photo.id}
                className="aspect-square rounded-lg overflow-hidden border-2 border-muted relative"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.caption || "Photo"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <span className="text-white text-xs">On canvas</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {availablePhotos.length === 0 && photosOnCanvas.length > 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          All your photos are already on the canvas!
        </p>
      )}
    </div>
  );
}
