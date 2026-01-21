// Base canvas element type
export interface CanvasElementBase {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  zIndex: number;
  locked?: boolean;
  visible?: boolean;
}

// Frame styles for photos
export type FrameStyle =
  | "none"
  | "polaroid"
  | "torn"
  | "taped"
  | "circle"
  | "rounded"
  | "simple-border"
  | "scalloped"
  | "heart"
  | "floral"
  | "celebration";

// Alignment guide for snapping
export interface AlignmentGuide {
  type: "vertical" | "horizontal";
  position: number; // x for vertical, y for horizontal
  start: number;
  end: number;
}

// Snap calculation result
export interface SnapResult {
  x: number;
  y: number;
  guides: AlignmentGuide[];
}

// Photo element on canvas
export interface CanvasImageElement extends CanvasElementBase {
  type: "image";
  mediaId: string;
  src: string;
  frameStyle?: FrameStyle;
  borderColor?: string; // For simple-border and rounded frames
}

// Sticker category types
export type StickerCategory = "emoji" | "stamp" | "washi" | "doodle" | "shape" | "photo-corner";

// Sticker decoration element
export interface CanvasStickerElement extends CanvasElementBase {
  type: "sticker";
  stickerId: string;
  src: string;
  category: StickerCategory;
  opacity?: number; // For washi tape transparency (0.85-0.90)
  fillColor?: string; // For shape elements
  strokeColor?: string; // For shape elements
}

// Text element
export interface CanvasTextElement extends CanvasElementBase {
  type: "text";
  text: string;
  fontFamily: string;
  fontSize: number;
  fontStyle: "normal" | "bold" | "italic";
  fill: string;
  align: "left" | "center" | "right";
}

// Union type for all canvas elements
export type CanvasElement =
  | CanvasImageElement
  | CanvasStickerElement
  | CanvasTextElement;

// Background configuration
export interface CanvasBackground {
  type: "color" | "texture";
  value: string; // hex color or texture ID
}

// Complete canvas state (stored in Page.canvasData)
export interface CanvasData {
  version: number;
  width: number;
  height: number;
  background: CanvasBackground;
  elements: CanvasElement[];
}

// Layout template type
export type LayoutType = "grid" | "collage" | "hero" | "freeform";

export interface LayoutTemplate {
  id: LayoutType;
  name: string;
  description: string;
  icon: string;
  generatePositions: (
    mediaCount: number,
    canvasWidth: number,
    canvasHeight: number
  ) => Array<{ x: number; y: number; width: number; height: number; rotation: number }>;
}

// Media item from API (for reference)
export interface MediaItem {
  id: string;
  type: "photo" | "video";
  url: string;
  s3Key: string;
  caption: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  dateTaken: string | null;
}

// Default canvas dimensions (16:9 landscape for two-page spread)
export const DEFAULT_CANVAS_WIDTH = 1600;
export const DEFAULT_CANVAS_HEIGHT = 900;

// Create a new canvas data object
export function createDefaultCanvasData(): CanvasData {
  return {
    version: 1,
    width: DEFAULT_CANVAS_WIDTH,
    height: DEFAULT_CANVAS_HEIGHT,
    background: {
      type: "color",
      value: "#FFF8F0", // Warm cream from theme
    },
    elements: [],
  };
}

// Create an image element from media
export function createImageElement(
  media: MediaItem,
  position: { x: number; y: number; width: number; height: number; rotation?: number },
  zIndex: number
): CanvasImageElement {
  return {
    id: `img-${media.id}`,
    type: "image",
    mediaId: media.id,
    src: media.url,
    x: position.x,
    y: position.y,
    width: position.width,
    height: position.height,
    rotation: position.rotation || 0,
    scaleX: 1,
    scaleY: 1,
    zIndex,
  };
}

// Create a sticker element
export function createStickerElement(
  stickerId: string,
  src: string,
  category: StickerCategory,
  position: { x: number; y: number },
  zIndex: number,
  options?: { width?: number; height?: number; opacity?: number }
): CanvasStickerElement {
  // Default sizes based on category
  const defaultSizes: Record<StickerCategory, { width: number; height: number }> = {
    emoji: { width: 80, height: 80 },
    stamp: { width: 80, height: 80 },
    washi: { width: 120, height: 30 },
    doodle: { width: 100, height: 100 },
    shape: { width: 120, height: 80 },
    "photo-corner": { width: 40, height: 40 },
  };

  const size = defaultSizes[category];

  return {
    id: `sticker-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type: "sticker",
    stickerId,
    src,
    category,
    x: position.x,
    y: position.y,
    width: options?.width ?? size.width,
    height: options?.height ?? size.height,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    zIndex,
    opacity: options?.opacity ?? (category === "washi" ? 0.88 : undefined),
  };
}

// Create a text element
export function createTextElement(
  text: string,
  position: { x: number; y: number },
  zIndex: number
): CanvasTextElement {
  return {
    id: `text-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type: "text",
    text,
    x: position.x,
    y: position.y,
    width: 200,
    height: 50,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    zIndex,
    fontFamily: "Caveat",
    fontSize: 24,
    fontStyle: "normal",
    fill: "#3D3D3D",
    align: "center",
  };
}
