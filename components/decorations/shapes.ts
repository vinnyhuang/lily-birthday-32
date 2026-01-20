// Shape definitions for scrapbook decorations
// Decorative frames and containers

export interface Shape {
  id: string;
  label: string;
  type: "banner" | "ticket" | "bubble" | "frame";
}

export const shapes: Shape[] = [
  // Banners
  { id: "banner-ribbon", label: "Ribbon Banner", type: "banner" },
  { id: "banner-flag", label: "Flag Banner", type: "banner" },

  // Tickets/Labels
  { id: "ticket-classic", label: "Classic Ticket", type: "ticket" },
  { id: "label-tag", label: "Tag Label", type: "ticket" },

  // Speech Bubbles
  { id: "bubble-speech", label: "Speech Bubble", type: "bubble" },
  { id: "bubble-thought", label: "Thought Bubble", type: "bubble" },

  // Decorative Frames
  { id: "frame-scallop", label: "Scalloped Frame", type: "frame" },
  { id: "frame-bracket", label: "Bracket Frame", type: "frame" },
];

// SVG generators for each shape type
function generateBannerSvg(id: string, fillColor: string = "#F5B8C4", strokeColor: string = "#E88A9E"): string {
  switch (id) {
    case "banner-ribbon":
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="180" height="60" viewBox="0 0 180 60">
          <path d="M 0 15 L 15 0 L 15 45 L 0 30 Z" fill="${strokeColor}"/>
          <path d="M 180 15 L 165 0 L 165 45 L 180 30 Z" fill="${strokeColor}"/>
          <path d="M 15 5 L 165 5 L 165 45 L 15 45 Z" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2"/>
          <path d="M 15 5 L 0 20 L 15 5" fill="none" stroke="${strokeColor}" stroke-width="0"/>
        </svg>
      `;
    case "banner-flag":
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="140" height="70" viewBox="0 0 140 70">
          <path d="M 10 5 L 130 5 L 130 50 L 70 65 L 10 50 Z" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2"/>
        </svg>
      `;
    default:
      return "";
  }
}

function generateTicketSvg(id: string, fillColor: string = "#FFF8F0", strokeColor: string = "#D4C8BC"): string {
  switch (id) {
    case "ticket-classic":
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="160" height="70" viewBox="0 0 160 70">
          <defs>
            <clipPath id="ticket-clip">
              <path d="M 8 0 L 152 0 Q 160 0 160 8 L 160 27 Q 152 27 152 35 Q 152 43 160 43 L 160 62 Q 160 70 152 70 L 8 70 Q 0 70 0 62 L 0 43 Q 8 43 8 35 Q 8 27 0 27 L 0 8 Q 0 0 8 0"/>
            </clipPath>
          </defs>
          <path d="M 8 0 L 152 0 Q 160 0 160 8 L 160 27 Q 152 27 152 35 Q 152 43 160 43 L 160 62 Q 160 70 152 70 L 8 70 Q 0 70 0 62 L 0 43 Q 8 43 8 35 Q 8 27 0 27 L 0 8 Q 0 0 8 0" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2" stroke-dasharray="4 2"/>
        </svg>
      `;
    case "label-tag":
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="60" viewBox="0 0 100 60">
          <path d="M 15 5 L 85 5 Q 95 5 95 15 L 95 45 Q 95 55 85 55 L 15 55 Q 5 55 5 45 L 5 30 L 0 30 L 5 25 L 5 15 Q 5 5 15 5" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2"/>
          <circle cx="15" cy="30" r="4" fill="${strokeColor}"/>
        </svg>
      `;
    default:
      return "";
  }
}

function generateBubbleSvg(id: string, fillColor: string = "#FFFFFF", strokeColor: string = "#D4C8BC"): string {
  switch (id) {
    case "bubble-speech":
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="150" height="100" viewBox="0 0 150 100">
          <path d="M 20 10 L 130 10 Q 140 10 140 20 L 140 60 Q 140 70 130 70 L 50 70 L 30 90 L 35 70 L 20 70 Q 10 70 10 60 L 10 20 Q 10 10 20 10" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2"/>
        </svg>
      `;
    case "bubble-thought":
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="150" height="110" viewBox="0 0 150 110">
          <ellipse cx="75" cy="40" rx="65" ry="35" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2"/>
          <ellipse cx="35" cy="85" rx="10" ry="8" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2"/>
          <ellipse cx="18" cy="100" rx="6" ry="5" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2"/>
        </svg>
      `;
    default:
      return "";
  }
}

function generateFrameSvg(id: string, strokeColor: string = "#D4C8BC"): string {
  switch (id) {
    case "frame-scallop":
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="140" height="100" viewBox="0 0 140 100">
          <path d="M 20 10
            Q 10 10 10 20 Q 10 30 10 35 Q 0 35 0 50 Q 0 65 10 65 Q 10 70 10 80 Q 10 90 20 90
            Q 30 100 50 90 Q 70 100 90 90 Q 110 100 120 90
            Q 130 90 130 80 Q 130 70 130 65 Q 140 65 140 50 Q 140 35 130 35 Q 130 30 130 20 Q 130 10 120 10
            Q 110 0 90 10 Q 70 0 50 10 Q 30 0 20 10"
            fill="none" stroke="${strokeColor}" stroke-width="2.5"/>
        </svg>
      `;
    case "frame-bracket":
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="140" height="90" viewBox="0 0 140 90">
          <path d="M 15 10 L 5 10 L 5 45 L 0 45 L 5 45 L 5 80 L 15 80" fill="none" stroke="${strokeColor}" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M 125 10 L 135 10 L 135 45 L 140 45 L 135 45 L 135 80 L 125 80" fill="none" stroke="${strokeColor}" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      `;
    default:
      return "";
  }
}

// Generate data URL for a shape
export function generateShapeDataUrl(shape: Shape): string {
  let svg = "";

  switch (shape.type) {
    case "banner":
      svg = generateBannerSvg(shape.id);
      break;
    case "ticket":
      svg = generateTicketSvg(shape.id);
      break;
    case "bubble":
      svg = generateBubbleSvg(shape.id);
      break;
    case "frame":
      svg = generateFrameSvg(shape.id);
      break;
  }

  if (!svg) return "";

  return `data:image/svg+xml,${encodeURIComponent(svg.trim().replace(/\s+/g, " "))}`;
}

// Group shapes by type
export function getShapesByType() {
  return {
    banners: shapes.filter((s) => s.type === "banner"),
    tickets: shapes.filter((s) => s.type === "ticket"),
    bubbles: shapes.filter((s) => s.type === "bubble"),
    frames: shapes.filter((s) => s.type === "frame"),
  };
}
