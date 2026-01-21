"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  CanvasData,
  CanvasElement,
  CanvasImageElement,
  MediaItem,
  createDefaultCanvasData,
  DEFAULT_CANVAS_WIDTH,
  DEFAULT_CANVAS_HEIGHT,
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

// Helper to refresh image URLs, remove deleted media, and migrate canvas dimensions
function refreshCanvasUrls(
  canvasData: CanvasData,
  media: MediaItem[]
): CanvasData {
  const urlMap = new Map(media.map((m) => [m.id, m.url]));

  // Check if we need to migrate dimensions (e.g., from old 4:5 to new 16:9)
  const needsDimensionMigration =
    canvasData.width !== DEFAULT_CANVAS_WIDTH ||
    canvasData.height !== DEFAULT_CANVAS_HEIGHT;

  // Calculate scale factors for migrating element positions
  const scaleX = needsDimensionMigration ? DEFAULT_CANVAS_WIDTH / canvasData.width : 1;
  const scaleY = needsDimensionMigration ? DEFAULT_CANVAS_HEIGHT / canvasData.height : 1;

  const refreshedElements = canvasData.elements
    .map((el) => {
      if (el.type === "image") {
        const imageEl = el as CanvasImageElement;
        const freshUrl = urlMap.get(imageEl.mediaId);
        if (!freshUrl) {
          return null;
        }
        // Migrate position if dimensions changed
        if (needsDimensionMigration) {
          return {
            ...imageEl,
            src: freshUrl,
            x: imageEl.x * scaleX,
            y: imageEl.y * scaleY,
            width: imageEl.width * scaleX,
            height: imageEl.height * scaleY,
          };
        }
        return { ...imageEl, src: freshUrl };
      }
      // Migrate other elements too
      if (needsDimensionMigration) {
        return {
          ...el,
          x: el.x * scaleX,
          y: el.y * scaleY,
          width: el.width * scaleX,
          height: el.height * scaleY,
        };
      }
      return el;
    })
    .filter((el): el is CanvasElement => el !== null);

  return {
    ...canvasData,
    width: DEFAULT_CANVAS_WIDTH,
    height: DEFAULT_CANVAS_HEIGHT,
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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // History for undo/redo
  const [history, setHistory] = useState<CanvasData[]>(() => [cloneCanvasData(getInitialCanvas())]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const historyIndexRef = useRef(0); // Ref to avoid stale closure in pushToHistory
  const isUndoRedoRef = useRef(false);

  // Auto-save refs
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>(JSON.stringify(getInitialCanvas()));

  // Ref to track pending history push and prevent duplicates
  const pendingHistoryRef = useRef<{ data: CanvasData; id: number } | null>(null);
  const historyPushIdRef = useRef(0);

  // Push current state to history (called after user actions)
  const pushToHistory = useCallback((newData: CanvasData) => {
    // Read the ref value BEFORE any state updates
    const currentIndex = historyIndexRef.current;

    console.log('[History] pushToHistory called, currentIndex from ref:', currentIndex);

    // Calculate the new history array
    setHistory((prev) => {
      // Remove any future states if we're not at the end
      const newHistory = prev.slice(0, currentIndex + 1);
      // Add new state
      newHistory.push(cloneCanvasData(newData));

      console.log('[History] pushToHistory inside setHistory:', {
        prevHistory: prev.map((_, i) => i), // Just show indices for readability
        prevLength: prev.length,
        currentIndex,
        sliceEnd: currentIndex + 1,
        newHistoryLength: newHistory.length,
        resultingIndices: newHistory.map((_, i) => i),
      });

      // Limit history size
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
      }

      // Update ref immediately (synchronous)
      const newIndex = newHistory.length - 1;
      historyIndexRef.current = newIndex;

      console.log('[History] pushToHistory updated ref to:', newIndex);

      return newHistory;
    });

    // Update the index state separately (will be batched by React)
    setHistoryIndex((prev) => {
      console.log('[History] setHistoryIndex updating from', prev, 'to', historyIndexRef.current);
      return historyIndexRef.current;
    });
  }, [maxHistorySize]);

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
      // Generate unique ID for this history push to prevent duplicates from Strict Mode
      const pushId = ++historyPushIdRef.current;

      setCanvasData((prev) => {
        const newData = updater(prev);
        // Store the pending history push with its ID
        pendingHistoryRef.current = { data: newData, id: pushId };
        return newData;
      });

      // Push to history after state update
      setTimeout(() => {
        // Only push if this is still the most recent pending push
        const pending = pendingHistoryRef.current;
        if (pending && pending.id === pushId) {
          console.log('[History] updateCanvasWithHistory pushing, id:', pushId);
          pushToHistory(pending.data);
          pendingHistoryRef.current = null;
        } else {
          console.log('[History] updateCanvasWithHistory skipped duplicate, id:', pushId, 'current:', pending?.id);
        }
      }, 0);
    },
    [pushToHistory]
  );

  // Undo
  const undo = useCallback(() => {
    console.log('[History] undo called:', {
      currentIndex: historyIndexRef.current,
      historyLength: history.length,
      canUndo: historyIndexRef.current > 0,
    });
    if (historyIndexRef.current > 0) {
      isUndoRedoRef.current = true;
      const newIndex = historyIndexRef.current - 1;
      historyIndexRef.current = newIndex;
      console.log('[History] undo: ref updated to', newIndex);
      setHistoryIndex(newIndex);
      setCanvasData(cloneCanvasData(history[newIndex]));
      setSelectedIds([]);
      console.log('[History] undo applied, new index:', newIndex, 'ref is now:', historyIndexRef.current);
      setTimeout(() => {
        isUndoRedoRef.current = false;
      }, 0);
    }
  }, [history]);

  // Redo
  const redo = useCallback(() => {
    console.log('[History] redo called:', {
      currentIndex: historyIndexRef.current,
      historyLength: history.length,
      canRedo: historyIndexRef.current < history.length - 1,
    });
    if (historyIndexRef.current < history.length - 1) {
      isUndoRedoRef.current = true;
      const newIndex = historyIndexRef.current + 1;
      historyIndexRef.current = newIndex;
      setHistoryIndex(newIndex);
      setCanvasData(cloneCanvasData(history[newIndex]));
      setSelectedIds([]);
      console.log('[History] redo applied, new index:', newIndex);
      setTimeout(() => {
        isUndoRedoRef.current = false;
      }, 0);
    }
  }, [history]);

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

  // Update multiple elements at once (for multi-select)
  const updateElements = useCallback(
    (ids: string[], updates: Partial<CanvasElement>) => {
      updateCanvasWithHistory((prev) => ({
        ...prev,
        elements: prev.elements.map((el) =>
          ids.includes(el.id) ? ({ ...el, ...updates } as CanvasElement) : el
        ),
      }));
    },
    [updateCanvasWithHistory]
  );

  // Translate multiple elements by delta (for multi-select drag)
  const translateElements = useCallback(
    (ids: string[], deltaX: number, deltaY: number) => {
      updateCanvasWithHistory((prev) => ({
        ...prev,
        elements: prev.elements.map((el) =>
          ids.includes(el.id)
            ? ({ ...el, x: el.x + deltaX, y: el.y + deltaY } as CanvasElement)
            : el
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
      setSelectedIds([element.id]);
    },
    [updateCanvasWithHistory]
  );

  // Remove element(s) - supports single id or array of ids
  const removeElement = useCallback(
    (ids: string | string[]) => {
      const idsToRemove = Array.isArray(ids) ? ids : [ids];
      updateCanvasWithHistory((prev) => ({
        ...prev,
        elements: prev.elements.filter((el) => !idsToRemove.includes(el.id)),
      }));
      setSelectedIds([]);
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

  // Bring element(s) to front
  const bringToFront = useCallback(
    (ids: string | string[]) => {
      const idsToMove = Array.isArray(ids) ? ids : [ids];
      updateCanvasWithHistory((prev) => {
        const maxZ = Math.max(...prev.elements.map((el) => el.zIndex));
        return {
          ...prev,
          elements: prev.elements.map((el, idx) =>
            idsToMove.includes(el.id)
              ? { ...el, zIndex: maxZ + 1 + idsToMove.indexOf(el.id) }
              : el
          ),
        };
      });
    },
    [updateCanvasWithHistory]
  );

  // Send element(s) to back
  const sendToBack = useCallback(
    (ids: string | string[]) => {
      const idsToMove = Array.isArray(ids) ? ids : [ids];
      updateCanvasWithHistory((prev) => {
        const minZ = Math.min(...prev.elements.map((el) => el.zIndex));
        return {
          ...prev,
          elements: prev.elements.map((el) =>
            idsToMove.includes(el.id)
              ? { ...el, zIndex: minZ - 1 - idsToMove.indexOf(el.id) }
              : el
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

  // Get selected elements
  const selectedElements = canvasData.elements.filter((el) => selectedIds.includes(el.id));

  // Toggle selection (for ctrl/cmd/shift click)
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  // Add to selection
  const addToSelection = useCallback((id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // Select single element (replaces current selection)
  const selectElement = useCallback((id: string | null) => {
    setSelectedIds(id ? [id] : []);
  }, []);

  return {
    canvasData,
    selectedIds,
    selectedElements,
    isSaving,
    lastSaved,
    canUndo,
    canRedo,
    selectElement,
    toggleSelection,
    addToSelection,
    clearSelection,
    setSelectedIds,
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
  };
}
