// Photo filter definitions for the canvas
import { FilterType } from "./types";

export interface FilterDefinition {
  id: FilterType;
  name: string;
  description: string;
  // CSS filter values at 100% intensity
  // These will be interpolated based on filterIntensity
  filters: {
    brightness?: number; // default 1
    contrast?: number; // default 1
    saturate?: number; // default 1
    grayscale?: number; // default 0
    sepia?: number; // default 0
    hueRotate?: number; // degrees, default 0
    blur?: number; // pixels, default 0
  };
}

export const filters: FilterDefinition[] = [
  {
    id: "none",
    name: "Original",
    description: "No filter applied",
    filters: {},
  },
  {
    id: "grayscale",
    name: "B&W",
    description: "Classic black and white",
    filters: {
      grayscale: 1,
      contrast: 1.1,
    },
  },
  {
    id: "sepia",
    name: "Sepia",
    description: "Warm vintage tone",
    filters: {
      sepia: 0.8,
      contrast: 1.1,
      brightness: 1.05,
    },
  },
  {
    id: "warm",
    name: "Warm",
    description: "Sunny and inviting",
    filters: {
      saturate: 1.3,
      sepia: 0.2,
      brightness: 1.05,
    },
  },
  {
    id: "cool",
    name: "Cool",
    description: "Moody blue tones",
    filters: {
      saturate: 0.9,
      hueRotate: -10,
      brightness: 0.95,
      contrast: 1.1,
    },
  },
  {
    id: "faded",
    name: "Faded",
    description: "Nostalgic film look",
    filters: {
      contrast: 0.9,
      saturate: 0.8,
      brightness: 1.1,
    },
  },
  {
    id: "contrast",
    name: "Contrast",
    description: "Bold and dramatic",
    filters: {
      contrast: 1.4,
      saturate: 1.1,
      brightness: 1.02,
    },
  },
  {
    id: "soft",
    name: "Soft",
    description: "Dreamy and gentle",
    filters: {
      contrast: 0.95,
      brightness: 1.08,
      saturate: 0.9,
      blur: 0.5,
    },
  },
];

export function getFilterById(id: FilterType): FilterDefinition | undefined {
  return filters.find((f) => f.id === id);
}

// Generate CSS filter string from filter definition and intensity
export function generateCssFilter(
  filterType: FilterType,
  intensity: number = 100
): string {
  const filter = getFilterById(filterType);
  if (!filter || filterType === "none") {
    return "none";
  }

  const t = intensity / 100; // 0 to 1
  const parts: string[] = [];

  const f = filter.filters;

  // Interpolate each filter value from default (no effect) to full effect
  if (f.brightness !== undefined) {
    const value = 1 + (f.brightness - 1) * t;
    parts.push(`brightness(${value.toFixed(3)})`);
  }

  if (f.contrast !== undefined) {
    const value = 1 + (f.contrast - 1) * t;
    parts.push(`contrast(${value.toFixed(3)})`);
  }

  if (f.saturate !== undefined) {
    const value = 1 + (f.saturate - 1) * t;
    parts.push(`saturate(${value.toFixed(3)})`);
  }

  if (f.grayscale !== undefined) {
    const value = f.grayscale * t;
    parts.push(`grayscale(${value.toFixed(3)})`);
  }

  if (f.sepia !== undefined) {
    const value = f.sepia * t;
    parts.push(`sepia(${value.toFixed(3)})`);
  }

  if (f.hueRotate !== undefined) {
    const value = f.hueRotate * t;
    parts.push(`hue-rotate(${value.toFixed(1)}deg)`);
  }

  if (f.blur !== undefined) {
    const value = f.blur * t;
    parts.push(`blur(${value.toFixed(2)}px)`);
  }

  return parts.length > 0 ? parts.join(" ") : "none";
}

// For Konva, we need to apply filters differently using canvas operations
// This returns the RGBA manipulation values for Konva.Filters.RGBA or custom filters
export function getKonvaFilterConfig(
  filterType: FilterType,
  intensity: number = 100
) {
  const filter = getFilterById(filterType);
  if (!filter || filterType === "none") {
    return null;
  }

  const t = intensity / 100;
  const f = filter.filters;

  return {
    brightness: f.brightness !== undefined ? (f.brightness - 1) * t : 0,
    contrast: f.contrast !== undefined ? (f.contrast - 1) * t : 0,
    saturation: f.saturate !== undefined ? (f.saturate - 1) * t : 0,
    grayscale: f.grayscale !== undefined ? f.grayscale * t : 0,
    sepia: f.sepia !== undefined ? f.sepia * t : 0,
    hueRotation: f.hueRotate !== undefined ? f.hueRotate * t : 0,
    blur: f.blur !== undefined ? f.blur * t : 0,
  };
}
