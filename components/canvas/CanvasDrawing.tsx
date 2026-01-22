"use client";

import { useRef, useEffect, useMemo } from "react";
import { Line, Transformer, Group, Rect } from "react-konva";
import Konva from "konva";
import { CanvasDrawingElement, DrawingStroke, BrushType, SnapResult } from "@/lib/canvas/types";

// Calculate bounding box of all strokes
function calculateStrokesBounds(strokes: DrawingStroke[]): { minX: number; minY: number; maxX: number; maxY: number } {
  if (strokes.length === 0) {
    return { minX: 0, minY: 0, maxX: 100, maxY: 100 };
  }

  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  for (const stroke of strokes) {
    const halfWidth = stroke.width / 2;
    for (let i = 0; i < stroke.points.length; i += 2) {
      const x = stroke.points[i];
      const y = stroke.points[i + 1];
      minX = Math.min(minX, x - halfWidth);
      minY = Math.min(minY, y - halfWidth);
      maxX = Math.max(maxX, x + halfWidth);
      maxY = Math.max(maxY, y + halfWidth);
    }
  }

  // Add some padding
  const padding = 10;
  return {
    minX: minX - padding,
    minY: minY - padding,
    maxX: maxX + padding,
    maxY: maxY + padding,
  };
}

interface CanvasDrawingProps {
  element: CanvasDrawingElement;
  isSelected: boolean;
  isEditing?: boolean; // True when in drawing mode for this element
  readOnly?: boolean;
  onSelect?: (e?: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onChange?: (updates: Partial<CanvasDrawingElement>) => void;
  onDragStart?: () => void;
  onDragMove?: (newX: number, newY: number) => SnapResult;
  onDragEnd?: () => void;
  onTransform?: (scaleX: number, scaleY: number) => void;
}

// Get line cap based on brush type
function getBrushLineCap(brushType: BrushType): "round" | "square" {
  return brushType === "marker" ? "square" : "round";
}

// Get tension (smoothness) based on brush type
function getBrushTension(brushType: BrushType): number {
  return brushType === "marker" ? 0.3 : 0.5;
}

export function CanvasDrawing({
  element,
  isSelected,
  isEditing,
  readOnly,
  onSelect,
  onChange,
  onDragStart,
  onDragMove,
  onDragEnd,
  onTransform,
}: CanvasDrawingProps) {
  const groupRef = useRef<Konva.Group>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && !isEditing && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, isEditing, element.width, element.height, element.rotation]);

  const handleDragStart = () => {
    onDragStart?.();
  };

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (onDragMove) {
      const node = e.target;
      const result = onDragMove(node.x(), node.y());
      node.x(result.x);
      node.y(result.y);
    }
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onChange?.({
      x: e.target.x(),
      y: e.target.y(),
    });
    onDragEnd?.();
  };

  const handleTransformEnd = () => {
    const node = groupRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    onChange?.({
      x: node.x(),
      y: node.y(),
      width: Math.max(30, element.width * scaleX),
      height: Math.max(30, element.height * scaleY),
      rotation: node.rotation(),
    });
  };

  // When editing or readOnly, disable dragging
  const isDraggable = !readOnly && isSelected && !isEditing;

  // Calculate bounds for hit area
  const bounds = useMemo(() => calculateStrokesBounds(element.strokes), [element.strokes]);

  return (
    <>
      <Group
        ref={groupRef}
        x={element.x}
        y={element.y}
        rotation={element.rotation}
        scaleX={element.scaleX}
        scaleY={element.scaleY}
        draggable={isDraggable}
        onClick={readOnly ? undefined : (e) => !isEditing && onSelect?.(e)}
        onTap={readOnly ? undefined : (e) => !isEditing && onSelect?.(e)}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        {/* Transparent hit area for easier selection */}
        <Rect
          x={bounds.minX}
          y={bounds.minY}
          width={bounds.maxX - bounds.minX}
          height={bounds.maxY - bounds.minY}
          fill="transparent"
          listening={!isEditing}
        />
        {/* Render each stroke as a Line */}
        {element.strokes.map((stroke) => (
          <Line
            key={stroke.id}
            points={stroke.points}
            stroke={stroke.color}
            strokeWidth={stroke.width}
            opacity={stroke.opacity}
            lineCap={getBrushLineCap(stroke.brushType)}
            lineJoin="round"
            tension={getBrushTension(stroke.brushType)}
            globalCompositeOperation="source-over"
            listening={false} // Strokes don't capture events
          />
        ))}
      </Group>
      {isSelected && !isEditing && !readOnly && (
        <Transformer
          ref={transformerRef}
          rotateEnabled={true}
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
            "middle-left",
            "middle-right",
            "top-center",
            "bottom-center",
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 30 || newBox.height < 30) {
              return oldBox;
            }
            return newBox;
          }}
          onTransform={() => {
            const node = groupRef.current;
            if (node && onTransform) {
              onTransform(node.scaleX(), node.scaleY());
            }
          }}
          onTransformEnd={() => {
            if (onTransform) {
              onTransform(1, 1);
            }
          }}
          anchorSize={10}
          anchorCornerRadius={5}
          borderStroke="#F97066"
          borderStrokeWidth={2}
          anchorStroke="#F97066"
          anchorFill="#fff"
        />
      )}
    </>
  );
}
