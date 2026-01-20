// Photo frame style definitions
import { FrameStyle } from "./types";

export interface FrameDefinition {
  id: FrameStyle;
  name: string;
  description: string;
  // Additional padding needed around image for frame
  padding: { top: number; right: number; bottom: number; left: number };
}

export const frames: FrameDefinition[] = [
  {
    id: "none",
    name: "No Frame",
    description: "Simple rounded corners with shadow",
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
  },
  {
    id: "polaroid",
    name: "Polaroid",
    description: "Classic instant photo style with white border",
    padding: { top: 10, right: 10, bottom: 40, left: 10 },
  },
  {
    id: "torn",
    name: "Torn Edge",
    description: "Ripped paper effect",
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
  },
  {
    id: "taped",
    name: "Taped",
    description: "Washi tape on corners",
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
  },
  {
    id: "circle",
    name: "Circle",
    description: "Circular crop",
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
  },
  {
    id: "rounded",
    name: "Rounded",
    description: "Large rounded corners with white border",
    padding: { top: 8, right: 8, bottom: 8, left: 8 },
  },
];

export function getFrameById(id: FrameStyle): FrameDefinition | undefined {
  return frames.find((f) => f.id === id);
}

// Generate torn edge path for frame
export function generateTornEdgePath(
  width: number,
  height: number,
  tearSize: number = 4,
  seed: number = 0
): string {
  // Seeded random for consistent edges
  let s = seed || 1;
  const seededRandom = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  const points: string[] = [];

  // Top edge (left to right)
  points.push(`M 0 ${tearSize}`);
  for (let x = 0; x < width; x += tearSize * 2) {
    const variance = seededRandom() * tearSize;
    points.push(`L ${Math.min(x + tearSize, width)} ${variance}`);
    if (x + tearSize * 2 <= width) {
      points.push(`L ${x + tearSize * 2} ${tearSize * 0.5 + seededRandom() * variance}`);
    }
  }
  points.push(`L ${width} ${tearSize}`);

  // Right edge (top to bottom)
  for (let y = tearSize; y < height; y += tearSize * 2) {
    const variance = seededRandom() * tearSize;
    points.push(`L ${width - variance} ${Math.min(y + tearSize, height)}`);
    if (y + tearSize * 2 <= height) {
      points.push(`L ${width - tearSize * 0.5 - seededRandom() * variance} ${y + tearSize * 2}`);
    }
  }

  // Bottom edge (right to left)
  for (let x = width; x > 0; x -= tearSize * 2) {
    const variance = seededRandom() * tearSize;
    points.push(`L ${Math.max(x - tearSize, 0)} ${height - variance}`);
    if (x - tearSize * 2 >= 0) {
      points.push(`L ${x - tearSize * 2} ${height - tearSize * 0.5 - seededRandom() * variance}`);
    }
  }

  // Left edge (bottom to top)
  for (let y = height; y > tearSize; y -= tearSize * 2) {
    const variance = seededRandom() * tearSize;
    points.push(`L ${variance} ${Math.max(y - tearSize, tearSize)}`);
    if (y - tearSize * 2 >= tearSize) {
      points.push(`L ${tearSize * 0.5 + seededRandom() * variance} ${y - tearSize * 2}`);
    }
  }

  points.push("Z");
  return points.join(" ");
}

// Generate washi tape data URL for taped frame
export function generateTapeDataUrl(
  width: number = 60,
  height: number = 15,
  color: string = "#F5B8C4",
  seed: number = 0
): string {
  let s = seed || 1;
  const seededRandom = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  // Create torn edge path
  const tornPoints: string[] = [];
  const tearSize = 2;

  tornPoints.push(`M 0 ${tearSize}`);
  for (let x = 0; x < width; x += tearSize * 2) {
    tornPoints.push(`L ${x + tearSize} ${seededRandom() * tearSize}`);
    tornPoints.push(`L ${x + tearSize * 2} ${tearSize * 0.5 + seededRandom() * tearSize * 0.5}`);
  }
  tornPoints.push(`L ${width} ${tearSize} L ${width} ${height - tearSize}`);
  for (let x = width; x > 0; x -= tearSize * 2) {
    tornPoints.push(`L ${x - tearSize} ${height - seededRandom() * tearSize}`);
    tornPoints.push(`L ${x - tearSize * 2} ${height - tearSize * 0.5 - seededRandom() * tearSize * 0.5}`);
  }
  tornPoints.push("Z");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <defs>
        <clipPath id="torn">
          <path d="${tornPoints.join(" ")}"/>
        </clipPath>
      </defs>
      <rect width="${width}" height="${height}" fill="${color}" clip-path="url(#torn)" opacity="0.85"/>
    </svg>
  `.trim().replace(/\s+/g, " ");

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
