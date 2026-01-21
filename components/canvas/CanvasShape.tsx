"use client";

import { useRef, useEffect } from "react";
import { Group, Rect, Shape, Transformer } from "react-konva";
import Konva from "konva";
import { CanvasShapeElement, ShapeType, SnapResult } from "@/lib/canvas/types";

// Draw shape based on type
function drawShape(
  ctx: Konva.Context,
  shape: Konva.Shape,
  shapeType: ShapeType,
  width: number,
  height: number,
  fillColor: string,
  cornerRadius: number
) {
  ctx.beginPath();

  switch (shapeType) {
    case "oval": {
      ctx.ellipse(width / 2, height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fillStrokeShape(shape);
      break;
    }

    case "pill": {
      const pillRadius = Math.min(width, height) / 2;
      ctx.moveTo(pillRadius, 0);
      ctx.lineTo(width - pillRadius, 0);
      ctx.arcTo(width, 0, width, pillRadius, pillRadius);
      ctx.lineTo(width, height - pillRadius);
      ctx.arcTo(width, height, width - pillRadius, height, pillRadius);
      ctx.lineTo(pillRadius, height);
      ctx.arcTo(0, height, 0, height - pillRadius, pillRadius);
      ctx.lineTo(0, pillRadius);
      ctx.arcTo(0, 0, pillRadius, 0, pillRadius);
      ctx.closePath();
      ctx.fillStrokeShape(shape);
      break;
    }

    case "heart": {
      const heartWidth = width;
      const heartHeight = height;
      const topCurveHeight = heartHeight * 0.3;

      ctx.moveTo(heartWidth / 2, heartHeight);
      ctx.bezierCurveTo(
        heartWidth * 0.1, heartHeight * 0.7,
        0, topCurveHeight,
        heartWidth / 4, topCurveHeight * 0.3
      );
      ctx.bezierCurveTo(
        heartWidth * 0.4, 0,
        heartWidth / 2, topCurveHeight * 0.5,
        heartWidth / 2, topCurveHeight
      );
      ctx.bezierCurveTo(
        heartWidth / 2, topCurveHeight * 0.5,
        heartWidth * 0.6, 0,
        heartWidth * 0.75, topCurveHeight * 0.3
      );
      ctx.bezierCurveTo(
        heartWidth, topCurveHeight,
        heartWidth * 0.9, heartHeight * 0.7,
        heartWidth / 2, heartHeight
      );
      ctx.closePath();
      ctx.fillStrokeShape(shape);
      break;
    }

    case "star": {
      const cx = width / 2;
      const cy = height / 2;
      const outerRadius = Math.min(width, height) / 2;
      const innerRadius = outerRadius * 0.4;
      const points = 5;

      for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (Math.PI / points) * i - Math.PI / 2;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fillStrokeShape(shape);
      break;
    }

    case "scalloped": {
      const scallops = Math.max(3, Math.floor(width / 40));
      const scallopsV = Math.max(2, Math.floor(height / 40));
      const scallopWidth = width / scallops;
      const scallopHeight = height / scallopsV;
      const depth = Math.min(8, Math.min(scallopWidth, scallopHeight) * 0.3);

      ctx.moveTo(0, depth);
      for (let i = 0; i < scallops; i++) {
        const x2 = (i + 0.5) * scallopWidth;
        const x3 = (i + 1) * scallopWidth;
        ctx.quadraticCurveTo(x2, -depth, x3, depth);
      }

      for (let i = 0; i < scallopsV; i++) {
        const y2 = (i + 0.5) * scallopHeight + depth;
        const y3 = (i + 1) * scallopHeight + depth;
        ctx.quadraticCurveTo(width + depth, y2, width, y3);
      }

      for (let i = scallops - 1; i >= 0; i--) {
        const x2 = (i + 0.5) * scallopWidth;
        const x3 = i * scallopWidth;
        ctx.quadraticCurveTo(x2, height + depth, x3, height - depth);
      }

      for (let i = scallopsV - 1; i >= 0; i--) {
        const y2 = (i + 0.5) * scallopHeight + depth;
        const y3 = i * scallopHeight + depth;
        ctx.quadraticCurveTo(-depth, y2, 0, y3);
      }

      ctx.closePath();
      ctx.fillStrokeShape(shape);
      break;
    }

    case "starburst": {
      const cx = width / 2;
      const cy = height / 2;
      const outerRadiusX = width / 2;
      const outerRadiusY = height / 2;
      const innerRadiusX = width * 0.35;
      const innerRadiusY = height * 0.35;
      const points = 12;

      for (let i = 0; i < points * 2; i++) {
        const rx = i % 2 === 0 ? outerRadiusX : innerRadiusX;
        const ry = i % 2 === 0 ? outerRadiusY : innerRadiusY;
        const angle = (Math.PI / points) * i - Math.PI / 2;
        const x = cx + Math.cos(angle) * rx;
        const y = cy + Math.sin(angle) * ry;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fillStrokeShape(shape);
      break;
    }

    case "cloud": {
      const baseY = height * 0.75;

      ctx.moveTo(width * 0.1, baseY);
      ctx.lineTo(width * 0.9, baseY);

      ctx.bezierCurveTo(
        width, baseY,
        width, height * 0.5,
        width * 0.85, height * 0.4
      );
      ctx.bezierCurveTo(
        width * 0.95, height * 0.2,
        width * 0.75, height * 0.1,
        width * 0.6, height * 0.2
      );
      ctx.bezierCurveTo(
        width * 0.55, 0,
        width * 0.35, 0,
        width * 0.3, height * 0.2
      );
      ctx.bezierCurveTo(
        width * 0.15, height * 0.1,
        0, height * 0.25,
        width * 0.1, height * 0.45
      );
      ctx.bezierCurveTo(
        0, height * 0.55,
        0, baseY,
        width * 0.1, baseY
      );

      ctx.closePath();
      ctx.fillStrokeShape(shape);
      break;
    }

    case "arrow": {
      const arrowHeadWidth = Math.min(width * 0.35, height * 0.5);
      const shaftHeight = height * 0.4;
      const shaftTop = (height - shaftHeight) / 2;
      const shaftBottom = shaftTop + shaftHeight;
      const arrowBodyEnd = width - arrowHeadWidth;

      ctx.moveTo(0, shaftTop);
      ctx.lineTo(arrowBodyEnd, shaftTop);
      ctx.lineTo(arrowBodyEnd, 0);
      ctx.lineTo(width, height / 2);
      ctx.lineTo(arrowBodyEnd, height);
      ctx.lineTo(arrowBodyEnd, shaftBottom);
      ctx.lineTo(0, shaftBottom);
      ctx.closePath();
      ctx.fillStrokeShape(shape);
      break;
    }

    case "banner-ribbon": {
      const foldWidth = Math.min(20, width * 0.1);
      const foldHeight = Math.min(15, height * 0.25);

      ctx.moveTo(foldWidth, 0);
      ctx.lineTo(width - foldWidth, 0);
      ctx.lineTo(width - foldWidth, height);
      ctx.lineTo(foldWidth, height);
      ctx.closePath();
      ctx.fillStrokeShape(shape);

      // Left fold (darker)
      ctx.beginPath();
      ctx.moveTo(0, foldHeight);
      ctx.lineTo(foldWidth, 0);
      ctx.lineTo(foldWidth, height);
      ctx.lineTo(0, height - foldHeight);
      ctx.closePath();
      ctx.fillStyle = shadeColor(fillColor, -20);
      ctx.fill();

      // Right fold (darker)
      ctx.beginPath();
      ctx.moveTo(width, foldHeight);
      ctx.lineTo(width - foldWidth, 0);
      ctx.lineTo(width - foldWidth, height);
      ctx.lineTo(width, height - foldHeight);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case "banner-flag": {
      const pointHeight = Math.min(30, height * 0.2);

      ctx.moveTo(0, 0);
      ctx.lineTo(width, 0);
      ctx.lineTo(width, height - pointHeight);
      ctx.lineTo(width / 2, height);
      ctx.lineTo(0, height - pointHeight);
      ctx.closePath();
      ctx.fillStrokeShape(shape);
      break;
    }

    case "ticket": {
      const notchRadius = Math.min(10, Math.min(width, height) * 0.1);
      const notchY = height / 2;
      const r = Math.min(cornerRadius, 8);

      ctx.moveTo(r, 0);
      ctx.lineTo(width - r, 0);
      ctx.arcTo(width, 0, width, r, r);
      ctx.lineTo(width, notchY - notchRadius);
      ctx.arc(width, notchY, notchRadius, -Math.PI / 2, Math.PI / 2, true);
      ctx.lineTo(width, height - r);
      ctx.arcTo(width, height, width - r, height, r);
      ctx.lineTo(r, height);
      ctx.arcTo(0, height, 0, height - r, r);
      ctx.lineTo(0, notchY + notchRadius);
      ctx.arc(0, notchY, notchRadius, Math.PI / 2, -Math.PI / 2, true);
      ctx.lineTo(0, r);
      ctx.arcTo(0, 0, r, 0, r);
      ctx.closePath();
      ctx.fillStrokeShape(shape);
      break;
    }

    case "tag": {
      const pointWidth = Math.min(25, width * 0.15);
      const holeRadius = Math.min(6, height * 0.08);
      const r = Math.min(cornerRadius, 8);

      ctx.moveTo(pointWidth, 0);
      ctx.lineTo(width - r, 0);
      ctx.arcTo(width, 0, width, r, r);
      ctx.lineTo(width, height - r);
      ctx.arcTo(width, height, width - r, height, r);
      ctx.lineTo(pointWidth, height);
      ctx.lineTo(0, height / 2);
      ctx.closePath();
      ctx.fillStrokeShape(shape);

      // Draw hole
      ctx.beginPath();
      ctx.arc(pointWidth + holeRadius + 6, height / 2, holeRadius, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.fill();
      break;
    }

    case "speech-bubble": {
      const tailWidth = Math.min(25, width * 0.15);
      const tailHeight = Math.min(25, height * 0.2);
      const bodyHeight = height - tailHeight;
      const r = Math.min(cornerRadius || 12, bodyHeight / 3);

      ctx.moveTo(r, 0);
      ctx.lineTo(width - r, 0);
      ctx.arcTo(width, 0, width, r, r);
      ctx.lineTo(width, bodyHeight - r);
      ctx.arcTo(width, bodyHeight, width - r, bodyHeight, r);
      ctx.lineTo(tailWidth + tailWidth, bodyHeight);
      ctx.lineTo(tailWidth * 0.5, height);
      ctx.lineTo(tailWidth, bodyHeight);
      ctx.lineTo(r, bodyHeight);
      ctx.arcTo(0, bodyHeight, 0, bodyHeight - r, r);
      ctx.lineTo(0, r);
      ctx.arcTo(0, 0, r, 0, r);
      ctx.closePath();
      ctx.fillStrokeShape(shape);
      break;
    }

    case "thought-bubble": {
      const cloudScale = 0.85;
      const cloudWidth = width * cloudScale;
      const cloudHeight = height * 0.75;
      const offsetX = (width - cloudWidth) / 2;

      ctx.ellipse(
        offsetX + cloudWidth / 2,
        cloudHeight / 2,
        cloudWidth / 2,
        cloudHeight / 2,
        0, 0, Math.PI * 2
      );
      ctx.fillStrokeShape(shape);

      // Thought dots
      ctx.beginPath();
      ctx.arc(width * 0.25, height * 0.85, Math.min(10, width * 0.06), 0, Math.PI * 2);
      ctx.fillStrokeShape(shape);

      ctx.beginPath();
      ctx.arc(width * 0.15, height * 0.95, Math.min(6, width * 0.04), 0, Math.PI * 2);
      ctx.fillStrokeShape(shape);
      break;
    }

    case "rectangle":
    default: {
      if (cornerRadius > 0) {
        const r = Math.min(cornerRadius, Math.min(width, height) / 2);
        ctx.moveTo(r, 0);
        ctx.lineTo(width - r, 0);
        ctx.arcTo(width, 0, width, r, r);
        ctx.lineTo(width, height - r);
        ctx.arcTo(width, height, width - r, height, r);
        ctx.lineTo(r, height);
        ctx.arcTo(0, height, 0, height - r, r);
        ctx.lineTo(0, r);
        ctx.arcTo(0, 0, r, 0, r);
      } else {
        ctx.rect(0, 0, width, height);
      }
      ctx.closePath();
      ctx.fillStrokeShape(shape);
      break;
    }
  }
}

// Helper to darken/lighten a color
function shadeColor(color: string, percent: number): string {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
}

interface CanvasShapeProps {
  element: CanvasShapeElement;
  isSelected: boolean;
  onSelect: (e?: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onChange: (updates: Partial<CanvasShapeElement>) => void;
  onDragStart?: () => void;
  onDragMove?: (newX: number, newY: number) => SnapResult;
  onDragEnd?: () => void;
  onTransform?: (scaleX: number, scaleY: number) => void;
}

export function CanvasShape({
  element,
  isSelected,
  onSelect,
  onChange,
  onDragStart,
  onDragMove,
  onDragEnd,
  onTransform,
}: CanvasShapeProps) {
  const groupRef = useRef<Konva.Group>(null);
  const shapeRef = useRef<Konva.Shape>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  // Attach transformer
  useEffect(() => {
    if (isSelected && transformerRef.current && shapeRef.current) {
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

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
    onChange({
      x: e.target.x(),
      y: e.target.y(),
    });
    onDragEnd?.();
  };

  const handleTransformEnd = () => {
    const node = shapeRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    onChange({
      x: node.x(),
      y: node.y(),
      width: Math.max(30, element.width * scaleX),
      height: Math.max(30, element.height * scaleY),
      rotation: node.rotation(),
    });
  };

  const cornerRadius = element.cornerRadius || 0;

  // Use Rect for simple rectangle, Shape for everything else
  const isSimpleRect = element.shapeType === "rectangle";

  return (
    <>
      <Group ref={groupRef}>
        {isSimpleRect ? (
          <Rect
            ref={shapeRef as React.RefObject<Konva.Rect>}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            rotation={element.rotation}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            cornerRadius={cornerRadius}
            opacity={element.opacity ?? 1}
            draggable
            onClick={(e) => onSelect(e)}
            onTap={(e) => onSelect(e)}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
            onTransformEnd={handleTransformEnd}
          />
        ) : (
          <Shape
            ref={shapeRef}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            rotation={element.rotation}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            opacity={element.opacity ?? 1}
            draggable
            onClick={(e) => onSelect(e)}
            onTap={(e) => onSelect(e)}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
            onTransformEnd={handleTransformEnd}
            sceneFunc={(ctx, shape) => {
              drawShape(
                ctx,
                shape,
                element.shapeType,
                element.width,
                element.height,
                element.fill,
                cornerRadius
              );
            }}
          />
        )}
      </Group>

      {isSelected && (
        <Transformer
          ref={transformerRef}
          rotateEnabled={true}
          enabledAnchors={[
            "top-left",
            "top-center",
            "top-right",
            "middle-left",
            "middle-right",
            "bottom-left",
            "bottom-center",
            "bottom-right",
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 30 || newBox.height < 30) {
              return oldBox;
            }
            return newBox;
          }}
          onTransform={() => {
            const node = shapeRef.current;
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
