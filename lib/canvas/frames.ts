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
    id: "simple-border",
    name: "Border",
    description: "Simple colored border",
    padding: { top: 8, right: 8, bottom: 8, left: 8 },
  },
  {
    id: "rounded",
    name: "Rounded",
    description: "Large rounded corners with border",
    padding: { top: 8, right: 8, bottom: 8, left: 8 },
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
    id: "heart",
    name: "Heart",
    description: "Heart-shaped crop",
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
  },
  {
    id: "scalloped",
    name: "Scalloped",
    description: "Decorative scalloped edge",
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
  },
  {
    id: "floral",
    name: "Floral",
    description: "Flowers and greenery framing",
    padding: { top: 15, right: 15, bottom: 15, left: 15 },
  },
  {
    id: "celebration",
    name: "Celebration",
    description: "Balloons, confetti, streamers",
    padding: { top: 15, right: 15, bottom: 15, left: 15 },
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

// Generate floral frame overlay SVG
export function generateFloralOverlayUrl(
  width: number,
  height: number
): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="leaf" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#9DC88D"/>
          <stop offset="100%" style="stop-color:#7AB369"/>
        </linearGradient>
      </defs>
      <!-- Top left corner flowers -->
      <g transform="translate(5, 5)">
        <ellipse cx="12" cy="8" rx="8" ry="5" fill="#F5B8C4" opacity="0.9"/>
        <ellipse cx="20" cy="14" rx="7" ry="4" fill="#FFB6C1" opacity="0.85"/>
        <ellipse cx="8" cy="18" rx="6" ry="4" fill="#F5B8C4" opacity="0.8"/>
        <circle cx="14" cy="12" r="4" fill="#FFEFD5"/>
        <ellipse cx="25" cy="6" rx="10" ry="6" fill="url(#leaf)" opacity="0.8"/>
        <ellipse cx="4" cy="28" rx="8" ry="5" fill="url(#leaf)" opacity="0.75"/>
      </g>
      <!-- Top right corner flowers -->
      <g transform="translate(${width - 45}, 5)">
        <ellipse cx="28" cy="10" rx="8" ry="5" fill="#DDA0DD" opacity="0.9"/>
        <ellipse cx="18" cy="16" rx="7" ry="4" fill="#E6E6FA" opacity="0.85"/>
        <ellipse cx="32" cy="20" rx="6" ry="4" fill="#DDA0DD" opacity="0.8"/>
        <circle cx="26" cy="14" r="3" fill="#FFFACD"/>
        <ellipse cx="12" cy="8" rx="10" ry="5" fill="url(#leaf)" opacity="0.8"/>
        <ellipse cx="38" cy="28" rx="8" ry="5" fill="url(#leaf)" opacity="0.75"/>
      </g>
      <!-- Bottom left corner flowers -->
      <g transform="translate(5, ${height - 45})">
        <ellipse cx="15" cy="32" rx="8" ry="5" fill="#87CEEB" opacity="0.9"/>
        <ellipse cx="22" cy="24" rx="7" ry="4" fill="#ADD8E6" opacity="0.85"/>
        <ellipse cx="8" cy="26" rx="6" ry="4" fill="#87CEEB" opacity="0.8"/>
        <circle cx="16" cy="28" r="3" fill="#FFFACD"/>
        <ellipse cx="28" cy="38" rx="10" ry="5" fill="url(#leaf)" opacity="0.8"/>
        <ellipse cx="4" cy="16" rx="8" ry="5" fill="url(#leaf)" opacity="0.75"/>
      </g>
      <!-- Bottom right corner flowers -->
      <g transform="translate(${width - 45}, ${height - 45})">
        <ellipse cx="25" cy="30" rx="8" ry="5" fill="#FFDAB9" opacity="0.9"/>
        <ellipse cx="18" cy="22" rx="7" ry="4" fill="#FFE4B5" opacity="0.85"/>
        <ellipse cx="32" cy="24" rx="6" ry="4" fill="#FFDAB9" opacity="0.8"/>
        <circle cx="24" cy="26" r="3" fill="#FFF8DC"/>
        <ellipse cx="10" cy="36" rx="10" ry="5" fill="url(#leaf)" opacity="0.8"/>
        <ellipse cx="36" cy="14" rx="8" ry="5" fill="url(#leaf)" opacity="0.75"/>
      </g>
    </svg>
  `.trim().replace(/\s+/g, " ");

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// Generate celebration frame overlay SVG
export function generateCelebrationOverlayUrl(
  width: number,
  height: number,
  seed: number = 0
): string {
  let s = seed || 1;
  const seededRandom = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  // Generate confetti pieces
  const confettiColors = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#95E1D3", "#F38181", "#AA96DA", "#FCBAD3"];
  let confetti = "";
  for (let i = 0; i < 25; i++) {
    const x = seededRandom() * width;
    const y = seededRandom() * height;
    // Only place confetti near edges
    if (x > 30 && x < width - 30 && y > 30 && y < height - 30) continue;
    const color = confettiColors[Math.floor(seededRandom() * confettiColors.length)];
    const rotation = seededRandom() * 360;
    const size = 4 + seededRandom() * 6;
    confetti += `<rect x="${x}" y="${y}" width="${size}" height="${size * 0.4}" fill="${color}" transform="rotate(${rotation} ${x} ${y})" opacity="0.85"/>`;
  }

  // Generate streamers
  const streamerColors = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#AA96DA"];

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <!-- Balloons top left -->
      <g transform="translate(8, 8)">
        <ellipse cx="15" cy="20" rx="12" ry="15" fill="#FF6B6B" opacity="0.9"/>
        <path d="M15 35 Q15 40 12 45" stroke="#FF6B6B" stroke-width="1" fill="none"/>
        <ellipse cx="30" cy="15" rx="10" ry="13" fill="#4ECDC4" opacity="0.85"/>
        <path d="M30 28 Q30 33 27 38" stroke="#4ECDC4" stroke-width="1" fill="none"/>
        <ellipse cx="8" cy="35" rx="8" ry="10" fill="#FFE66D" opacity="0.9"/>
        <path d="M8 45 Q8 50 5 55" stroke="#FFE66D" stroke-width="1" fill="none"/>
      </g>
      <!-- Balloons top right -->
      <g transform="translate(${width - 55}, 5)">
        <ellipse cx="35" cy="18" rx="11" ry="14" fill="#AA96DA" opacity="0.9"/>
        <path d="M35 32 Q35 37 32 42" stroke="#AA96DA" stroke-width="1" fill="none"/>
        <ellipse cx="18" cy="22" rx="10" ry="12" fill="#FCBAD3" opacity="0.85"/>
        <path d="M18 34 Q18 39 15 44" stroke="#FCBAD3" stroke-width="1" fill="none"/>
        <ellipse cx="45" cy="35" rx="8" ry="10" fill="#95E1D3" opacity="0.9"/>
        <path d="M45 45 Q45 50 42 55" stroke="#95E1D3" stroke-width="1" fill="none"/>
      </g>
      <!-- Streamers bottom -->
      <path d="M0 ${height - 20} Q20 ${height - 35} 40 ${height - 15} Q60 ${height - 5} 80 ${height - 25}" stroke="${streamerColors[0]}" stroke-width="3" fill="none" opacity="0.7"/>
      <path d="M${width - 80} ${height - 18} Q${width - 60} ${height - 30} ${width - 40} ${height - 12} Q${width - 20} ${height - 5} ${width} ${height - 22}" stroke="${streamerColors[1]}" stroke-width="3" fill="none" opacity="0.7"/>
      <!-- Star bursts in corners -->
      <g transform="translate(${width - 25}, ${height - 25})">
        <polygon points="10,0 12,7 20,7 14,12 16,20 10,15 4,20 6,12 0,7 8,7" fill="#FFE66D" opacity="0.8"/>
      </g>
      <g transform="translate(5, ${height - 25})">
        <polygon points="8,0 10,6 16,6 11,10 13,16 8,12 3,16 5,10 0,6 6,6" fill="#FF6B6B" opacity="0.75"/>
      </g>
      <!-- Confetti -->
      ${confetti}
    </svg>
  `.trim().replace(/\s+/g, " ");

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// Border color options for simple-border and rounded frames
export const borderColorOptions = [
  { id: "white", label: "White", value: "#FFFFFF" },
  { id: "black", label: "Black", value: "#333333" },
  { id: "gold", label: "Gold", value: "#D4AF37" },
  { id: "rose-gold", label: "Rose Gold", value: "#B76E79" },
  { id: "coral", label: "Coral", value: "#F97066" },
  { id: "sage", label: "Sage", value: "#9DC88D" },
  { id: "dusty-blue", label: "Dusty Blue", value: "#A8D4E6" },
  { id: "lavender", label: "Lavender", value: "#E6E6FA" },
];
