import { useState, useCallback, useRef, useEffect } from "react";
import { CanvasElement, AlignmentGuide, SnapResult } from "@/lib/canvas/types";
import { calculateSnapPoints, calculateSnap } from "@/lib/canvas/alignmentUtils";

interface SnapPoints {
  vertical: number[];
  horizontal: number[];
}

interface UseAlignmentGuidesOptions {
  elements: CanvasElement[];
  canvasWidth: number;
  canvasHeight: number;
  enabled?: boolean;
}

export function useAlignmentGuides({
  elements,
  canvasWidth,
  canvasHeight,
  enabled = true,
}: UseAlignmentGuidesOptions) {
  const [guides, setGuides] = useState<AlignmentGuide[]>([]);
  const [isAltPressed, setIsAltPressed] = useState(false);
  const snapPointsRef = useRef<SnapPoints | null>(null);
  const isDraggingRef = useRef(false);

  // Track Alt/Option key state
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && isDraggingRef.current) {
        setIsAltPressed(true);
        setGuides([]); // Clear guides when Alt is pressed
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.altKey) {
        setIsAltPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  /**
   * Called when drag starts - calculate snap points from all other elements
   */
  const onDragStart = useCallback(
    (elementId: string) => {
      if (!enabled) return;

      isDraggingRef.current = true;
      snapPointsRef.current = calculateSnapPoints(
        elements,
        elementId,
        canvasWidth,
        canvasHeight
      );
    },
    [elements, canvasWidth, canvasHeight, enabled]
  );

  /**
   * Called during drag - calculate snapped position and show guides
   */
  const onDragMove = useCallback(
    (element: CanvasElement, newX: number, newY: number): SnapResult => {
      if (!enabled || !snapPointsRef.current) {
        return { x: newX, y: newY, guides: [] };
      }

      const result = calculateSnap(
        element,
        newX,
        newY,
        snapPointsRef.current,
        elements,
        canvasWidth,
        canvasHeight,
        isAltPressed
      );

      setGuides(result.guides);
      return result;
    },
    [elements, canvasWidth, canvasHeight, enabled, isAltPressed]
  );

  /**
   * Called when drag ends - clear guides
   */
  const onDragEnd = useCallback(() => {
    isDraggingRef.current = false;
    snapPointsRef.current = null;
    setGuides([]);
  }, []);

  /**
   * Clear all guides (useful for programmatic clearing)
   */
  const clearGuides = useCallback(() => {
    setGuides([]);
  }, []);

  return {
    guides,
    isAltPressed,
    onDragStart,
    onDragMove,
    onDragEnd,
    clearGuides,
  };
}
