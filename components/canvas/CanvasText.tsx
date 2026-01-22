"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { Text, Transformer, Group, Rect, Shape } from "react-konva";
import Konva from "konva";
import { CanvasTextElement, SnapResult, ContainerShape } from "@/lib/canvas/types";

// Draw container shape based on type
function drawContainerShape(
  ctx: Konva.Context,
  shape: Konva.Shape,
  shapeType: ContainerShape,
  width: number,
  height: number,
  fillColor: string,
  cornerRadius: number
) {
  ctx.beginPath();

  switch (shapeType) {
    case "oval": {
      // Ellipse/oval shape
      ctx.ellipse(
        width / 2,
        height / 2,
        width / 2,
        height / 2,
        0, 0, Math.PI * 2
      );
      ctx.closePath();
      ctx.fillStrokeShape(shape);
      break;
    }

    case "pill": {
      // Pill shape (rectangle with fully rounded ends)
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
      // Heart shape
      const heartWidth = width;
      const heartHeight = height;
      const topCurveHeight = heartHeight * 0.3;

      ctx.moveTo(heartWidth / 2, heartHeight);
      // Left side
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
      // Right side
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
      // 5-pointed star
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
      // Scalloped rectangle with wavy edges
      const scallops = Math.max(3, Math.floor(width / 40));
      const scallopsV = Math.max(2, Math.floor(height / 40));
      const scallopWidth = width / scallops;
      const scallopHeight = height / scallopsV;
      const depth = Math.min(8, Math.min(scallopWidth, scallopHeight) * 0.3);

      // Top edge
      ctx.moveTo(0, depth);
      for (let i = 0; i < scallops; i++) {
        const x1 = i * scallopWidth;
        const x2 = (i + 0.5) * scallopWidth;
        const x3 = (i + 1) * scallopWidth;
        ctx.quadraticCurveTo(x2, -depth, x3, depth);
      }

      // Right edge
      for (let i = 0; i < scallopsV; i++) {
        const y1 = i * scallopHeight + depth;
        const y2 = (i + 0.5) * scallopHeight + depth;
        const y3 = (i + 1) * scallopHeight + depth;
        ctx.quadraticCurveTo(width + depth, y2, width, y3);
      }

      // Bottom edge (right to left)
      for (let i = scallops - 1; i >= 0; i--) {
        const x1 = (i + 1) * scallopWidth;
        const x2 = (i + 0.5) * scallopWidth;
        const x3 = i * scallopWidth;
        ctx.quadraticCurveTo(x2, height + depth, x3, height - depth);
      }

      // Left edge (bottom to top)
      for (let i = scallopsV - 1; i >= 0; i--) {
        const y1 = (i + 1) * scallopHeight + depth;
        const y2 = (i + 0.5) * scallopHeight + depth;
        const y3 = i * scallopHeight + depth;
        ctx.quadraticCurveTo(-depth, y2, 0, y3);
      }

      ctx.closePath();
      ctx.fillStrokeShape(shape);
      break;
    }

    case "starburst": {
      // Starburst/explosion shape
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
      // Cloud shape with bumpy top
      const baseY = height * 0.75;

      // Start at bottom left
      ctx.moveTo(width * 0.1, baseY);

      // Bottom edge
      ctx.lineTo(width * 0.9, baseY);

      // Right bump
      ctx.bezierCurveTo(
        width, baseY,
        width, height * 0.5,
        width * 0.85, height * 0.4
      );

      // Top right bump
      ctx.bezierCurveTo(
        width * 0.95, height * 0.2,
        width * 0.75, height * 0.1,
        width * 0.6, height * 0.2
      );

      // Top middle bump
      ctx.bezierCurveTo(
        width * 0.55, 0,
        width * 0.35, 0,
        width * 0.3, height * 0.2
      );

      // Top left bump
      ctx.bezierCurveTo(
        width * 0.15, height * 0.1,
        0, height * 0.25,
        width * 0.1, height * 0.45
      );

      // Left edge back to start
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
      // Right-pointing arrow shape
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
      // Ribbon banner with folded ends
      const foldWidth = Math.min(20, width * 0.1);
      const foldHeight = Math.min(15, height * 0.25);

      // Main banner body
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
      // Flag banner with pointed bottom
      const pointHeight = Math.min(20, height * 0.25);

      ctx.moveTo(0, 0);
      ctx.lineTo(width, 0);
      ctx.lineTo(width, height - pointHeight);
      ctx.lineTo(width / 2, height);
      ctx.lineTo(0, height - pointHeight);
      ctx.closePath();
      ctx.fillStrokeShape(shape);
      break;
    }

    case "ticket-classic": {
      // Ticket with notched sides
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

    case "label-tag": {
      // Tag with left point and hole
      const pointWidth = Math.min(20, width * 0.15);
      const holeRadius = Math.min(5, height * 0.08);
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
      ctx.arc(pointWidth + holeRadius + 5, height / 2, holeRadius, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.fill();
      break;
    }

    case "bubble-speech": {
      // Speech bubble with tail
      const tailWidth = Math.min(20, width * 0.15);
      const tailHeight = Math.min(20, height * 0.25);
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

    case "bubble-thought": {
      // Thought bubble with cloud shape and dots
      const cloudScale = 0.85;
      const cloudWidth = width * cloudScale;
      const cloudHeight = height * 0.75;
      const offsetX = (width - cloudWidth) / 2;
      const offsetY = 0;

      // Main cloud (ellipse approximation with bumps)
      ctx.ellipse(
        offsetX + cloudWidth / 2,
        offsetY + cloudHeight / 2,
        cloudWidth / 2,
        cloudHeight / 2,
        0, 0, Math.PI * 2
      );
      ctx.fillStrokeShape(shape);

      // Thought dots
      const dotY = height * 0.85;
      ctx.beginPath();
      ctx.arc(width * 0.25, dotY, Math.min(8, width * 0.05), 0, Math.PI * 2);
      ctx.fillStrokeShape(shape);

      ctx.beginPath();
      ctx.arc(width * 0.15, height * 0.95, Math.min(5, width * 0.03), 0, Math.PI * 2);
      ctx.fillStrokeShape(shape);
      break;
    }

    case "rectangle":
    default: {
      // Simple rounded rectangle
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

interface CanvasTextProps {
  element: CanvasTextElement;
  isSelected: boolean;
  readOnly?: boolean;
  onSelect?: (e?: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onChange?: (updates: Partial<CanvasTextElement>) => void;
  onDragStart?: () => void;
  onDragMove?: (newX: number, newY: number) => SnapResult;
  onDragEnd?: () => void;
  onTransform?: (scaleX: number, scaleY: number) => void;
}

export function CanvasText({
  element,
  isSelected,
  readOnly,
  onSelect,
  onChange,
  onDragStart,
  onDragMove,
  onDragEnd,
  onTransform,
}: CanvasTextProps) {
  const groupRef = useRef<Konva.Group>(null);
  const boundsRectRef = useRef<Konva.Rect>(null);
  const textRef = useRef<Konva.Text>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [textHeight, setTextHeight] = useState(element.height);

  // Compute Konva fontStyle from separate weight/style
  const konvaFontStyle = useMemo(() => {
    const parts: string[] = [];
    if (element.fontStyle === "italic") parts.push("italic");
    if (element.fontWeight === "bold") parts.push("bold");
    return parts.join(" ") || "normal";
  }, [element.fontStyle, element.fontWeight]);

  // Update text height when text changes (for vertical alignment calculation)
  useEffect(() => {
    if (textRef.current) {
      const node = textRef.current as Konva.Text;
      const measuredHeight = node.height();
      if (measuredHeight !== textHeight) {
        setTextHeight(measuredHeight);
      }
    }
  }, [element.text, element.fontSize, element.fontFamily, element.width, element.backgroundPadding, textHeight]);

  // Attach transformer to the bounds rect (not the group) so it doesn't expand with overflowing text
  useEffect(() => {
    if (isSelected && transformerRef.current && boundsRectRef.current && !isEditing) {
      transformerRef.current.nodes([boundsRectRef.current]);
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

  // Handle transform end - reads from boundsRect which is what the transformer attaches to
  const handleTransformEnd = () => {
    const boundsNode = boundsRectRef.current;
    const groupNode = groupRef.current;
    if (!boundsNode || !groupNode) return;

    const scaleX = boundsNode.scaleX();
    const scaleY = boundsNode.scaleY();

    // Get the absolute position of the bounds rect
    const absPos = boundsNode.absolutePosition();

    // Calculate new rotation: element's current rotation + any rotation added by transform
    // boundsNode.rotation() is the local rotation delta from the transform
    const newRotation = element.rotation + boundsNode.rotation();

    // Reset the bounds rect transforms (it should always be at 0,0 with no rotation relative to Group)
    boundsNode.scaleX(1);
    boundsNode.scaleY(1);
    boundsNode.x(0);
    boundsNode.y(0);
    boundsNode.rotation(0);

    // Update element with new dimensions and rotation
    onChange?.({
      x: absPos.x,
      y: absPos.y,
      width: Math.max(50, element.width * scaleX),
      height: Math.max(30, element.height * scaleY),
      rotation: newRotation,
    });
  };

  const handleDoubleClick = () => {
    const groupNode = groupRef.current;
    if (!groupNode) return;

    setIsEditing(true);

    const stage = groupNode.getStage();
    if (!stage) return;

    const stageBox = stage.container().getBoundingClientRect();

    // Create textarea for editing - positioned at center top of canvas
    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);

    // Calculate editor width and position (centered at top of canvas)
    const editorWidth = Math.min(400, stageBox.width * 0.8);
    const editorLeft = stageBox.left + (stageBox.width - editorWidth) / 2;
    const editorTop = stageBox.top + 20; // 20px from top of canvas

    textarea.value = element.text;
    textarea.style.position = "absolute";
    textarea.style.top = `${editorTop}px`;
    textarea.style.left = `${editorLeft}px`;
    textarea.style.width = `${editorWidth}px`;
    textarea.style.minHeight = "60px";
    textarea.style.maxHeight = "200px";
    textarea.style.fontSize = `${Math.min(24, element.fontSize)}px`;
    textarea.style.fontFamily = element.fontFamily;
    textarea.style.fontWeight = element.fontWeight || "normal";
    textarea.style.fontStyle = element.fontStyle || "normal";
    textarea.style.textDecoration = element.textDecoration === "underline" ? "underline" : "none";
    textarea.style.color = element.fill;
    textarea.style.textAlign = element.align || "left";
    textarea.style.lineHeight = String(element.lineHeight || 1.2);
    textarea.style.border = "2px solid #F97066";
    textarea.style.borderRadius = "8px";
    textarea.style.padding = "12px";
    textarea.style.background = "white";
    textarea.style.outline = "none";
    textarea.style.resize = "vertical";
    textarea.style.zIndex = "1000";
    textarea.style.boxShadow = "0 4px 20px rgba(0,0,0,0.15)";

    textarea.focus();
    textarea.select();

    const handleBlur = () => {
      onChange?.({ text: textarea.value || "Text" });
      document.body.removeChild(textarea);
      setIsEditing(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || (e.key === "Enter" && !e.shiftKey)) {
        textarea.blur();
      }
    };

    textarea.addEventListener("blur", handleBlur);
    textarea.addEventListener("keydown", handleKeyDown);
  };

  // Background and text layout
  // The text box is element.width x element.height
  // Background fills the entire box
  // Text is inset by padding and uses remaining width
  const padding = element.backgroundPadding || 0;
  const cornerRadius = element.backgroundCornerRadius || 0;
  const containerShape = element.containerShape || "rectangle";
  const hasContainer = !!element.backgroundColor;
  const textWidth = Math.max(10, element.width - padding * 2);
  const textAreaHeight = element.height - padding * 2;

  // Calculate vertical alignment offset within the text box
  // Text can overflow past the top (bottom align) or both edges (middle align)
  const verticalAlignOffset = useMemo(() => {
    if (!element.verticalAlign || element.verticalAlign === "top") return 0;
    const availableHeight = textAreaHeight;
    const textActualHeight = textHeight;
    if (element.verticalAlign === "middle") {
      // Center text - can overflow both top and bottom
      return (availableHeight - textActualHeight) / 2;
    }
    if (element.verticalAlign === "bottom") {
      // Align to bottom - can overflow past top
      return availableHeight - textActualHeight;
    }
    return 0;
  }, [element.verticalAlign, textAreaHeight, textHeight]);

  // Common text properties
  const textProps = {
    text: element.text,
    fontSize: element.fontSize,
    fontFamily: element.fontFamily,
    fontStyle: konvaFontStyle,
    fill: element.fill,
    align: element.align,
    width: textWidth,
    lineHeight: element.lineHeight || 1.2,
    textDecoration: element.textDecoration === "underline" ? "underline" : undefined,
  };

  return (
    <>
      <Group
        ref={groupRef}
        x={element.x}
        y={element.y}
        rotation={element.rotation}
        draggable={!readOnly}
        onClick={readOnly ? undefined : (e) => onSelect?.(e)}
        onTap={readOnly ? undefined : (e) => onSelect?.(e)}
        onDblClick={readOnly ? undefined : handleDoubleClick}
        onDblTap={readOnly ? undefined : handleDoubleClick}
        onDragStart={readOnly ? undefined : handleDragStart}
        onDragMove={readOnly ? undefined : handleDragMove}
        onDragEnd={readOnly ? undefined : handleDragEnd}
        visible={!isEditing}
      >
        {/* Invisible bounds rect for transformer attachment */}
        <Rect
          ref={boundsRectRef}
          x={0}
          y={0}
          width={element.width}
          height={element.height}
          fill="transparent"
          onTransformEnd={handleTransformEnd}
        />

        {/* Container shape (background) */}
        {hasContainer && (
          containerShape === "rectangle" ? (
            <Rect
              x={0}
              y={0}
              width={element.width}
              height={element.height}
              fill={element.backgroundColor}
              cornerRadius={cornerRadius}
              listening={false}
            />
          ) : (
            <Shape
              x={0}
              y={0}
              fill={element.backgroundColor}
              sceneFunc={(ctx, shape) => {
                drawContainerShape(
                  ctx,
                  shape,
                  containerShape,
                  element.width,
                  element.height,
                  element.backgroundColor || "#FFFFFF",
                  cornerRadius
                );
              }}
              listening={false}
            />
          )
        )}

        {/* Text element - can overflow the bounds rect */}
        <Text
          ref={textRef}
          x={padding}
          y={padding + verticalAlignOffset}
          {...textProps}
          listening={false}
        />
      </Group>

      {isSelected && !isEditing && !readOnly && (
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
            if (newBox.width < 50 || newBox.height < 30) {
              return oldBox;
            }
            return newBox;
          }}
          onTransform={() => {
            const node = boundsRectRef.current;
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
