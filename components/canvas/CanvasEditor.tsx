"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Stage, Layer, Rect } from "react-konva";
import Konva from "konva";
import { CanvasImage } from "./CanvasImage";
import { CanvasSticker } from "./CanvasSticker";
import { CanvasText } from "./CanvasText";
import { useCanvasState } from "./useCanvasState";
import {
  CanvasData,
  MediaItem,
  CanvasImageElement,
  CanvasStickerElement,
  CanvasTextElement,
  createStickerElement,
  createTextElement,
  createImageElement,
} from "@/lib/canvas/types";
import { Button } from "@/components/ui/button";
import { LayoutPicker } from "@/components/layouts/LayoutPicker";
import { DecorationPanel } from "@/components/decorations/DecorationPanel";
import { Sticker } from "@/components/decorations/stickers";

interface CanvasEditorProps {
  pageId: string;
  initialCanvasData: CanvasData | null;
  media: MediaItem[];
  onSave: (canvasData: CanvasData) => Promise<void>;
}

export function CanvasEditor({
  initialCanvasData,
  media,
  onSave,
}: CanvasEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 500 });

  const {
    canvasData,
    selectedId,
    isSaving,
    lastSaved,
    canUndo,
    canRedo,
    setSelectedId,
    updateElement,
    addElement,
    removeElement,
    setBackground,
    applyLayout,
    undo,
    redo,
  } = useCanvasState({
    initialData: initialCanvasData,
    media,
    onSave,
  });

  // Responsive sizing with visibility detection
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // Only update if container is visible (not hidden by tab switching)
        // This prevents Konva errors when forceMount renders the canvas while hidden
        if (containerWidth > 0) {
          const maxWidth = Math.min(containerWidth, 800);
          const height = maxWidth * 1.25; // 4:5 aspect ratio for scrapbook page
          setDimensions({ width: maxWidth, height });
        }
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    // Use IntersectionObserver to detect when canvas becomes visible (tab switch)
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          updateDimensions();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("resize", updateDimensions);
      observer.disconnect();
    };
  }, []);

  // Scale factor for rendering (canvas data is stored at fixed dimensions)
  const scale = dimensions.width / canvasData.width;

  // Deselect when clicking on empty space
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts if user is typing in an input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      // Delete selected element
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        removeElement(selectedId);
        return;
      }

      // Undo: Ctrl+Z or Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Redo: Ctrl+Shift+Z, Cmd+Shift+Z, Ctrl+Y, or Cmd+Y
      if (
        ((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) ||
        ((e.ctrlKey || e.metaKey) && e.key === "y")
      ) {
        e.preventDefault();
        redo();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, removeElement, undo, redo]);

  // Sort elements by zIndex for proper layering
  const sortedElements = [...canvasData.elements].sort(
    (a, b) => a.zIndex - b.zIndex
  );

  // Get max zIndex for new elements
  const maxZIndex = canvasData.elements.length > 0
    ? Math.max(...canvasData.elements.map((el) => el.zIndex))
    : 0;

  // Handle adding a sticker
  const handleAddSticker = useCallback(
    (sticker: Sticker, src: string) => {
      const stickerElement = createStickerElement(
        sticker.id,
        src,
        sticker.category,
        { x: canvasData.width / 2 - 40, y: canvasData.height / 2 - 40 },
        maxZIndex + 1
      );
      addElement(stickerElement);
    },
    [addElement, canvasData.width, canvasData.height, maxZIndex]
  );

  // Handle adding text
  const handleAddText = useCallback(() => {
    const textElement = createTextElement(
      "Add your text",
      { x: canvasData.width / 2 - 100, y: canvasData.height / 2 - 25 },
      maxZIndex + 1
    );
    addElement(textElement);
  }, [addElement, canvasData.width, canvasData.height, maxZIndex]);

  // Load image dimensions
  const loadImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        // Fallback to square if image fails to load
        resolve({ width: 1, height: 1 });
      };
      img.src = url;
    });
  };

  // Handle adding photos from gallery (supports multiple)
  const handleAddPhotos = useCallback(
    async (mediaItems: MediaItem[]) => {
      const baseSize = Math.min(canvasData.width, canvasData.height) * 0.35;
      const padding = 40;

      // Load dimensions for all images
      const itemsWithDimensions = await Promise.all(
        mediaItems.map(async (item) => {
          const dims = await loadImageDimensions(item.url);
          return { item, dims };
        })
      );

      // Calculate positions - stagger them so they don't overlap completely
      const elements = itemsWithDimensions.map(({ item, dims }, index) => {
        // Calculate size maintaining aspect ratio
        const aspectRatio = dims.width / dims.height;
        let width: number;
        let height: number;

        if (aspectRatio > 1) {
          // Landscape
          width = baseSize;
          height = baseSize / aspectRatio;
        } else {
          // Portrait or square
          height = baseSize;
          width = baseSize * aspectRatio;
        }

        // Stagger position for multiple photos
        const offsetX = (index % 3) * 60 - 60;
        const offsetY = Math.floor(index / 3) * 60 - 30;
        const rotation = (Math.random() - 0.5) * 10; // Slight random rotation

        const x = Math.max(padding, Math.min(
          canvasData.width - width - padding,
          canvasData.width / 2 - width / 2 + offsetX
        ));
        const y = Math.max(padding, Math.min(
          canvasData.height - height - padding,
          canvasData.height / 2 - height / 2 + offsetY
        ));

        return createImageElement(
          item,
          { x, y, width, height, rotation },
          maxZIndex + index + 1
        );
      });

      // Add all elements
      elements.forEach((el) => addElement(el));
    },
    [addElement, canvasData.width, canvasData.height, maxZIndex]
  );

  // Get media IDs currently on canvas
  const onCanvasMediaIds = canvasData.elements
    .filter((el): el is CanvasImageElement => el.type === "image")
    .map((el) => el.mediaId);

  // Format last saved time
  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          {/* Undo/Redo buttons */}
          <div className="flex items-center border rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={undo}
              disabled={!canUndo}
              className="rounded-r-none px-2"
              title="Undo (Ctrl+Z)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 7v6h6" />
                <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
              </svg>
            </Button>
            <div className="w-px h-6 bg-border" />
            <Button
              variant="ghost"
              size="sm"
              onClick={redo}
              disabled={!canRedo}
              className="rounded-l-none px-2"
              title="Redo (Ctrl+Shift+Z)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 7v6h-6" />
                <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
              </svg>
            </Button>
          </div>

          <LayoutPicker onApplyLayout={applyLayout} />
          <DecorationPanel
            onAddSticker={handleAddSticker}
            onChangeBackground={setBackground}
            onAddText={handleAddText}
            onAddPhotos={handleAddPhotos}
            currentBackground={canvasData.background}
            media={media}
            onCanvasMediaIds={onCanvasMediaIds}
          />
        </div>

        {/* Auto-save status */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isSaving ? (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              Saving...
            </span>
          ) : lastSaved ? (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Saved {formatLastSaved(lastSaved)}
            </span>
          ) : null}
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="relative bg-white rounded-xl shadow-lg overflow-hidden mx-auto"
        style={{ maxWidth: 800 }}
      >
        <Stage
          width={dimensions.width}
          height={dimensions.height}
          scaleX={scale}
          scaleY={scale}
          onClick={handleStageClick}
          onTap={handleStageClick}
        >
          {/* Background Layer */}
          <Layer>
            <Rect
              x={0}
              y={0}
              width={canvasData.width}
              height={canvasData.height}
              fill={canvasData.background.value}
            />
          </Layer>

          {/* Content Layer */}
          <Layer>
            {sortedElements.map((element) => {
              if (element.type === "image") {
                return (
                  <CanvasImage
                    key={element.id}
                    element={element as CanvasImageElement}
                    isSelected={selectedId === element.id}
                    onSelect={() => setSelectedId(element.id)}
                    onChange={(updates) => updateElement(element.id, updates)}
                  />
                );
              }
              if (element.type === "sticker") {
                return (
                  <CanvasSticker
                    key={element.id}
                    element={element as CanvasStickerElement}
                    isSelected={selectedId === element.id}
                    onSelect={() => setSelectedId(element.id)}
                    onChange={(updates) => updateElement(element.id, updates)}
                  />
                );
              }
              if (element.type === "text") {
                return (
                  <CanvasText
                    key={element.id}
                    element={element as CanvasTextElement}
                    isSelected={selectedId === element.id}
                    onSelect={() => setSelectedId(element.id)}
                    onChange={(updates) => updateElement(element.id, updates)}
                  />
                );
              }
              return null;
            })}
          </Layer>
        </Stage>

        {/* Empty state */}
        {canvasData.elements.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-muted-foreground">
              <div className="text-4xl mb-2">📸</div>
              <p>Upload photos to start creating!</p>
            </div>
          </div>
        )}
      </div>

      {/* Selection info */}
      {selectedId && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Selected: Drag to move, corners to resize</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeElement(selectedId)}
            className="text-destructive hover:text-destructive"
          >
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}
