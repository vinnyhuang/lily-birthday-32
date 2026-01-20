"use client";

import { Group, Rect, Circle, Arc } from "react-konva";

interface SpiralBindingProps {
  canvasWidth: number;
  canvasHeight: number;
}

export function SpiralBinding({ canvasWidth, canvasHeight }: SpiralBindingProps) {
  const centerX = canvasWidth / 2;
  const ringSpacing = 28;
  const ringCount = Math.floor(canvasHeight / ringSpacing);
  const startY = ringSpacing / 2; // Start at half spacing so rings are centered vertically

  // Ring dimensions
  const ringRadiusX = 10;
  const holeRadius = 4;
  const holeOffsetX = 10; // Distance from center to each hole

  // Generate ring positions
  const rings = Array.from({ length: ringCount }, (_, i) => startY + i * ringSpacing);

  const stripWidth = 6;
  const foldShadowWidth = 14;

  return (
    <Group listening={false}>
      {/* Narrow center strip matching page background */}
      <Rect
        x={centerX - stripWidth / 2}
        y={0}
        width={stripWidth}
        height={canvasHeight}
        fill="#FDF8F3"
      />

      {/* Ring holes and rings */}
      {rings.map((y, index) => (
        <Group key={index}>
          {/* Left hole (dark circle where ring passes through) */}
          <Circle
            x={centerX - holeOffsetX}
            y={y}
            radius={holeRadius}
            fill="#2A2522"
          />
          {/* Left hole inner shadow */}
          <Circle
            x={centerX - holeOffsetX}
            y={y - 0.5}
            radius={holeRadius - 1}
            fill="#1A1815"
          />

          {/* Right hole (dark circle where ring passes through) */}
          <Circle
            x={centerX + holeOffsetX}
            y={y}
            radius={holeRadius}
            fill="#2A2522"
          />
          {/* Right hole inner shadow */}
          <Circle
            x={centerX + holeOffsetX}
            y={y - 0.5}
            radius={holeRadius - 1}
            fill="#1A1815"
          />

          {/* Top half of ring - main coil (180 degrees, facing up) */}
          <Arc
            x={centerX}
            y={y}
            innerRadius={ringRadiusX - 1.5}
            outerRadius={ringRadiusX + 1.5}
            angle={180}
            rotation={180}
            fill="#B8B8B8"
          />

          {/* Ring highlight (metallic shine on top) */}
          <Arc
            x={centerX}
            y={y - 0.5}
            innerRadius={ringRadiusX - 1}
            outerRadius={ringRadiusX}
            angle={160}
            rotation={190}
            fill="#D8D8D8"
          />

          {/* Ring shadow (darker edge at bottom of visible arc) */}
          <Arc
            x={centerX}
            y={y + 0.5}
            innerRadius={ringRadiusX + 0.5}
            outerRadius={ringRadiusX + 1.5}
            angle={140}
            rotation={200}
            fill="#888888"
          />
        </Group>
      ))}

      {/* Page fold shadows (subtle crease effect near binding) */}
      <Rect
        x={centerX - stripWidth / 2 - foldShadowWidth}
        y={0}
        width={foldShadowWidth}
        height={canvasHeight}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: foldShadowWidth, y: 0 }}
        fillLinearGradientColorStops={[0, "rgba(0,0,0,0.04)", 1, "rgba(0,0,0,0)"]}
      />
      <Rect
        x={centerX + stripWidth / 2}
        y={0}
        width={foldShadowWidth}
        height={canvasHeight}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: foldShadowWidth, y: 0 }}
        fillLinearGradientColorStops={[0, "rgba(0,0,0,0)", 1, "rgba(0,0,0,0.04)"]}
      />
    </Group>
  );
}
