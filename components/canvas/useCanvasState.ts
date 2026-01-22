"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  CanvasData,
  CanvasElement,
  CanvasImageElement,
  CanvasBackground,
  MediaItem,
  createDefaultPage,
  normalizeCanvasData,
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
// Works with multi-page canvas data
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

  // Helper to refresh elements in a page
  const refreshPageElements = (elements: CanvasElement[]): CanvasElement[] => {
    return elements
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
  };

  // Refresh all pages
  const refreshedPages = canvasData.pages.map((page) => ({
    ...page,
    elements: refreshPageElements(page.elements),
  }));

  return {
    ...canvasData,
    width: DEFAULT_CANVAS_WIDTH,
    height: DEFAULT_CANVAS_HEIGHT,
    pages: refreshedPages,
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
  // Initialize canvas data (handles legacy single-page format)
  const getInitialCanvas = useCallback(() => {
    // normalizeCanvasData handles null, legacy format, and new format
    const normalized = normalizeCanvasData(initialData);
    return refreshCanvasUrls(normalized, media);
  }, [initialData, media]);

  const [canvasData, setCanvasData] = useState<CanvasData>(getInitialCanvas);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
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

  // Update element position/transform (on current page)
  const updateElement = useCallback(
    (id: string, updates: Partial<CanvasElement>) => {
      updateCanvasWithHistory((prev) => ({
        ...prev,
        pages: prev.pages.map((page, i) =>
          i === currentPageIndex
            ? {
                ...page,
                elements: page.elements.map((el) =>
                  el.id === id ? ({ ...el, ...updates } as CanvasElement) : el
                ),
              }
            : page
        ),
      }));
    },
    [updateCanvasWithHistory, currentPageIndex]
  );

  // Update multiple elements at once (for multi-select, on current page)
  const updateElements = useCallback(
    (ids: string[], updates: Partial<CanvasElement>) => {
      updateCanvasWithHistory((prev) => ({
        ...prev,
        pages: prev.pages.map((page, i) =>
          i === currentPageIndex
            ? {
                ...page,
                elements: page.elements.map((el) =>
                  ids.includes(el.id) ? ({ ...el, ...updates } as CanvasElement) : el
                ),
              }
            : page
        ),
      }));
    },
    [updateCanvasWithHistory, currentPageIndex]
  );

  // Translate multiple elements by delta (for multi-select drag, on current page)
  const translateElements = useCallback(
    (ids: string[], deltaX: number, deltaY: number) => {
      updateCanvasWithHistory((prev) => ({
        ...prev,
        pages: prev.pages.map((page, i) =>
          i === currentPageIndex
            ? {
                ...page,
                elements: page.elements.map((el) =>
                  ids.includes(el.id)
                    ? ({ ...el, x: el.x + deltaX, y: el.y + deltaY } as CanvasElement)
                    : el
                ),
              }
            : page
        ),
      }));
    },
    [updateCanvasWithHistory, currentPageIndex]
  );

  // Add a new element (to current page)
  const addElement = useCallback(
    (element: CanvasElement) => {
      updateCanvasWithHistory((prev) => ({
        ...prev,
        pages: prev.pages.map((page, i) =>
          i === currentPageIndex
            ? { ...page, elements: [...page.elements, element] }
            : page
        ),
      }));
      setSelectedIds([element.id]);
    },
    [updateCanvasWithHistory, currentPageIndex]
  );

  // Remove element(s) - supports single id or array of ids (from current page)
  const removeElement = useCallback(
    (ids: string | string[]) => {
      const idsToRemove = Array.isArray(ids) ? ids : [ids];
      updateCanvasWithHistory((prev) => ({
        ...prev,
        pages: prev.pages.map((page, i) =>
          i === currentPageIndex
            ? { ...page, elements: page.elements.filter((el) => !idsToRemove.includes(el.id)) }
            : page
        ),
      }));
      setSelectedIds([]);
    },
    [updateCanvasWithHistory, currentPageIndex]
  );

  // Update background (for current page)
  const setBackground = useCallback(
    (background: CanvasBackground) => {
      updateCanvasWithHistory((prev) => ({
        ...prev,
        pages: prev.pages.map((page, i) =>
          i === currentPageIndex
            ? { ...page, background }
            : page
        ),
      }));
    },
    [updateCanvasWithHistory, currentPageIndex]
  );

  // Bring element(s) to front (on current page)
  const bringToFront = useCallback(
    (ids: string | string[]) => {
      const idsToMove = Array.isArray(ids) ? ids : [ids];
      updateCanvasWithHistory((prev) => {
        const currentPage = prev.pages[currentPageIndex];
        const maxZ = currentPage.elements.length > 0
          ? Math.max(...currentPage.elements.map((el) => el.zIndex))
          : 0;
        return {
          ...prev,
          pages: prev.pages.map((page, i) =>
            i === currentPageIndex
              ? {
                  ...page,
                  elements: page.elements.map((el) =>
                    idsToMove.includes(el.id)
                      ? { ...el, zIndex: maxZ + 1 + idsToMove.indexOf(el.id) }
                      : el
                  ),
                }
              : page
          ),
        };
      });
    },
    [updateCanvasWithHistory, currentPageIndex]
  );

  // Send element(s) to back (on current page)
  const sendToBack = useCallback(
    (ids: string | string[]) => {
      const idsToMove = Array.isArray(ids) ? ids : [ids];
      updateCanvasWithHistory((prev) => {
        const currentPage = prev.pages[currentPageIndex];
        const minZ = currentPage.elements.length > 0
          ? Math.min(...currentPage.elements.map((el) => el.zIndex))
          : 0;
        return {
          ...prev,
          pages: prev.pages.map((page, i) =>
            i === currentPageIndex
              ? {
                  ...page,
                  elements: page.elements.map((el) =>
                    idsToMove.includes(el.id)
                      ? { ...el, zIndex: minZ - 1 - idsToMove.indexOf(el.id) }
                      : el
                  ),
                }
              : page
          ),
        };
      });
    },
    [updateCanvasWithHistory, currentPageIndex]
  );

  // Apply layout template (to current page)
  const applyLayout = useCallback(
    (
      generatePositions: (
        count: number,
        width: number,
        height: number
      ) => Array<{ x: number; y: number; width: number; height: number; rotation: number }>
    ) => {
      updateCanvasWithHistory((prev) => {
        const currentPage = prev.pages[currentPageIndex];
        const imageElements = currentPage.elements.filter((el) => el.type === "image");
        const otherElements = currentPage.elements.filter((el) => el.type !== "image");
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
          pages: prev.pages.map((page, i) =>
            i === currentPageIndex
              ? { ...page, elements: [...repositionedImages, ...otherElements] }
              : page
          ),
        };
      });
    },
    [updateCanvasWithHistory, currentPageIndex]
  );

  // Get current page and its selected elements
  const currentPage = canvasData.pages[currentPageIndex] || canvasData.pages[0];
  const selectedElements = currentPage.elements.filter((el) => selectedIds.includes(el.id));

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

  // Page management: switch to a different page
  const goToPage = useCallback((pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < canvasData.pages.length) {
      setCurrentPageIndex(pageIndex);
      setSelectedIds([]); // Clear selection when switching pages
    }
  }, [canvasData.pages.length]);

  // Page management: add a new page after current
  const addPage = useCallback((background?: CanvasBackground) => {
    const newPage = createDefaultPage();
    if (background) {
      newPage.background = background;
    }
    updateCanvasWithHistory((prev) => {
      const newPages = [...prev.pages];
      newPages.splice(currentPageIndex + 1, 0, newPage);
      return { ...prev, pages: newPages };
    });
    // Switch to the new page
    setCurrentPageIndex(currentPageIndex + 1);
    setSelectedIds([]);
  }, [updateCanvasWithHistory, currentPageIndex]);

  // Page management: delete a page
  const deletePage = useCallback((pageIndex: number) => {
    if (canvasData.pages.length <= 1) return; // Can't delete the last page

    updateCanvasWithHistory((prev) => ({
      ...prev,
      pages: prev.pages.filter((_, i) => i !== pageIndex),
    }));

    // Adjust current page index if needed
    if (currentPageIndex >= canvasData.pages.length - 1) {
      setCurrentPageIndex(Math.max(0, canvasData.pages.length - 2));
    } else if (pageIndex < currentPageIndex) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
    setSelectedIds([]);
  }, [updateCanvasWithHistory, canvasData.pages.length, currentPageIndex]);

  // Page management: reorder pages
  const reorderPage = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    if (fromIndex < 0 || toIndex < 0) return;
    if (fromIndex >= canvasData.pages.length || toIndex >= canvasData.pages.length) return;

    updateCanvasWithHistory((prev) => {
      const newPages = [...prev.pages];
      const [moved] = newPages.splice(fromIndex, 1);
      newPages.splice(toIndex, 0, moved);
      return { ...prev, pages: newPages };
    });

    // Update current page index to follow the page if it was moved
    if (currentPageIndex === fromIndex) {
      setCurrentPageIndex(toIndex);
    } else if (fromIndex < currentPageIndex && toIndex >= currentPageIndex) {
      setCurrentPageIndex(currentPageIndex - 1);
    } else if (fromIndex > currentPageIndex && toIndex <= currentPageIndex) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  }, [updateCanvasWithHistory, canvasData.pages.length, currentPageIndex]);

  return {
    // Canvas data
    canvasData,
    currentPage,
    currentPageIndex,
    totalPages: canvasData.pages.length,

    // Selection
    selectedIds,
    selectedElements,
    selectElement,
    toggleSelection,
    addToSelection,
    clearSelection,
    setSelectedIds,

    // Save state
    isSaving,
    lastSaved,

    // History
    canUndo,
    canRedo,
    undo,
    redo,

    // Element operations (on current page)
    updateElement,
    updateElements,
    translateElements,
    addElement,
    removeElement,
    setBackground,
    bringToFront,
    sendToBack,
    applyLayout,

    // Page management
    goToPage,
    addPage,
    deletePage,
    reorderPage,
  };
}
