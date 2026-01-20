// Doodle definitions for scrapbook decorations
// Hand-drawn style decorative elements

export interface Doodle {
  id: string;
  label: string;
  type: "arrow" | "underline" | "circle" | "star" | "heart";
}

export const doodles: Doodle[] = [
  // Arrows
  { id: "arrow-curved", label: "Curved Arrow", type: "arrow" },
  { id: "arrow-straight", label: "Straight Arrow", type: "arrow" },
  { id: "arrow-double", label: "Double Arrow", type: "arrow" },

  // Underlines
  { id: "underline-wavy", label: "Wavy Underline", type: "underline" },
  { id: "underline-double", label: "Double Underline", type: "underline" },
  { id: "underline-scribble", label: "Scribble Underline", type: "underline" },

  // Circles/Ovals
  { id: "circle-handdrawn", label: "Hand-drawn Circle", type: "circle" },
  { id: "oval-handdrawn", label: "Hand-drawn Oval", type: "circle" },

  // Stars
  { id: "star-filled", label: "Filled Star", type: "star" },
  { id: "star-outline", label: "Outline Star", type: "star" },
  { id: "star-burst", label: "Star Burst", type: "star" },

  // Hearts
  { id: "heart-handdrawn", label: "Hand-drawn Heart", type: "heart" },
  { id: "heart-double", label: "Double Heart", type: "heart" },
];

// SVG generators for each doodle type
function generateArrowSvg(id: string, color: string = "#F97066"): string {
  const strokeWidth = 3;

  switch (id) {
    case "arrow-curved":
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="60" viewBox="0 0 100 60">
          <path d="M 10 45 Q 30 10 60 15 Q 85 20 85 35" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>
          <path d="M 75 25 L 90 35 L 78 45" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    case "arrow-straight":
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="40" viewBox="0 0 100 40">
          <path d="M 10 20 L 75 20" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>
          <path d="M 65 10 L 85 20 L 65 30" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    case "arrow-double":
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="40" viewBox="0 0 100 40">
          <path d="M 25 20 L 75 20" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>
          <path d="M 35 10 L 15 20 L 35 30" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M 65 10 L 85 20 L 65 30" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    default:
      return "";
  }
}

function generateUnderlineSvg(id: string, color: string = "#F97066"): string {
  const strokeWidth = 2.5;

  switch (id) {
    case "underline-wavy":
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="120" height="20" viewBox="0 0 120 20">
          <path d="M 5 12 Q 15 5 25 12 Q 35 19 45 12 Q 55 5 65 12 Q 75 19 85 12 Q 95 5 105 12 Q 110 15 115 12" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>
        </svg>
      `;
    case "underline-double":
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="120" height="20" viewBox="0 0 120 20">
          <line x1="5" y1="8" x2="115" y2="8" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>
          <line x1="5" y1="14" x2="115" y2="14" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>
        </svg>
      `;
    case "underline-scribble":
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="120" height="20" viewBox="0 0 120 20">
          <path d="M 5 10 C 15 5 25 15 35 10 C 45 5 55 12 65 10 C 75 8 85 14 95 10 C 105 6 110 12 115 10" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>
          <path d="M 8 12 C 20 16 30 8 45 12 C 60 16 75 8 90 12 C 100 14 108 10 112 12" fill="none" stroke="${color}" stroke-width="${strokeWidth - 0.5}" stroke-linecap="round" opacity="0.6"/>
        </svg>
      `;
    default:
      return "";
  }
}

function generateCircleSvg(id: string, color: string = "#F97066"): string {
  const strokeWidth = 2.5;

  switch (id) {
    case "circle-handdrawn":
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
          <path d="M 40 8 C 60 6 72 20 74 40 C 76 60 62 74 40 74 C 18 74 6 58 8 38 C 10 18 24 6 42 8" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>
        </svg>
      `;
    case "oval-handdrawn":
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="120" height="70" viewBox="0 0 120 70">
          <path d="M 60 8 C 95 6 112 22 114 35 C 116 52 98 64 60 64 C 22 64 6 50 8 35 C 10 18 30 6 62 8" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>
        </svg>
      `;
    default:
      return "";
  }
}

function generateStarSvg(id: string, color: string = "#F97066"): string {
  switch (id) {
    case "star-filled":
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
          <path d="M 30 5 L 36 22 L 55 22 L 40 33 L 46 52 L 30 40 L 14 52 L 20 33 L 5 22 L 24 22 Z" fill="${color}"/>
        </svg>
      `;
    case "star-outline":
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
          <path d="M 30 5 L 36 22 L 55 22 L 40 33 L 46 52 L 30 40 L 14 52 L 20 33 L 5 22 L 24 22 Z" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round"/>
        </svg>
      `;
    case "star-burst":
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
          <path d="M 40 5 L 44 30 L 65 15 L 48 35 L 75 40 L 48 45 L 65 65 L 44 50 L 40 75 L 36 50 L 15 65 L 32 45 L 5 40 L 32 35 L 15 15 L 36 30 Z" fill="${color}"/>
        </svg>
      `;
    default:
      return "";
  }
}

function generateHeartSvg(id: string, color: string = "#F97066"): string {
  switch (id) {
    case "heart-handdrawn":
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="55" viewBox="0 0 60 55">
          <path d="M 30 52 C 20 42 5 32 5 18 C 5 8 14 2 24 6 C 28 8 30 12 30 12 C 30 12 32 8 36 6 C 46 2 55 8 55 18 C 55 32 40 42 30 52" fill="${color}"/>
        </svg>
      `;
    case "heart-double":
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="55" viewBox="0 0 80 55">
          <path d="M 25 50 C 16 41 4 32 4 18 C 4 9 12 4 20 7 C 23 8 25 11 25 11 C 25 11 27 8 30 7 C 38 4 46 9 46 18 C 46 25 42 30 38 35" fill="${color}" opacity="0.6"/>
          <path d="M 50 50 C 40 40 25 30 25 16 C 25 6 34 0 44 4 C 48 6 50 10 50 10 C 50 10 52 6 56 4 C 66 0 75 6 75 16 C 75 30 60 40 50 50" fill="${color}"/>
        </svg>
      `;
    default:
      return "";
  }
}

// Generate data URL for a doodle
export function generateDoodleDataUrl(
  doodle: Doodle,
  color: string = "#F97066"
): string {
  let svg = "";

  switch (doodle.type) {
    case "arrow":
      svg = generateArrowSvg(doodle.id, color);
      break;
    case "underline":
      svg = generateUnderlineSvg(doodle.id, color);
      break;
    case "circle":
      svg = generateCircleSvg(doodle.id, color);
      break;
    case "star":
      svg = generateStarSvg(doodle.id, color);
      break;
    case "heart":
      svg = generateHeartSvg(doodle.id, color);
      break;
  }

  if (!svg) return "";

  return `data:image/svg+xml,${encodeURIComponent(svg.trim().replace(/\s+/g, " "))}`;
}

// Group doodles by type
export function getDoodlesByType() {
  return {
    arrows: doodles.filter((d) => d.type === "arrow"),
    underlines: doodles.filter((d) => d.type === "underline"),
    circles: doodles.filter((d) => d.type === "circle"),
    stars: doodles.filter((d) => d.type === "star"),
    hearts: doodles.filter((d) => d.type === "heart"),
  };
}
