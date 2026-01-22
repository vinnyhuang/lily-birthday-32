// Background texture definitions for scrapbook pages
// Uses SVG data URLs for tileable patterns

export interface TextureDefinition {
  id: string;
  name: string;
  category: "paper" | "craft" | "specialty";
  pattern: string; // SVG data URL
  tileSize: number; // Size of the tile in pixels
}


function createDotsPattern(bgColor: string, dotColor: string, dotSize: number = 2, spacing: number = 12): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${spacing}" height="${spacing}">
      <rect width="${spacing}" height="${spacing}" fill="${bgColor}"/>
      <circle cx="${spacing/2}" cy="${spacing/2}" r="${dotSize}" fill="${dotColor}" opacity="0.3"/>
    </svg>
  `.trim().replace(/\s+/g, ' ');
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function createLinesPattern(bgColor: string, lineColor: string, spacing: number = 24, opacity: number = 0.4): string {
  // Notebook-style horizontal lines
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="${spacing}">
      <rect width="10" height="${spacing}" fill="${bgColor}"/>
      <line x1="0" y1="${spacing - 1}" x2="10" y2="${spacing - 1}" stroke="${lineColor}" stroke-width="1" opacity="${opacity}"/>
    </svg>
  `.trim().replace(/\s+/g, ' ');
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function createGridPattern(bgColor: string, lineColor: string, spacing: number = 20, opacity: number = 0.4): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${spacing}" height="${spacing}">
      <rect width="${spacing}" height="${spacing}" fill="${bgColor}"/>
      <line x1="${spacing}" y1="0" x2="${spacing}" y2="${spacing}" stroke="${lineColor}" stroke-width="1" opacity="${opacity}"/>
      <line x1="0" y1="${spacing}" x2="${spacing}" y2="${spacing}" stroke="${lineColor}" stroke-width="1" opacity="${opacity}"/>
    </svg>
  `.trim().replace(/\s+/g, ' ');
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function createCorkPattern(): string {
  // Cork texture with random dots
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60">
      <rect width="60" height="60" fill="#D4A574"/>
      <circle cx="5" cy="8" r="2" fill="#C49464" opacity="0.6"/>
      <circle cx="25" cy="5" r="1.5" fill="#B88954" opacity="0.5"/>
      <circle cx="45" cy="12" r="2.5" fill="#C49464" opacity="0.4"/>
      <circle cx="12" cy="30" r="1.8" fill="#B88954" opacity="0.5"/>
      <circle cx="35" cy="28" r="2" fill="#C49464" opacity="0.6"/>
      <circle cx="55" cy="35" r="1.5" fill="#B88954" opacity="0.4"/>
      <circle cx="8" cy="50" r="2.2" fill="#C49464" opacity="0.5"/>
      <circle cx="30" cy="52" r="1.8" fill="#B88954" opacity="0.6"/>
      <circle cx="50" cy="48" r="2" fill="#C49464" opacity="0.5"/>
      <circle cx="18" cy="18" r="1.2" fill="#E5B894" opacity="0.3"/>
      <circle cx="42" cy="42" r="1.5" fill="#E5B894" opacity="0.3"/>
      <circle cx="52" cy="22" r="1" fill="#E5B894" opacity="0.4"/>
    </svg>
  `.trim().replace(/\s+/g, ' ');
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function createKraftPattern(): string {
  // Kraft paper with fibrous texture
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">
      <rect width="80" height="80" fill="#C4A77D"/>
      <line x1="0" y1="5" x2="20" y2="8" stroke="#9A8055" stroke-width="1.5" opacity="0.5"/>
      <line x1="30" y1="2" x2="55" y2="6" stroke="#9A8055" stroke-width="1" opacity="0.45"/>
      <line x1="60" y1="10" x2="80" y2="7" stroke="#9A8055" stroke-width="1.2" opacity="0.5"/>
      <line x1="5" y1="25" x2="35" y2="28" stroke="#9A8055" stroke-width="1.5" opacity="0.45"/>
      <line x1="45" y1="30" x2="75" y2="27" stroke="#9A8055" stroke-width="1" opacity="0.5"/>
      <line x1="10" y1="45" x2="40" y2="48" stroke="#9A8055" stroke-width="1.2" opacity="0.45"/>
      <line x1="50" y1="50" x2="80" y2="47" stroke="#9A8055" stroke-width="1.5" opacity="0.5"/>
      <line x1="0" y1="65" x2="25" y2="68" stroke="#9A8055" stroke-width="1" opacity="0.45"/>
      <line x1="35" y1="70" x2="60" y2="67" stroke="#9A8055" stroke-width="1.2" opacity="0.5"/>
      <line x1="65" y1="75" x2="80" y2="73" stroke="#9A8055" stroke-width="1.5" opacity="0.45"/>
      <circle cx="15" cy="15" r="1.5" fill="#E5C99D" opacity="0.6"/>
      <circle cx="55" cy="38" r="1.2" fill="#E5C99D" opacity="0.5"/>
      <circle cx="25" cy="60" r="1.3" fill="#E5C99D" opacity="0.55"/>
      <circle cx="70" cy="55" r="1" fill="#E5C99D" opacity="0.6"/>
    </svg>
  `.trim().replace(/\s+/g, ' ');
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function createConstructionPaperPattern(baseColor: string, fiberColor: string): string {
  // Construction paper with visible fibers
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50">
      <rect width="50" height="50" fill="${baseColor}"/>
      <line x1="2" y1="5" x2="10" y2="6" stroke="${fiberColor}" stroke-width="1.5" opacity="0.4"/>
      <line x1="15" y1="3" x2="24" y2="4" stroke="${fiberColor}" stroke-width="1" opacity="0.35"/>
      <line x1="30" y1="8" x2="40" y2="7" stroke="${fiberColor}" stroke-width="1.2" opacity="0.4"/>
      <line x1="42" y1="2" x2="48" y2="3" stroke="${fiberColor}" stroke-width="1" opacity="0.3"/>
      <line x1="5" y1="18" x2="14" y2="19" stroke="${fiberColor}" stroke-width="1.2" opacity="0.35"/>
      <line x1="25" y1="22" x2="35" y2="21" stroke="${fiberColor}" stroke-width="1.5" opacity="0.4"/>
      <line x1="40" y1="25" x2="48" y2="24" stroke="${fiberColor}" stroke-width="1" opacity="0.3"/>
      <line x1="3" y1="35" x2="12" y2="36" stroke="${fiberColor}" stroke-width="1.2" opacity="0.35"/>
      <line x1="20" y1="38" x2="30" y2="37" stroke="${fiberColor}" stroke-width="1.5" opacity="0.4"/>
      <line x1="35" y1="42" x2="46" y2="41" stroke="${fiberColor}" stroke-width="1" opacity="0.35"/>
      <line x1="8" y1="48" x2="16" y2="47" stroke="${fiberColor}" stroke-width="1.2" opacity="0.3"/>
      <line x1="28" y1="45" x2="38" y2="46" stroke="${fiberColor}" stroke-width="1.5" opacity="0.4"/>
    </svg>
  `.trim().replace(/\s+/g, ' ');
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// Texture definitions
export const textures: TextureDefinition[] = [
  {
    id: "cream-paper",
    name: "Cream Paper",
    category: "paper",
    pattern: createDotsPattern("#FFF8F0", "#E8DCC8", 1.5, 8),
    tileSize: 8,
  },
  {
    id: "kraft",
    name: "Kraft Paper",
    category: "craft",
    pattern: createKraftPattern(),
    tileSize: 80,
  },
  {
    id: "pink-construction",
    name: "Pink Construction",
    category: "craft",
    pattern: createConstructionPaperPattern("#F8C8D8", "#E8A8B8"),
    tileSize: 50,
  },
  {
    id: "blue-construction",
    name: "Blue Construction",
    category: "craft",
    pattern: createConstructionPaperPattern("#B8D8F0", "#98C8E8"),
    tileSize: 50,
  },
  {
    id: "notebook",
    name: "Notebook",
    category: "specialty",
    pattern: createLinesPattern("#FFFFFF", "#90CAF9", 26, 0.45),
    tileSize: 26,
  },
  {
    id: "grid",
    name: "Graph Paper",
    category: "specialty",
    pattern: createGridPattern("#FFFFFF", "#90CAF9", 20, 0.5),
    tileSize: 20,
  },
  {
    id: "corkboard",
    name: "Corkboard",
    category: "specialty",
    pattern: createCorkPattern(),
    tileSize: 60,
  },
  {
    id: "linen",
    name: "Linen",
    category: "paper",
    pattern: createGridPattern("#FAF7F2", "#D5C9B8", 6, 0.5),
    tileSize: 6,
  },
];

// Helper to get a texture by ID
export function getTextureById(id: string): TextureDefinition | undefined {
  return textures.find((t) => t.id === id);
}

// Helper to load texture as an Image for Konva
export function loadTextureImage(texture: TextureDefinition): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = texture.pattern;
  });
}
