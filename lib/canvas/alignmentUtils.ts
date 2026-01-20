import { CanvasElement, AlignmentGuide, SnapResult } from "./types";

const SNAP_THRESHOLD = 8; // pixels
const GUIDE_EXTENSION = 20; // pixels to extend guide beyond aligned elements

interface SnapPoints {
  vertical: number[]; // x positions (left, center, right edges)
  horizontal: number[]; // y positions (top, middle, bottom)
}

interface ElementBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
  centerX: number;
  centerY: number;
}

/**
 * Get the bounding box of an element
 */
function getElementBounds(element: CanvasElement): ElementBounds {
  const left = element.x;
  const top = element.y;
  const right = element.x + element.width * element.scaleX;
  const bottom = element.y + element.height * element.scaleY;

  return {
    left,
    right,
    top,
    bottom,
    centerX: (left + right) / 2,
    centerY: (top + bottom) / 2,
  };
}

/**
 * Calculate all snap points from other elements on the canvas
 */
export function calculateSnapPoints(
  elements: CanvasElement[],
  excludeId: string,
  canvasWidth: number,
  canvasHeight: number
): SnapPoints {
  const vertical: number[] = [];
  const horizontal: number[] = [];

  // Add canvas center as snap points
  vertical.push(canvasWidth / 2);
  horizontal.push(canvasHeight / 2);

  // Add canvas edges
  vertical.push(0, canvasWidth);
  horizontal.push(0, canvasHeight);

  // Add snap points from other elements
  for (const element of elements) {
    if (element.id === excludeId) continue;
    if (element.locked) continue;

    const bounds = getElementBounds(element);

    // Vertical snap points (x positions)
    vertical.push(bounds.left, bounds.centerX, bounds.right);

    // Horizontal snap points (y positions)
    horizontal.push(bounds.top, bounds.centerY, bounds.bottom);
  }

  // Remove duplicates and sort
  return {
    vertical: [...new Set(vertical)].sort((a, b) => a - b),
    horizontal: [...new Set(horizontal)].sort((a, b) => a - b),
  };
}

/**
 * Find the closest snap point within threshold
 */
function findClosestSnap(
  value: number,
  snapPoints: number[],
  threshold: number
): { snapped: number; original: number } | null {
  for (const point of snapPoints) {
    if (Math.abs(value - point) <= threshold) {
      return { snapped: point, original: value };
    }
  }
  return null;
}

/**
 * Calculate snapped position and alignment guides for a dragged element
 */
export function calculateSnap(
  element: CanvasElement,
  newX: number,
  newY: number,
  snapPoints: SnapPoints,
  elements: CanvasElement[],
  canvasWidth: number,
  canvasHeight: number,
  disabled: boolean = false
): SnapResult {
  if (disabled) {
    return { x: newX, y: newY, guides: [] };
  }

  const width = element.width * element.scaleX;
  const height = element.height * element.scaleY;

  // Calculate element edges at new position
  const left = newX;
  const centerX = newX + width / 2;
  const right = newX + width;
  const top = newY;
  const centerY = newY + height / 2;
  const bottom = newY + height;

  let snappedX = newX;
  let snappedY = newY;
  const guides: AlignmentGuide[] = [];

  // Check vertical snaps (x-axis alignment)
  const verticalChecks = [
    { value: left, offset: 0 },
    { value: centerX, offset: width / 2 },
    { value: right, offset: width },
  ];

  for (const check of verticalChecks) {
    const snap = findClosestSnap(check.value, snapPoints.vertical, SNAP_THRESHOLD);
    if (snap) {
      snappedX = snap.snapped - check.offset;

      // Find min/max Y for the guide line
      let minY = top;
      let maxY = bottom;

      // Extend guide to other aligned elements
      for (const other of elements) {
        if (other.id === element.id) continue;
        const otherBounds = getElementBounds(other);
        const otherVerticals = [otherBounds.left, otherBounds.centerX, otherBounds.right];

        if (otherVerticals.some((v) => Math.abs(v - snap.snapped) <= 1)) {
          minY = Math.min(minY, otherBounds.top);
          maxY = Math.max(maxY, otherBounds.bottom);
        }
      }

      // Check if it's a canvas center guide
      if (Math.abs(snap.snapped - canvasWidth / 2) <= 1) {
        minY = 0;
        maxY = canvasHeight;
      }

      guides.push({
        type: "vertical",
        position: snap.snapped,
        start: minY - GUIDE_EXTENSION,
        end: maxY + GUIDE_EXTENSION,
      });
      break; // Only snap to one vertical guide
    }
  }

  // Check horizontal snaps (y-axis alignment)
  const horizontalChecks = [
    { value: top, offset: 0 },
    { value: centerY, offset: height / 2 },
    { value: bottom, offset: height },
  ];

  for (const check of horizontalChecks) {
    const snap = findClosestSnap(check.value, snapPoints.horizontal, SNAP_THRESHOLD);
    if (snap) {
      snappedY = snap.snapped - check.offset;

      // Find min/max X for the guide line
      let minX = snappedX;
      let maxX = snappedX + width;

      // Extend guide to other aligned elements
      for (const other of elements) {
        if (other.id === element.id) continue;
        const otherBounds = getElementBounds(other);
        const otherHorizontals = [otherBounds.top, otherBounds.centerY, otherBounds.bottom];

        if (otherHorizontals.some((h) => Math.abs(h - snap.snapped) <= 1)) {
          minX = Math.min(minX, otherBounds.left);
          maxX = Math.max(maxX, otherBounds.right);
        }
      }

      // Check if it's a canvas center guide
      if (Math.abs(snap.snapped - canvasHeight / 2) <= 1) {
        minX = 0;
        maxX = canvasWidth;
      }

      guides.push({
        type: "horizontal",
        position: snap.snapped,
        start: minX - GUIDE_EXTENSION,
        end: maxX + GUIDE_EXTENSION,
      });
      break; // Only snap to one horizontal guide
    }
  }

  return {
    x: snappedX,
    y: snappedY,
    guides,
  };
}
