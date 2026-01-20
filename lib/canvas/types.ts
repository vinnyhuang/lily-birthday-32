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
}

// Photo element on canvas
export interface CanvasImageElement extends CanvasElementBase {
  type: "image";
  mediaId: string;
  src: string;
  frameId?: string;
}

// Sticker decoration element
export interface CanvasStickerElement extends CanvasElementBase {
  type: "sticker";
  stickerId: string;
  src: string;
  category: "emoji" | "stamp" | "washi";
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
  type: "color" | "pattern";
  value: string;
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
  dateTaken: string | null;
}

// Default canvas dimensions
export const DEFAULT_CANVAS_WIDTH = 800;
export const DEFAULT_CANVAS_HEIGHT = 1000;

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
  category: "emoji" | "stamp" | "washi",
  position: { x: number; y: number },
  zIndex: number
): CanvasStickerElement {
  return {
    id: `sticker-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type: "sticker",
    stickerId,
    src,
    category,
    x: position.x,
    y: position.y,
    width: 80,
    height: 80,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    zIndex,
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
