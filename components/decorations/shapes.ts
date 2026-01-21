// Shape definitions for scrapbook decorations
// These define native canvas shapes (not SVG stickers)

import { ShapeType } from "@/lib/canvas/types";

export interface ShapeDefinition {
  id: ShapeType;
  label: string;
  category: "basic" | "banners" | "labels" | "bubbles";
  defaultFill: string;
  icon: string; // SVG path for preview
}

export const shapeDefinitions: ShapeDefinition[] = [
  // Basic Shapes
  {
    id: "rectangle",
    label: "Rectangle",
    category: "basic",
    defaultFill: "#FFE4E1",
    icon: '<rect x="4" y="6" width="24" height="12" rx="2" />',
  },
  {
    id: "oval",
    label: "Oval",
    category: "basic",
    defaultFill: "#E8F4FD",
    icon: '<ellipse cx="16" cy="12" rx="12" ry="6" />',
  },
  {
    id: "pill",
    label: "Pill",
    category: "basic",
    defaultFill: "#E8F8E8",
    icon: '<rect x="4" y="7" width="24" height="10" rx="5" />',
  },
  {
    id: "heart",
    label: "Heart",
    category: "basic",
    defaultFill: "#FFD6E0",
    icon: '<path d="M16 20 C16 20 6 14 6 9 C6 6 8 4 10.5 4 C12.5 4 14.5 5 16 7 C17.5 5 19.5 4 21.5 4 C24 4 26 6 26 9 C26 14 16 20 16 20Z" />',
  },
  {
    id: "star",
    label: "Star",
    category: "basic",
    defaultFill: "#FFF3CD",
    icon: '<path d="M16 3 L18.5 9 L25 9 L20 13 L22 20 L16 16 L10 20 L12 13 L7 9 L13.5 9 Z" />',
  },
  {
    id: "cloud",
    label: "Cloud",
    category: "basic",
    defaultFill: "#E8F4FD",
    icon: '<path d="M8 16 Q4 16 4 12 Q4 8 8 8 Q8 5 13 5 Q17 5 18 7 Q20 5 24 7 Q26 9 26 12 Q26 16 22 16 Z" />',
  },
  {
    id: "arrow",
    label: "Arrow",
    category: "basic",
    defaultFill: "#FFE4C4",
    icon: '<path d="M4 9 L18 9 L18 5 L28 12 L18 19 L18 15 L4 15 Z" />',
  },
  {
    id: "scalloped",
    label: "Scalloped",
    category: "basic",
    defaultFill: "#F0E6FA",
    icon: '<path d="M4 8 Q8 4 12 8 Q16 4 20 8 Q24 4 28 8 L28 16 Q24 20 20 16 Q16 20 12 16 Q8 20 4 16 Z" />',
  },
  {
    id: "starburst",
    label: "Starburst",
    category: "basic",
    defaultFill: "#FFFACD",
    icon: '<path d="M16 3 L17.5 8 L23 5 L19.5 10 L26 12 L19.5 14 L23 19 L17.5 16 L16 21 L14.5 16 L9 19 L12.5 14 L6 12 L12.5 10 L9 5 L14.5 8 Z" />',
  },

  // Banners
  {
    id: "banner-ribbon",
    label: "Ribbon",
    category: "banners",
    defaultFill: "#F5B8C4",
    icon: '<path d="M2 8 L6 4 L6 16 L2 12 Z M30 8 L26 4 L26 16 L30 12 Z" fill-opacity="0.5" /><rect x="6" y="4" width="20" height="12" />',
  },
  {
    id: "banner-flag",
    label: "Flag",
    category: "banners",
    defaultFill: "#B8D4F5",
    icon: '<path d="M6 4 L26 4 L26 14 L16 20 L6 14 Z" />',
  },

  // Labels
  {
    id: "ticket",
    label: "Ticket",
    category: "labels",
    defaultFill: "#FFF8F0",
    icon: '<path d="M6 4 L26 4 Q28 4 28 6 L28 9 Q26 9 26 11 Q26 13 28 13 L28 18 Q28 20 26 20 L6 20 Q4 20 4 18 L4 13 Q6 13 6 11 Q6 9 4 9 L4 6 Q4 4 6 4" />',
  },
  {
    id: "tag",
    label: "Tag",
    category: "labels",
    defaultFill: "#E8E8E8",
    icon: '<path d="M10 4 L26 4 Q28 4 28 6 L28 18 Q28 20 26 20 L10 20 L4 12 Z" /><circle cx="9" cy="12" r="2" fill="white" />',
  },

  // Bubbles
  {
    id: "speech-bubble",
    label: "Speech",
    category: "bubbles",
    defaultFill: "#FFFFFF",
    icon: '<path d="M6 4 L26 4 Q28 4 28 6 L28 14 Q28 16 26 16 L12 16 L6 22 L8 16 L6 16 Q4 16 4 14 L4 6 Q4 4 6 4" />',
  },
  {
    id: "thought-bubble",
    label: "Thought",
    category: "bubbles",
    defaultFill: "#FFFFFF",
    icon: '<ellipse cx="16" cy="10" rx="10" ry="6" /><circle cx="9" cy="18" r="2" /><circle cx="6" cy="21" r="1.5" />',
  },
];

// Get shapes grouped by category
export function getShapesByCategory() {
  return {
    basic: shapeDefinitions.filter((s) => s.category === "basic"),
    banners: shapeDefinitions.filter((s) => s.category === "banners"),
    labels: shapeDefinitions.filter((s) => s.category === "labels"),
    bubbles: shapeDefinitions.filter((s) => s.category === "bubbles"),
  };
}

// Generate an SVG preview for a shape
export function generateShapePreviewSvg(shape: ShapeDefinition, size: number = 32): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size * 0.75}" viewBox="0 0 32 24" fill="${shape.defaultFill}" stroke="#888" stroke-width="1">${shape.icon}</svg>`;
}

// Legacy exports for backwards compatibility
export interface Shape {
  id: string;
  label: string;
  type: "banner" | "ticket" | "bubble" | "frame";
}

export const shapes: Shape[] = [
  { id: "banner-ribbon", label: "Ribbon Banner", type: "banner" },
  { id: "banner-flag", label: "Flag Banner", type: "banner" },
  { id: "ticket-classic", label: "Classic Ticket", type: "ticket" },
  { id: "label-tag", label: "Tag Label", type: "ticket" },
  { id: "bubble-speech", label: "Speech Bubble", type: "bubble" },
  { id: "bubble-thought", label: "Thought Bubble", type: "bubble" },
];

export function generateShapeDataUrl(shape: Shape): string {
  // Map old shape ids to new definitions
  const shapeMap: Record<string, ShapeDefinition | undefined> = {
    "banner-ribbon": shapeDefinitions.find((s) => s.id === "banner-ribbon"),
    "banner-flag": shapeDefinitions.find((s) => s.id === "banner-flag"),
    "ticket-classic": shapeDefinitions.find((s) => s.id === "ticket"),
    "label-tag": shapeDefinitions.find((s) => s.id === "tag"),
    "bubble-speech": shapeDefinitions.find((s) => s.id === "speech-bubble"),
    "bubble-thought": shapeDefinitions.find((s) => s.id === "thought-bubble"),
  };

  const shapeDef = shapeMap[shape.id];
  if (!shapeDef) return "";

  const svg = generateShapePreviewSvg(shapeDef, 160);
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function getShapesByType() {
  return {
    banners: shapes.filter((s) => s.type === "banner"),
    tickets: shapes.filter((s) => s.type === "ticket"),
    bubbles: shapes.filter((s) => s.type === "bubble"),
    frames: [],
  };
}
