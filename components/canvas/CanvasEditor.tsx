"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Stage, Layer } from "react-konva";
import Konva from "konva";
import { CanvasImage } from "./CanvasImage";
import { CanvasSticker } from "./CanvasSticker";
import { CanvasText } from "./CanvasText";
import { CanvasBackground } from "./CanvasBackground";
import { AlignmentGuides } from "./AlignmentGuides";
import { ElementOptionsPanel } from "./ElementOptionsPanel";
import { SpiralBinding } from "./SpiralBinding";
import { useCanvasState } from "./useCanvasState";
import { useAlignmentGuides } from "./useAlignmentGuides";
import {
  CanvasData,
  MediaItem,
  CanvasImageElement,
  CanvasStickerElement,
  CanvasTextElement,
  FrameStyle,
  FilterType,
  createStickerElement,
  createTextElement,
  createImageElement,
} from "@/lib/canvas/types";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CanvasToolbarPopover, PopoverType } from "./CanvasToolbarPopover";
import type { Sticker } from "@/components/decorations/stickers";

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
  const [openPopover, setOpenPopover] = useState<PopoverType>(null);

  // Pixel ratio for crisp rendering when browser-zooming
  // 4 = sharp at 400% zoom, good quality for trackpad pinch-zoom
  // const pixelRatio = 4;
  // 2 = moderately sharp at 200% zoom, trading off quality for performance
  const pixelRatio = 2;

  // Set global Konva pixel ratio for consistent rendering
  if (typeof window !== "undefined") {
    Konva.pixelRatio = pixelRatio;
  }

  // Track drag start position for multi-select move
  const dragStartRef = useRef<{ id: string; x: number; y: number } | null>(null);
  // Track transform start state for multi-select scale
  const transformStartRef = useRef<{
    id: string;
    width: number;
    height: number;
    rotation: number;
  } | null>(null);

  // Live drag/transform offsets for multi-select preview
  const [multiSelectOffset, setMultiSelectOffset] = useState<{
    deltaX: number;
    deltaY: number;
    scaleX: number;
    scaleY: number;
    activeId: string | null;
  }>({ deltaX: 0, deltaY: 0, scaleX: 1, scaleY: 1, activeId: null });

  const {
    canvasData,
    selectedIds,
    selectedElements,
    isSaving,
    lastSaved,
    canUndo,
    canRedo,
    selectElement,
    toggleSelection,
    clearSelection,
    updateElement,
    updateElements,
    translateElements,
    addElement,
    removeElement,
    setBackground,
    bringToFront,
    sendToBack,
    applyLayout,
    undo,
    redo,
  } = useCanvasState({
    initialData: initialCanvasData,
    media,
    onSave,
  });

  // Alignment guides for element snapping (disabled for now)
  // const {
  //   guides,
  //   onDragStart: onGuideDragStart,
  //   onDragMove: onGuideDragMove,
  //   onDragEnd: onGuideDragEnd,
  // } = useAlignmentGuides({
  //   elements: canvasData.elements,
  //   canvasWidth: canvasData.width,
  //   canvasHeight: canvasData.height,
  // });

  // No-op functions while alignment is disabled
  const guides: never[] = [];
  const onGuideDragStart = (_id: string) => {};
  const onGuideDragMove = (_element: unknown, newX: number, newY: number) => ({ x: newX, y: newY, guides: [] });
  const onGuideDragEnd = () => {};

  // Responsive sizing with visibility detection
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // Only update if container is visible (not hidden by tab switching)
        // This prevents Konva errors when forceMount renders the canvas while hidden
        if (containerWidth > 0) {
          const maxWidth = Math.min(containerWidth, 1200);
          const height = maxWidth * (9 / 16); // 16:9 aspect ratio for two-page spread
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
      clearSelection();
    }
  };

  // Handle element selection with multi-select support
  const handleElementSelect = useCallback(
    (id: string, e?: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      const evt = e?.evt as MouseEvent | TouchEvent | undefined;
      const isMultiSelectKey = evt && (
        (evt as MouseEvent).ctrlKey ||
        (evt as MouseEvent).metaKey ||
        (evt as MouseEvent).shiftKey
      );

      if (isMultiSelectKey) {
        toggleSelection(id);
      } else {
        selectElement(id);
      }
    },
    [toggleSelection, selectElement]
  );

  // Handle multi-select drag start - record starting position and transform state
  const handleMultiDragStart = useCallback((id: string) => {
    const element = canvasData.elements.find((el) => el.id === id);
    if (element) {
      dragStartRef.current = { id, x: element.x, y: element.y };
      transformStartRef.current = {
        id,
        width: element.width,
        height: element.height,
        rotation: element.rotation || 0,
      };
      // Initialize multi-select offset
      if (selectedIds.length > 1 && selectedIds.includes(id)) {
        setMultiSelectOffset({ deltaX: 0, deltaY: 0, scaleX: 1, scaleY: 1, activeId: id });
      }
    }
  }, [canvasData.elements, selectedIds]);

  // Handle live drag move for multi-select preview
  const handleMultiDragMove = useCallback((id: string, currentX: number, currentY: number) => {
    const dragStart = dragStartRef.current;
    if (dragStart && dragStart.id === id && selectedIds.length > 1 && selectedIds.includes(id)) {
      const deltaX = currentX - dragStart.x;
      const deltaY = currentY - dragStart.y;
      setMultiSelectOffset((prev) => ({ ...prev, deltaX, deltaY, activeId: id }));
    }
  }, [selectedIds]);

  // Handle live transform for multi-select scale preview
  const handleMultiTransform = useCallback((id: string, scaleX: number, scaleY: number) => {
    if (selectedIds.length > 1 && selectedIds.includes(id)) {
      setMultiSelectOffset((prev) => ({ ...prev, scaleX, scaleY, activeId: id }));
    }
  }, [selectedIds]);

  // Handle multi-select drag end - apply delta to all selected elements
  const handleMultiDragEnd = useCallback(
    (id: string, updates: { x?: number; y?: number }) => {
      const dragStart = dragStartRef.current;

      // Clear multi-select offset
      setMultiSelectOffset({ deltaX: 0, deltaY: 0, scaleX: 1, scaleY: 1, activeId: null });

      // If this element is part of a multi-selection and we have drag start info
      if (dragStart && dragStart.id === id && selectedIds.length > 1 && selectedIds.includes(id)) {
        const deltaX = (updates.x ?? dragStart.x) - dragStart.x;
        const deltaY = (updates.y ?? dragStart.y) - dragStart.y;

        // Apply delta to all selected elements
        translateElements(selectedIds, deltaX, deltaY);
      } else {
        // Single element update
        updateElement(id, updates);
      }

      dragStartRef.current = null;
    },
    [selectedIds, translateElements, updateElement]
  );

  // Handle multi-select transform end - apply scale to all selected elements
  const handleMultiTransformEnd = useCallback(
    (id: string, updates: { x?: number; y?: number; width?: number; height?: number; rotation?: number }) => {
      // Clear multi-select preview offset
      setMultiSelectOffset({ deltaX: 0, deltaY: 0, scaleX: 1, scaleY: 1, activeId: null });

      // Get the original element from canvas state to calculate scale factors
      const originalElement = canvasData.elements.find((el) => el.id === id);

      // If this element is part of a multi-selection
      if (originalElement && selectedIds.length > 1 && selectedIds.includes(id)) {
        const scaleX = updates.width ? updates.width / originalElement.width : 1;
        const scaleY = updates.height ? updates.height / originalElement.height : 1;
        const rotationDelta = updates.rotation !== undefined
          ? updates.rotation - (originalElement.rotation || 0)
          : 0;

        // Apply scale and rotation delta to all selected elements
        const otherSelectedIds = selectedIds.filter((selId) => selId !== id);

        // Update the transformed element first
        updateElement(id, updates);

        // Then scale/rotate other selected elements
        if (otherSelectedIds.length > 0) {
          otherSelectedIds.forEach((otherId) => {
            const otherElement = canvasData.elements.find((el) => el.id === otherId);
            if (otherElement) {
              updateElement(otherId, {
                width: otherElement.width * scaleX,
                height: otherElement.height * scaleY,
                rotation: (otherElement.rotation || 0) + rotationDelta,
              });
            }
          });
        }
      } else {
        // Single element update
        updateElement(id, updates);
      }

      transformStartRef.current = null;
    },
    [selectedIds, canvasData.elements, updateElement]
  );

  // Wrapper for element onChange that handles multi-select
  const handleElementChange = useCallback(
    (id: string, updates: Partial<CanvasImageElement | CanvasStickerElement | CanvasTextElement>) => {
      const keys = Object.keys(updates);
      const isPositionOnlyUpdate = keys.every(k => k === 'x' || k === 'y');
      const isTransformUpdate = keys.some(k => k === 'width' || k === 'height' || k === 'rotation');

      if (isPositionOnlyUpdate && selectedIds.length > 1 && selectedIds.includes(id) && dragStartRef.current) {
        // This is a drag end with multi-select
        handleMultiDragEnd(id, updates as { x?: number; y?: number });
      } else if (isTransformUpdate && selectedIds.length > 1 && selectedIds.includes(id)) {
        // This is a transform end with multi-select
        handleMultiTransformEnd(id, updates as { x?: number; y?: number; width?: number; height?: number; rotation?: number });
      } else {
        // Regular update (single element or non-multi-select case)
        updateElement(id, updates);
      }
    },
    [selectedIds, handleMultiDragEnd, handleMultiTransformEnd, updateElement]
  );

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

      // Delete selected element(s)
      if ((e.key === "Delete" || e.key === "Backspace") && selectedIds.length > 0) {
        removeElement(selectedIds);
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
  }, [selectedIds, removeElement, undo, redo]);

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

  // Toggle popover for a specific type
  const togglePopover = (type: PopoverType) => {
    setOpenPopover((prev) => (prev === type ? null : type));
  };

  // Check if all selected elements are of the same type
  const selectedElementTypes = new Set(selectedElements.map((el) => el.type));
  const allSameType = selectedElementTypes.size === 1;
  const selectedType = allSameType && selectedElements.length > 0 ? selectedElements[0].type : null;

  // For options bar - show when all selected are images
  const allImagesSelected = selectedType === "image";
  const selectedImageElements = allImagesSelected
    ? (selectedElements as CanvasImageElement[])
    : [];

  // Toolbar buttons configuration
  const toolbarButtons: { id: PopoverType; label: string; icon: React.ReactNode }[] = [
    { id: "photos", label: "Photo", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
        <circle cx="9" cy="9" r="2"/>
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
      </svg>
    )},
    { id: "stickers", label: "Sticker", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
        <line x1="9" x2="9.01" y1="9" y2="9"/>
        <line x1="15" x2="15.01" y1="9" y2="9"/>
      </svg>
    )},
    { id: "washi", label: "Washi", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6h16"/>
        <path d="M4 12h16"/>
        <path d="M4 18h16"/>
        <rect x="2" y="4" width="20" height="16" rx="2" strokeDasharray="4 2"/>
      </svg>
    )},
    { id: "decor", label: "Decor", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/>
      </svg>
    )},
    { id: "text", label: "Text", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 7 4 4 20 4 20 7"/>
        <line x1="9" x2="15" y1="20" y2="20"/>
        <line x1="12" x2="12" y1="4" y2="20"/>
      </svg>
    )},
    { id: "background", label: "Background", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2"/>
        <path d="M3 9h18"/>
        <path d="M9 21V9"/>
      </svg>
    )},
  ];

  // Toolbar width for centering calculation
  const toolbarWidth = 40; // w-10 = 2.5rem = 40px

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex justify-center">
        {/* Canvas Area */}
        <div className="w-full max-w-[1200px] relative">
          <div
            ref={containerRef}
            className="relative bg-white rounded-xl shadow-lg overflow-hidden"
            style={{ height: dimensions.height }}
          >
            {/* Render canvas at full resolution, scale down with CSS for display.
                This ensures sharp images when browser-zooming in with trackpad. */}
            <div
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              <Stage
                width={canvasData.width}
                height={canvasData.height}
                pixelRatio={pixelRatio}
                onClick={handleStageClick}
                onTap={handleStageClick}
              >
              {/* Background Layer - listening disabled for performance */}
              <Layer listening={false}>
                <CanvasBackground
                  background={canvasData.background}
                  width={canvasData.width}
                  height={canvasData.height}
                />
              </Layer>

              {/* Content Layer */}
              <Layer
                ref={(node) => {
                  // Set high quality image smoothing for better scaled image rendering
                  if (node) {
                    const canvas = node.getCanvas()._canvas;
                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                      ctx.imageSmoothingEnabled = true;
                      ctx.imageSmoothingQuality = "high";
                    }
                  }
                }}
              >
                {sortedElements.map((element) => {
                  // Apply multi-select offset/scale to non-active selected elements
                  const isActiveElement = multiSelectOffset.activeId === element.id;
                  const shouldTransform = multiSelectOffset.activeId !== null &&
                    selectedIds.includes(element.id) &&
                    !isActiveElement;

                  const transformedElement = shouldTransform
                    ? {
                        ...element,
                        x: element.x + multiSelectOffset.deltaX,
                        y: element.y + multiSelectOffset.deltaY,
                        width: element.width * multiSelectOffset.scaleX,
                        height: element.height * multiSelectOffset.scaleY,
                      }
                    : element;

                  if (element.type === "image") {
                    return (
                      <CanvasImage
                        key={element.id}
                        element={transformedElement as CanvasImageElement}
                        isSelected={selectedIds.includes(element.id)}
                        onSelect={(e) => handleElementSelect(element.id, e)}
                        onChange={(updates) => handleElementChange(element.id, updates)}
                        onDragStart={() => {
                          handleMultiDragStart(element.id);
                          onGuideDragStart(element.id);
                        }}
                        onDragMove={(newX, newY) => {
                          handleMultiDragMove(element.id, newX, newY);
                          return onGuideDragMove(element, newX, newY);
                        }}
                        onDragEnd={onGuideDragEnd}
                        onTransform={(scaleX, scaleY) => handleMultiTransform(element.id, scaleX, scaleY)}
                      />
                    );
                  }
                  if (element.type === "sticker") {
                    return (
                      <CanvasSticker
                        key={element.id}
                        element={transformedElement as CanvasStickerElement}
                        isSelected={selectedIds.includes(element.id)}
                        onSelect={(e) => handleElementSelect(element.id, e)}
                        onChange={(updates) => handleElementChange(element.id, updates)}
                        onDragStart={() => {
                          handleMultiDragStart(element.id);
                          onGuideDragStart(element.id);
                        }}
                        onDragMove={(newX, newY) => {
                          handleMultiDragMove(element.id, newX, newY);
                          return onGuideDragMove(element, newX, newY);
                        }}
                        onDragEnd={onGuideDragEnd}
                        onTransform={(scaleX, scaleY) => handleMultiTransform(element.id, scaleX, scaleY)}
                      />
                    );
                  }
                  if (element.type === "text") {
                    return (
                      <CanvasText
                        key={element.id}
                        element={transformedElement as CanvasTextElement}
                        isSelected={selectedIds.includes(element.id)}
                        onSelect={(e) => handleElementSelect(element.id, e)}
                        onChange={(updates) => handleElementChange(element.id, updates)}
                        onDragStart={() => {
                          handleMultiDragStart(element.id);
                          onGuideDragStart(element.id);
                        }}
                        onDragMove={(newX, newY) => {
                          handleMultiDragMove(element.id, newX, newY);
                          return onGuideDragMove(element, newX, newY);
                        }}
                        onDragEnd={onGuideDragEnd}
                        onTransform={(scaleX, scaleY) => handleMultiTransform(element.id, scaleX, scaleY)}
                      />
                    );
                  }
                  return null;
                })}

                {/* Alignment Guides */}
                <AlignmentGuides guides={guides} />
              </Layer>

              {/* Spiral Binding Overlay Layer */}
              <Layer listening={false}>
                <SpiralBinding
                  canvasWidth={canvasData.width}
                  canvasHeight={canvasData.height}
                />
              </Layer>
            </Stage>
            </div>

            {/* Toolbar Popover Menu */}
            <CanvasToolbarPopover
              type={openPopover}
              onClose={() => setOpenPopover(null)}
              onAddSticker={handleAddSticker}
              onChangeBackground={setBackground}
              onAddText={handleAddText}
              onAddPhotos={handleAddPhotos}
              currentBackground={canvasData.background}
              media={media}
              onCanvasMediaIds={onCanvasMediaIds}
            />
          </div>

          {/* Element Options Panel - absolutely positioned to the right of canvas */}
          {allImagesSelected && selectedImageElements.length > 0 && (
            <div className="absolute top-0 left-full ml-3 hidden sm:block">
              <ElementOptionsPanel
                type="image"
                selectedCount={selectedImageElements.length}
                currentFrame={selectedImageElements[0].frameStyle || "none"}
                currentBorderColor={selectedImageElements[0].borderColor || "#FFFFFF"}
                currentFilter={selectedImageElements[0].filterType || "none"}
                currentFilterIntensity={selectedImageElements[0].filterIntensity ?? 100}
                onFrameSelect={(frame: FrameStyle) => {
                  updateElements(selectedIds, { frameStyle: frame });
                }}
                onBorderColorSelect={(color: string) => {
                  updateElements(selectedIds, { borderColor: color });
                }}
                onFilterSelect={(filter: FilterType) => {
                  updateElements(selectedIds, { filterType: filter });
                }}
                onFilterIntensityChange={(intensity: number) => {
                  updateElements(selectedIds, { filterIntensity: intensity });
                }}
              />
            </div>
          )}

          {/* Left Toolbar - absolutely positioned to the left of canvas */}
          <div className="absolute top-0 bottom-0 right-full mr-3 flex flex-col gap-1 pt-1" style={{ width: toolbarWidth }}>
            {/* Content buttons */}
            {toolbarButtons.map((btn) => (
              <Tooltip key={btn.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={openPopover === btn.id ? "secondary" : "ghost"}
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => togglePopover(btn.id)}
                  >
                    {btn.icon}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>{btn.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}

            <div className="h-px bg-border my-1" />

            {/* Delete button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-destructive hover:text-destructive"
                    onClick={() => selectedIds.length > 0 && removeElement(selectedIds)}
                    disabled={selectedIds.length === 0}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"/>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                      <line x1="10" x2="10" y1="11" y2="17"/>
                      <line x1="14" x2="14" y1="11" y2="17"/>
                    </svg>
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Delete</p>
              </TooltipContent>
            </Tooltip>

            {/* Bring to Front button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => selectedIds.length > 0 && bringToFront(selectedIds)}
                    disabled={selectedIds.length === 0}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="8" y="8" width="12" height="12" rx="2"/>
                      <path d="M4 16V6a2 2 0 0 1 2-2h10"/>
                    </svg>
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Bring to Front</p>
              </TooltipContent>
            </Tooltip>

            {/* Send to Back button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => selectedIds.length > 0 && sendToBack(selectedIds)}
                    disabled={selectedIds.length === 0}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="4" width="12" height="12" rx="2"/>
                      <path d="M20 8v10a2 2 0 0 1-2 2H8"/>
                    </svg>
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Send to Back</p>
              </TooltipContent>
            </Tooltip>

            <div className="h-px bg-border my-1" />

            {/* Undo button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={undo}
                    disabled={!canUndo}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 7v6h6"/>
                      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
                    </svg>
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Undo</p>
              </TooltipContent>
            </Tooltip>

            {/* Redo button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={redo}
                    disabled={!canRedo}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 7v6h-6"/>
                      <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/>
                    </svg>
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Redo</p>
              </TooltipContent>
            </Tooltip>

            {/* Spacer to push saved indicator to bottom */}
            <div className="flex-1" />

            {/* Saved indicator */}
            <div className="text-xs text-muted-foreground text-center pb-1">
              {isSaving ? (
                <span className="flex flex-col items-center gap-1">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                  <span>Saving</span>
                </span>
              ) : lastSaved ? (
                <span className="flex flex-col items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Saved</span>
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
