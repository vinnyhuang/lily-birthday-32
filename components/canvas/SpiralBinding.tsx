"use client";

import { Group, Rect, Ellipse, Line } from "react-konva";

interface SpiralBindingProps {
  canvasWidth: number;
  canvasHeight: number;
}

export function SpiralBinding({ canvasWidth, canvasHeight }: SpiralBindingProps) {
  const centerX = canvasWidth / 2;
  const bindingWidth = 24;
  const ringSpacing = 40;
  const ringCount = Math.floor((canvasHeight - 60) / ringSpacing);
  const startY = (canvasHeight - (ringCount - 1) * ringSpacing) / 2;

  // Generate ring positions
  const rings = Array.from({ length: ringCount }, (_, i) => startY + i * ringSpacing);

  return (
    <Group listening={false}>
      {/* Shadow under binding */}
      <Rect
        x={centerX - bindingWidth / 2 - 4}
        y={0}
        width={bindingWidth + 8}
        height={canvasHeight}
        fill="rgba(0,0,0,0.08)"
      />

      {/* Main binding strip (dark gray) */}
      <Rect
        x={centerX - bindingWidth / 2}
        y={0}
        width={bindingWidth}
        height={canvasHeight}
        fill="#3D3D3D"
      />

      {/* Binding edge highlights */}
      <Line
        points={[centerX - bindingWidth / 2, 0, centerX - bindingWidth / 2, canvasHeight]}
        stroke="#2D2D2D"
        strokeWidth={1}
      />
      <Line
        points={[centerX + bindingWidth / 2, 0, centerX + bindingWidth / 2, canvasHeight]}
        stroke="#4D4D4D"
        strokeWidth={1}
      />

      {/* Spiral rings */}
      {rings.map((y, index) => (
        <Group key={index}>
          {/* Ring hole in binding */}
          <Ellipse
            x={centerX}
            y={y}
            radiusX={8}
            radiusY={4}
            fill="#2A2A2A"
          />

          {/* Single metal coil ring */}
          <Ellipse
            x={centerX}
            y={y}
            radiusX={14}
            radiusY={7}
            stroke="#B0B0B0"
            strokeWidth={3}
            fill="transparent"
          />

          {/* Coil highlight (metallic shine) */}
          <Ellipse
            x={centerX}
            y={y - 1}
            radiusX={12}
            radiusY={5}
            stroke="#D8D8D8"
            strokeWidth={1}
            fill="transparent"
          />

          {/* Coil shadow */}
          <Ellipse
            x={centerX}
            y={y + 2}
            radiusX={13}
            radiusY={6}
            stroke="#888888"
            strokeWidth={1}
            fill="transparent"
          />
        </Group>
      ))}

      {/* Page fold shadows (subtle crease effect near binding) */}
      <Rect
        x={centerX - bindingWidth / 2 - 20}
        y={0}
        width={20}
        height={canvasHeight}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: 20, y: 0 }}
        fillLinearGradientColorStops={[0, "rgba(0,0,0,0.03)", 1, "rgba(0,0,0,0)"]}
      />
      <Rect
        x={centerX + bindingWidth / 2}
        y={0}
        width={20}
        height={canvasHeight}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: 20, y: 0 }}
        fillLinearGradientColorStops={[0, "rgba(0,0,0,0)", 1, "rgba(0,0,0,0.03)"]}
      />
    </Group>
  );
}
