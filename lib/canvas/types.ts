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

// Filter types for photos
export type FilterType =
  | "none"
  | "grayscale"
  | "sepia"
  | "warm"
  | "cool"
  | "faded"
  | "contrast"
  | "soft";

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
  s3Key: string;
  src: string; // Kept for backwards compatibility, but s3Key is preferred
  frameStyle?: FrameStyle;
  borderColor?: string; // For simple-border and rounded frames
  filterType?: FilterType; // Photo filter effect
  filterIntensity?: number; // Filter intensity 0-100 (default 100)
}

// Video element on canvas
export interface CanvasVideoElement extends CanvasElementBase {
  type: "video";
  mediaId: string;
  s3Key: string;
  src: string; // Kept for backwards compatibility, but s3Key is preferred
  thumbnailUrl?: string; // Optional thumbnail for display when not playing
  frameStyle?: FrameStyle;
  borderColor?: string; // For simple-border and rounded frames
}

// Sticker category types
export type StickerCategory = "emoji" | "washi";

// Sticker decoration element
export interface CanvasStickerElement extends CanvasElementBase {
  type: "sticker";
  stickerId: string;
  src: string;
  category: StickerCategory;
  opacity?: number; // For washi tape transparency (0.85-0.90)
}

// Container shape types for text boxes
export type ContainerShape =
  | "rectangle"
  | "oval"
  | "pill"
  | "heart"
  | "star"
  | "scalloped"
  | "starburst"
  | "cloud"
  | "arrow"
  | "banner-ribbon"
  | "banner-flag"
  | "ticket-classic"
  | "label-tag"
  | "bubble-speech"
  | "bubble-thought";

// Text element
export interface CanvasTextElement extends CanvasElementBase {
  type: "text";
  text: string;

  // Typography
  fontFamily: string;
  fontSize: number;
  fontWeight: "normal" | "bold";
  fontStyle: "normal" | "italic";
  textDecoration: "none" | "underline";
  lineHeight?: number;

  // Colors
  fill: string;
  backgroundColor?: string;

  // Alignment
  align: "left" | "center" | "right";
  verticalAlign?: "top" | "middle" | "bottom";

  // Container styling
  containerShape?: ContainerShape;
  backgroundPadding?: number;
  backgroundCornerRadius?: number;
}

// Brush types for drawing
export type BrushType = "pen" | "marker";

// Single stroke within a drawing
export interface DrawingStroke {
  id: string;
  points: number[]; // Flattened [x1, y1, x2, y2, ...] for Konva.Line
  color: string;
  width: number;
  opacity: number;
  brushType: BrushType;
}

// Drawing element (a layer containing multiple strokes)
export interface CanvasDrawingElement extends CanvasElementBase {
  type: "drawing";
  strokes: DrawingStroke[];
}

// Union type for all canvas elements
export type CanvasElement =
  | CanvasImageElement
  | CanvasVideoElement
  | CanvasStickerElement
  | CanvasTextElement
  | CanvasDrawingElement;

// Background configuration
export interface CanvasBackground {
  type: "color" | "texture";
  value: string; // hex color or texture ID
}

// Single page within a scrapbook
export interface CanvasPage {
  id: string;
  background: CanvasBackground;
  elements: CanvasElement[];
}

// Complete canvas state (stored in Page.canvasData)
// Supports multi-page format (version 2+) with backwards compat for single-page (version 1)
export interface CanvasData {
  version: number;
  width: number;
  height: number;
  pages: CanvasPage[];
}

// Legacy single-page format (for backwards compatibility)
export interface LegacyCanvasData {
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

// Default background for new pages
export const DEFAULT_PAGE_BACKGROUND: CanvasBackground = {
  type: "texture",
  value: "pink-construction",
};

// Generate a unique page ID
export function generatePageId(): string {
  return `page-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Create a new empty page
export function createDefaultPage(): CanvasPage {
  return {
    id: generatePageId(),
    background: { ...DEFAULT_PAGE_BACKGROUND },
    elements: [],
  };
}

// Create a new canvas data object (multi-page format)
export function createDefaultCanvasData(): CanvasData {
  return {
    version: 2,
    width: DEFAULT_CANVAS_WIDTH,
    height: DEFAULT_CANVAS_HEIGHT,
    pages: [createDefaultPage()],
  };
}

// Normalize canvas data to multi-page format (handles legacy single-page format)
export function normalizeCanvasData(data: CanvasData | LegacyCanvasData | null): CanvasData {
  if (!data) {
    return createDefaultCanvasData();
  }

  // Check if already in new multi-page format
  if ('pages' in data && Array.isArray(data.pages)) {
    return data as CanvasData;
  }

  // Legacy format: convert to multi-page
  const legacyData = data as LegacyCanvasData;
  return {
    version: 2,
    width: legacyData.width || DEFAULT_CANVAS_WIDTH,
    height: legacyData.height || DEFAULT_CANVAS_HEIGHT,
    pages: [{
      id: generatePageId(),
      background: legacyData.background || { ...DEFAULT_PAGE_BACKGROUND },
      elements: legacyData.elements || [],
    }],
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
    s3Key: media.s3Key,
    src: media.url, // Kept for backwards compatibility
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

// Create a video element from media
export function createVideoElement(
  media: MediaItem,
  position: { x: number; y: number; width: number; height: number; rotation?: number },
  zIndex: number
): CanvasVideoElement {
  return {
    id: `vid-${media.id}`,
    type: "video",
    mediaId: media.id,
    s3Key: media.s3Key,
    src: media.url, // Kept for backwards compatibility
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
    washi: { width: 120, height: 30 },
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
    // Typography
    fontFamily: "Caveat",
    fontSize: 24,
    fontWeight: "normal",
    fontStyle: "normal",
    textDecoration: "none",
    lineHeight: 1.2,
    // Colors
    fill: "#3D3D3D",
    // Alignment
    align: "center",
  };
}

// Create a drawing element
export function createDrawingElement(
  position: { x: number; y: number },
  zIndex: number
): CanvasDrawingElement {
  return {
    id: `drawing-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type: "drawing",
    x: position.x,
    y: position.y,
    width: 100,
    height: 100,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    zIndex,
    strokes: [],
  };
}

// Generate a unique stroke ID
export function generateStrokeId(): string {
  return `stroke-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

