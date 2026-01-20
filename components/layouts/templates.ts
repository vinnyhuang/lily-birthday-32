import { LayoutTemplate, LayoutType } from "@/lib/canvas/types";

// Generate grid layout positions
function generateGridPositions(
  count: number,
  canvasWidth: number,
  canvasHeight: number
) {
  if (count === 0) return [];

  const padding = 30;
  const gap = 20;
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);

  const availableWidth = canvasWidth - padding * 2 - gap * (cols - 1);
  const availableHeight = canvasHeight - padding * 2 - gap * (rows - 1);
  const cellWidth = availableWidth / cols;
  const cellHeight = availableHeight / rows;
  const size = Math.min(cellWidth, cellHeight);

  return Array.from({ length: count }, (_, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    return {
      x: padding + col * (size + gap),
      y: padding + row * (size + gap),
      width: size,
      height: size,
      rotation: 0,
    };
  });
}

// Generate collage layout with overlapping and rotations
function generateCollagePositions(
  count: number,
  canvasWidth: number,
  canvasHeight: number
) {
  if (count === 0) return [];

  const positions = [];
  const baseSize = Math.min(canvasWidth, canvasHeight) * 0.35;

  for (let i = 0; i < count; i++) {
    // Distribute across the canvas with some randomness
    const angle = (i / count) * Math.PI * 2;
    const radius = Math.min(canvasWidth, canvasHeight) * 0.25;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    // Size variation
    const sizeVariation = 0.8 + Math.random() * 0.4;
    const size = baseSize * sizeVariation;

    // Slight rotation for collage feel
    const rotation = (Math.random() - 0.5) * 20;

    positions.push({
      x: centerX + Math.cos(angle) * radius * (0.5 + Math.random() * 0.5) - size / 2,
      y: centerY + Math.sin(angle) * radius * (0.5 + Math.random() * 0.5) - size / 2,
      width: size,
      height: size,
      rotation,
    });
  }

  return positions;
}

// Generate hero layout (one large, rest small)
function generateHeroPositions(
  count: number,
  canvasWidth: number,
  canvasHeight: number
) {
  if (count === 0) return [];
  if (count === 1) {
    const padding = 40;
    return [
      {
        x: padding,
        y: padding,
        width: canvasWidth - padding * 2,
        height: canvasHeight - padding * 2,
        rotation: 0,
      },
    ];
  }

  const padding = 30;
  const gap = 20;

  // Hero takes up ~60% of height
  const heroHeight = canvasHeight * 0.55;
  const heroWidth = canvasWidth - padding * 2;

  // Rest go in a row below
  const restCount = count - 1;
  const restHeight = canvasHeight - heroHeight - padding * 2 - gap;
  const restWidth = (canvasWidth - padding * 2 - gap * (restCount - 1)) / restCount;
  const restSize = Math.min(restWidth, restHeight);

  const positions = [
    {
      x: padding,
      y: padding,
      width: heroWidth,
      height: heroHeight,
      rotation: 0,
    },
  ];

  for (let i = 0; i < restCount; i++) {
    positions.push({
      x: padding + i * (restSize + gap),
      y: padding + heroHeight + gap,
      width: restSize,
      height: restSize,
      rotation: 0,
    });
  }

  return positions;
}

// Generate freeform scattered layout
function generateFreeformPositions(
  count: number,
  canvasWidth: number,
  canvasHeight: number
) {
  if (count === 0) return [];

  const padding = 50;
  const baseSize = Math.min(canvasWidth, canvasHeight) * 0.3;

  return Array.from({ length: count }, () => {
    const size = baseSize * (0.7 + Math.random() * 0.6);
    const rotation = (Math.random() - 0.5) * 30;

    return {
      x: padding + Math.random() * (canvasWidth - size - padding * 2),
      y: padding + Math.random() * (canvasHeight - size - padding * 2),
      width: size,
      height: size,
      rotation,
    };
  });
}

export const layoutTemplates: Record<LayoutType, LayoutTemplate> = {
  grid: {
    id: "grid",
    name: "Grid",
    description: "Clean, organized layout",
    icon: "⊞",
    generatePositions: generateGridPositions,
  },
  collage: {
    id: "collage",
    name: "Collage",
    description: "Overlapping memories",
    icon: "🎴",
    generatePositions: generateCollagePositions,
  },
  hero: {
    id: "hero",
    name: "Hero",
    description: "Feature one photo",
    icon: "⭐",
    generatePositions: generateHeroPositions,
  },
  freeform: {
    id: "freeform",
    name: "Freeform",
    description: "Scattered & playful",
    icon: "✨",
    generatePositions: generateFreeformPositions,
  },
};
