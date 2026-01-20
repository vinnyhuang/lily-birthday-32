// Photo corner definitions for scrapbook decorations
// Decorative corner pieces to hold photos

export interface PhotoCorner {
  id: string;
  label: string;
  style: "classic" | "decorative" | "tape";
}

export const photoCorners: PhotoCorner[] = [
  // Classic corners
  { id: "corner-black", label: "Black Classic", style: "classic" },
  { id: "corner-gold", label: "Gold Classic", style: "classic" },
  { id: "corner-kraft", label: "Kraft Paper", style: "classic" },

  // Decorative corners
  { id: "corner-floral", label: "Floral Corner", style: "decorative" },
  { id: "corner-lace", label: "Lace Corner", style: "decorative" },

  // Tape-style corners
  { id: "corner-tape-coral", label: "Coral Tape", style: "tape" },
  { id: "corner-tape-sage", label: "Sage Tape", style: "tape" },
];

// SVG generators for each corner style
function generateClassicCornerSvg(id: string): string {
  let color: string;

  switch (id) {
    case "corner-black":
      color = "#2D2D2D";
      break;
    case "corner-gold":
      color = "#C9A227";
      break;
    case "corner-kraft":
      color = "#C4A77D";
      break;
    default:
      color = "#2D2D2D";
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <path d="M 0 0 L 40 0 L 40 8 L 8 8 L 8 40 L 0 40 Z" fill="${color}"/>
      <path d="M 8 8 L 40 8 L 8 40 Z" fill="${color}" opacity="0.3"/>
    </svg>
  `;
}

function generateDecorativeCornerSvg(id: string): string {
  switch (id) {
    case "corner-floral":
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
          <path d="M 0 0 L 50 0 L 50 10 L 10 10 L 10 50 L 0 50 Z" fill="#F5B8C4" opacity="0.8"/>
          <circle cx="8" cy="8" r="4" fill="#E88A9E"/>
          <circle cx="20" cy="6" r="3" fill="#E88A9E" opacity="0.6"/>
          <circle cx="6" cy="20" r="3" fill="#E88A9E" opacity="0.6"/>
          <path d="M 12 3 Q 14 5 12 8 Q 10 5 12 3" fill="#9DC88D" opacity="0.8"/>
          <path d="M 3 12 Q 5 14 8 12 Q 5 10 3 12" fill="#9DC88D" opacity="0.8"/>
        </svg>
      `;
    case "corner-lace":
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
          <path d="M 0 0 L 50 0 L 50 6 L 6 6 L 6 50 L 0 50 Z" fill="#FFFFFF" stroke="#D4C8BC" stroke-width="1"/>
          <circle cx="3" cy="3" r="2" fill="none" stroke="#D4C8BC" stroke-width="0.5"/>
          <circle cx="12" cy="3" r="2" fill="none" stroke="#D4C8BC" stroke-width="0.5"/>
          <circle cx="21" cy="3" r="2" fill="none" stroke="#D4C8BC" stroke-width="0.5"/>
          <circle cx="30" cy="3" r="2" fill="none" stroke="#D4C8BC" stroke-width="0.5"/>
          <circle cx="39" cy="3" r="2" fill="none" stroke="#D4C8BC" stroke-width="0.5"/>
          <circle cx="3" cy="12" r="2" fill="none" stroke="#D4C8BC" stroke-width="0.5"/>
          <circle cx="3" cy="21" r="2" fill="none" stroke="#D4C8BC" stroke-width="0.5"/>
          <circle cx="3" cy="30" r="2" fill="none" stroke="#D4C8BC" stroke-width="0.5"/>
          <circle cx="3" cy="39" r="2" fill="none" stroke="#D4C8BC" stroke-width="0.5"/>
        </svg>
      `;
    default:
      return "";
  }
}

function generateTapeCornerSvg(id: string): string {
  let color: string;

  switch (id) {
    case "corner-tape-coral":
      color = "#F97066";
      break;
    case "corner-tape-sage":
      color = "#9DC88D";
      break;
    default:
      color = "#F97066";
  }

  // Create torn edges for tape effect
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="15" viewBox="0 0 50 15">
      <defs>
        <clipPath id="tape-torn">
          <path d="M 0 2 L 3 0 L 6 2 L 9 1 L 12 2 L 15 0 L 18 2 L 21 1 L 24 2 L 27 0 L 30 2 L 33 1 L 36 2 L 39 0 L 42 2 L 45 1 L 48 2 L 50 1 L 50 13 L 47 15 L 44 13 L 41 14 L 38 13 L 35 15 L 32 13 L 29 14 L 26 13 L 23 15 L 20 13 L 17 14 L 14 13 L 11 15 L 8 13 L 5 14 L 2 13 L 0 14 Z"/>
        </clipPath>
      </defs>
      <rect x="0" y="0" width="50" height="15" fill="${color}" clip-path="url(#tape-torn)" opacity="0.85"/>
    </svg>
  `;
}

// Generate data URL for a photo corner
export function generatePhotoCornerDataUrl(corner: PhotoCorner): string {
  let svg = "";

  switch (corner.style) {
    case "classic":
      svg = generateClassicCornerSvg(corner.id);
      break;
    case "decorative":
      svg = generateDecorativeCornerSvg(corner.id);
      break;
    case "tape":
      svg = generateTapeCornerSvg(corner.id);
      break;
  }

  if (!svg) return "";

  return `data:image/svg+xml,${encodeURIComponent(svg.trim().replace(/\s+/g, " "))}`;
}

// Group corners by style
export function getCornersByStyle() {
  return {
    classic: photoCorners.filter((c) => c.style === "classic"),
    decorative: photoCorners.filter((c) => c.style === "decorative"),
    tape: photoCorners.filter((c) => c.style === "tape"),
  };
}
