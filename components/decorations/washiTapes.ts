// Washi tape definitions for the canvas
// Washi tapes are semi-transparent decorative tape elements with torn edges

export interface WashiTape {
  id: string;
  label: string;
  pattern: "solid" | "stripes" | "dots" | "floral" | "gingham" | "hearts" | "diagonal";
  colors: string[]; // Primary and secondary colors
}

export const washiTapes: WashiTape[] = [
  // Solid colors
  { id: "solid-coral", label: "Coral", pattern: "solid", colors: ["#F97066"] },
  { id: "solid-sage", label: "Sage", pattern: "solid", colors: ["#9DC88D"] },
  { id: "solid-dusty-blue", label: "Dusty Blue", pattern: "solid", colors: ["#8EAEC4"] },
  { id: "solid-gold", label: "Warm Gold", pattern: "solid", colors: ["#E8C872"] },
  { id: "solid-pink", label: "Soft Pink", pattern: "solid", colors: ["#F5B8C4"] },
  { id: "solid-cream", label: "Cream", pattern: "solid", colors: ["#F5E6D3"] },

  // Patterned tapes
  { id: "stripes-coral", label: "Coral Stripes", pattern: "stripes", colors: ["#F97066", "#FFFFFF"] },
  { id: "dots-sage", label: "Sage Dots", pattern: "dots", colors: ["#9DC88D", "#FFFFFF"] },
  { id: "floral-pink", label: "Pink Floral", pattern: "floral", colors: ["#F5B8C4", "#E88A9E"] },
  { id: "gingham-blue", label: "Blue Gingham", pattern: "gingham", colors: ["#8EAEC4", "#FFFFFF"] },
  { id: "hearts-pink", label: "Pink Hearts", pattern: "hearts", colors: ["#FFE4E8", "#F97066"] },
  { id: "diagonal-pastel", label: "Pastel Diagonal", pattern: "diagonal", colors: ["#F5E6D3", "#F5B8C4", "#9DC88D", "#8EAEC4"] },
];

// Create torn edge path for tape
function createTornEdgePath(width: number, height: number, tearSize: number = 3): string {
  const points: string[] = [];

  // Top edge (left to right with small variations)
  points.push(`M 0 ${tearSize}`);
  for (let x = 0; x < width; x += tearSize * 2) {
    const variance = Math.random() * tearSize;
    points.push(`L ${x + tearSize} ${variance}`);
    points.push(`L ${x + tearSize * 2} ${tearSize * 0.5 + Math.random() * variance}`);
  }
  points.push(`L ${width} ${tearSize}`);

  // Right edge
  points.push(`L ${width} ${height - tearSize}`);

  // Bottom edge (right to left with variations)
  for (let x = width; x > 0; x -= tearSize * 2) {
    const variance = Math.random() * tearSize;
    points.push(`L ${x - tearSize} ${height - variance}`);
    points.push(`L ${x - tearSize * 2} ${height - tearSize * 0.5 - Math.random() * variance}`);
  }
  points.push(`L 0 ${height - tearSize}`);

  // Close path
  points.push("Z");

  return points.join(" ");
}

// Generate washi tape pattern SVG
function generatePatternSvg(tape: WashiTape, width: number, height: number): string {
  const [primary, secondary = "#FFFFFF", tertiary, quaternary] = tape.colors;

  switch (tape.pattern) {
    case "stripes": {
      const stripeWidth = 6;
      const stripes = [];
      for (let x = 0; x < width + height; x += stripeWidth * 2) {
        stripes.push(`<rect x="${x}" y="0" width="${stripeWidth}" height="${height * 3}" fill="${secondary}" transform="rotate(-45 ${x} 0)"/>`);
      }
      return `
        <rect width="${width}" height="${height}" fill="${primary}"/>
        <g clip-path="url(#clip)">${stripes.join("")}</g>
      `;
    }

    case "dots": {
      const dots = [];
      const dotRadius = 3;
      const spacing = 12;
      for (let y = spacing / 2; y < height; y += spacing) {
        for (let x = spacing / 2; x < width; x += spacing) {
          dots.push(`<circle cx="${x}" cy="${y}" r="${dotRadius}" fill="${secondary}" opacity="0.8"/>`);
        }
      }
      return `
        <rect width="${width}" height="${height}" fill="${primary}"/>
        ${dots.join("")}
      `;
    }

    case "floral": {
      const flowers = [];
      const spacing = 20;
      for (let y = spacing / 2; y < height; y += spacing) {
        for (let x = spacing / 2; x < width; x += spacing) {
          flowers.push(`
            <g transform="translate(${x}, ${y})">
              <circle cx="0" cy="-4" r="2.5" fill="${secondary}"/>
              <circle cx="3.5" cy="-1.5" r="2.5" fill="${secondary}"/>
              <circle cx="2" cy="3" r="2.5" fill="${secondary}"/>
              <circle cx="-2" cy="3" r="2.5" fill="${secondary}"/>
              <circle cx="-3.5" cy="-1.5" r="2.5" fill="${secondary}"/>
              <circle cx="0" cy="0" r="2" fill="#FFE082"/>
            </g>
          `);
        }
      }
      return `
        <rect width="${width}" height="${height}" fill="${primary}"/>
        ${flowers.join("")}
      `;
    }

    case "gingham": {
      const size = 8;
      const rects = [];
      for (let y = 0; y < height; y += size * 2) {
        for (let x = 0; x < width; x += size * 2) {
          rects.push(`<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${secondary}"/>`);
          rects.push(`<rect x="${x + size}" y="${y + size}" width="${size}" height="${size}" fill="${secondary}"/>`);
          rects.push(`<rect x="${x}" y="${y + size}" width="${size}" height="${size}" fill="${primary}" opacity="0.5"/>`);
          rects.push(`<rect x="${x + size}" y="${y}" width="${size}" height="${size}" fill="${primary}" opacity="0.5"/>`);
        }
      }
      return `
        <rect width="${width}" height="${height}" fill="${primary}"/>
        ${rects.join("")}
      `;
    }

    case "hearts": {
      const hearts = [];
      const spacing = 16;
      for (let y = spacing / 2; y < height; y += spacing) {
        for (let x = spacing / 2; x < width; x += spacing) {
          hearts.push(`
            <path d="M ${x} ${y + 2}
                     C ${x} ${y - 1}, ${x - 4} ${y - 3}, ${x - 4} ${y}
                     C ${x - 4} ${y + 2}, ${x} ${y + 5}, ${x} ${y + 6}
                     C ${x} ${y + 5}, ${x + 4} ${y + 2}, ${x + 4} ${y}
                     C ${x + 4} ${y - 3}, ${x} ${y - 1}, ${x} ${y + 2}"
                  fill="${secondary}" opacity="0.9"/>
          `);
        }
      }
      return `
        <rect width="${width}" height="${height}" fill="${primary}"/>
        ${hearts.join("")}
      `;
    }

    case "diagonal": {
      const stripeWidth = 8;
      const colors = [primary, secondary, tertiary || primary, quaternary || secondary];
      const stripes = [];
      let colorIndex = 0;
      for (let x = -height; x < width + height; x += stripeWidth) {
        stripes.push(`<rect x="${x}" y="0" width="${stripeWidth}" height="${height * 3}" fill="${colors[colorIndex % colors.length]}" transform="rotate(-45 ${x} 0)"/>`);
        colorIndex++;
      }
      return `
        <rect width="${width}" height="${height}" fill="${primary}"/>
        <g clip-path="url(#clip)">${stripes.join("")}</g>
      `;
    }

    case "solid":
    default:
      return `<rect width="${width}" height="${height}" fill="${primary}"/>`;
  }
}

// Generate a data URL for a washi tape
export function generateWashiTapeDataUrl(
  tape: WashiTape,
  width: number = 120,
  height: number = 30
): string {
  // Use a seeded random for consistent torn edges
  const savedRandom = Math.random;
  let seed = tape.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  Math.random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const tornPath = createTornEdgePath(width, height, 2);
  const patternContent = generatePatternSvg(tape, width, height);

  // Restore Math.random
  Math.random = savedRandom;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <clipPath id="clip">
          <rect width="${width}" height="${height}"/>
        </clipPath>
        <clipPath id="torn">
          <path d="${tornPath}"/>
        </clipPath>
      </defs>
      <g clip-path="url(#torn)" opacity="0.88">
        ${patternContent}
      </g>
    </svg>
  `.trim().replace(/\s+/g, " ");

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// Get washi tapes by pattern type
export function getWashiTapesByPattern() {
  return {
    solid: washiTapes.filter((t) => t.pattern === "solid"),
    patterned: washiTapes.filter((t) => t.pattern !== "solid"),
  };
}
