"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  CanvasData,
  CanvasElement,
  CanvasImageElement,
  MediaItem,
  createDefaultCanvasData,
} from "@/lib/canvas/types";

interface UseCanvasStateOptions {
  initialData: CanvasData | null;
  media: MediaItem[];
  onSave: (data: CanvasData) => Promise<void>;
  autoSaveDelay?: number;
  maxHistorySize?: number;
}

// Note: We no longer auto-populate canvas with media on first load.
// Users can add photos via "Add Content" which properly loads image dimensions
// to maintain aspect ratios. This avoids the distortion issue with square placeholders.

// Helper to refresh image URLs and remove deleted media from canvas
function refreshCanvasUrls(
  canvasData: CanvasData,
  media: MediaItem[]
): CanvasData {
  const urlMap = new Map(media.map((m) => [m.id, m.url]));

  const refreshedElements = canvasData.elements
    .map((el) => {
      if (el.type === "image") {
        const imageEl = el as CanvasImageElement;
        const freshUrl = urlMap.get(imageEl.mediaId);
        if (!freshUrl) {
          return null;
        }
        return { ...imageEl, src: freshUrl };
      }
      return el;
    })
    .filter((el): el is CanvasElement => el !== null);

  return {
    ...canvasData,
    elements: refreshedElements,
  };
}

// Deep clone canvas data for history
function cloneCanvasData(data: CanvasData): CanvasData {
  return JSON.parse(JSON.stringify(data));
}

export function useCanvasState({
  initialData,
  media,
  onSave,
  autoSaveDelay = 1500,
  maxHistorySize = 50,
}: UseCanvasStateOptions) {
  // Initialize canvas data
  const getInitialCanvas = useCallback(() => {
    if (initialData) {
      return refreshCanvasUrls(initialData, media);
    }
    // Start with empty canvas - users add photos via "Add Content" button
    // This ensures proper aspect ratios are loaded
    return createDefaultCanvasData();
  }, [initialData, media]);

  const [canvasData, setCanvasData] = useState<CanvasData>(getInitialCanvas);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // History for undo/redo
  const [history, setHistory] = useState<CanvasData[]>(() => [cloneCanvasData(getInitialCanvas())]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoRedoRef = useRef(false);

  // Auto-save refs
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>(JSON.stringify(getInitialCanvas()));

  // Push current state to history (called after user actions)
  const pushToHistory = useCallback((newData: CanvasData) => {
    setHistory((prev) => {
      // Remove any future states if we're not at the end
      const newHistory = prev.slice(0, historyIndex + 1);
      // Add new state
      newHistory.push(cloneCanvasData(newData));
      // Limit history size
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
        return newHistory;
      }
      return newHistory;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, maxHistorySize - 1));
  }, [historyIndex, maxHistorySize]);

  // Auto-save with debounce
  useEffect(() => {
    const currentDataStr = JSON.stringify(canvasData);

    // Don't save if nothing changed
    if (currentDataStr === lastSavedDataRef.current) {
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSaving(true);
        await onSave(canvasData);
        lastSavedDataRef.current = currentDataStr;
        setLastSaved(new Date());
      } catch (error) {
        console.error("Failed to save canvas:", error);
      } finally {
        setIsSaving(false);
      }
    }, autoSaveDelay);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [canvasData, onSave, autoSaveDelay]);

  // Helper to update canvas and push to history
  const updateCanvasWithHistory = useCallback(
    (updater: (prev: CanvasData) => CanvasData) => {
      setCanvasData((prev) => {
        const newData = updater(prev);
        // Push to history after state update
        setTimeout(() => pushToHistory(newData), 0);
        return newData;
      });
    },
    [pushToHistory]
  );

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedoRef.current = true;
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCanvasData(cloneCanvasData(history[newIndex]));
      setSelectedId(null);
      setTimeout(() => {
        isUndoRedoRef.current = false;
      }, 0);
    }
  }, [history, historyIndex]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedoRef.current = true;
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCanvasData(cloneCanvasData(history[newIndex]));
      setSelectedId(null);
      setTimeout(() => {
        isUndoRedoRef.current = false;
      }, 0);
    }
  }, [history, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Update element position/transform
  const updateElement = useCallback(
    (id: string, updates: Partial<CanvasElement>) => {
      updateCanvasWithHistory((prev) => ({
        ...prev,
        elements: prev.elements.map((el) =>
          el.id === id ? ({ ...el, ...updates } as CanvasElement) : el
        ),
      }));
    },
    [updateCanvasWithHistory]
  );

  // Add a new element
  const addElement = useCallback(
    (element: CanvasElement) => {
      updateCanvasWithHistory((prev) => ({
        ...prev,
        elements: [...prev.elements, element],
      }));
      setSelectedId(element.id);
    },
    [updateCanvasWithHistory]
  );

  // Remove an element
  const removeElement = useCallback(
    (id: string) => {
      updateCanvasWithHistory((prev) => ({
        ...prev,
        elements: prev.elements.filter((el) => el.id !== id),
      }));
      setSelectedId(null);
    },
    [updateCanvasWithHistory]
  );

  // Update background
  const setBackground = useCallback(
    (background: CanvasData["background"]) => {
      updateCanvasWithHistory((prev) => ({
        ...prev,
        background,
      }));
    },
    [updateCanvasWithHistory]
  );

  // Bring element to front
  const bringToFront = useCallback(
    (id: string) => {
      updateCanvasWithHistory((prev) => {
        const maxZ = Math.max(...prev.elements.map((el) => el.zIndex));
        return {
          ...prev,
          elements: prev.elements.map((el) =>
            el.id === id ? { ...el, zIndex: maxZ + 1 } : el
          ),
        };
      });
    },
    [updateCanvasWithHistory]
  );

  // Send element to back
  const sendToBack = useCallback(
    (id: string) => {
      updateCanvasWithHistory((prev) => {
        const minZ = Math.min(...prev.elements.map((el) => el.zIndex));
        return {
          ...prev,
          elements: prev.elements.map((el) =>
            el.id === id ? { ...el, zIndex: minZ - 1 } : el
          ),
        };
      });
    },
    [updateCanvasWithHistory]
  );

  // Apply layout template
  const applyLayout = useCallback(
    (
      generatePositions: (
        count: number,
        width: number,
        height: number
      ) => Array<{ x: number; y: number; width: number; height: number; rotation: number }>
    ) => {
      updateCanvasWithHistory((prev) => {
        const imageElements = prev.elements.filter((el) => el.type === "image");
        const otherElements = prev.elements.filter((el) => el.type !== "image");
        const positions = generatePositions(
          imageElements.length,
          prev.width,
          prev.height
        );

        const repositionedImages = imageElements.map((el, index) => ({
          ...el,
          ...positions[index % positions.length],
          zIndex: index,
        }));

        return {
          ...prev,
          elements: [...repositionedImages, ...otherElements],
        };
      });
    },
    [updateCanvasWithHistory]
  );

  // Get selected element
  const selectedElement = canvasData.elements.find((el) => el.id === selectedId) || null;

  return {
    canvasData,
    selectedId,
    selectedElement,
    isSaving,
    lastSaved,
    canUndo,
    canRedo,
    setSelectedId,
    updateElement,
    addElement,
    removeElement,
    setBackground,
    bringToFront,
    sendToBack,
    applyLayout,
    undo,
    redo,
  };
}
