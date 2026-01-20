"use client";

import { useRef, useEffect, useMemo } from "react";
import { Image, Transformer, Group, Rect, Line } from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import { CanvasImageElement, SnapResult, FrameStyle } from "@/lib/canvas/types";
import { generateTapeDataUrl } from "@/lib/canvas/frames";

interface CanvasImageProps {
  element: CanvasImageElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<CanvasImageElement>) => void;
  onDragStart?: () => void;
  onDragMove?: (newX: number, newY: number) => SnapResult;
  onDragEnd?: () => void;
}

export function CanvasImage({
  element,
  isSelected,
  onSelect,
  onChange,
  onDragStart,
  onDragMove,
  onDragEnd,
}: CanvasImageProps) {
  const [image] = useImage(element.src, "anonymous");
  const groupRef = useRef<Konva.Group>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  // Load tape images for "taped" frame style
  const tapeUrl1 = useMemo(
    () => generateTapeDataUrl(50, 12, "#F5B8C4", 1),
    []
  );
  const tapeUrl2 = useMemo(
    () => generateTapeDataUrl(50, 12, "#9DC88D", 2),
    []
  );
  const [tapeImage1] = useImage(tapeUrl1);
  const [tapeImage2] = useImage(tapeUrl2);

  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
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
    const node = groupRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    onChange({
      x: node.x(),
      y: node.y(),
      width: Math.max(50, element.width * scaleX),
      height: Math.max(50, element.height * scaleY),
      rotation: node.rotation(),
    });
  };

  const frameStyle = element.frameStyle || "none";

  // Calculate frame dimensions
  const getFrameDimensions = () => {
    const { width, height } = element;
    switch (frameStyle) {
      case "polaroid":
        return {
          frameWidth: width + 20,
          frameHeight: height + 50,
          imageX: 10,
          imageY: 10,
          cornerRadius: 2,
        };
      case "rounded":
        return {
          frameWidth: width + 16,
          frameHeight: height + 16,
          imageX: 8,
          imageY: 8,
          cornerRadius: 16,
        };
      default:
        return {
          frameWidth: width,
          frameHeight: height,
          imageX: 0,
          imageY: 0,
          cornerRadius: 8,
        };
    }
  };

  const dims = getFrameDimensions();

  // Clip function for circle frame
  const circleClipFunc = frameStyle === "circle" ? (ctx: Konva.Context) => {
    const radius = Math.min(element.width, element.height) / 2;
    ctx.beginPath();
    ctx.arc(element.width / 2, element.height / 2, radius, 0, Math.PI * 2, false);
    ctx.closePath();
  } : undefined;

  // Clip function for torn edge frame
  const tornClipFunc = frameStyle === "torn" ? (ctx: Konva.Context) => {
    const w = element.width;
    const h = element.height;
    const tearSize = 4;

    // Seeded random for consistent edges based on element id
    let seed = element.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const seededRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    ctx.beginPath();
    ctx.moveTo(0, tearSize);

    // Top edge
    for (let x = 0; x < w; x += tearSize * 2) {
      ctx.lineTo(Math.min(x + tearSize, w), seededRandom() * tearSize);
      ctx.lineTo(Math.min(x + tearSize * 2, w), tearSize * 0.5 + seededRandom() * tearSize * 0.5);
    }

    // Right edge
    ctx.lineTo(w, tearSize);
    for (let y = tearSize; y < h - tearSize; y += tearSize * 2) {
      ctx.lineTo(w - seededRandom() * tearSize, Math.min(y + tearSize, h - tearSize));
    }

    // Bottom edge
    ctx.lineTo(w, h - tearSize);
    for (let x = w; x > 0; x -= tearSize * 2) {
      ctx.lineTo(Math.max(x - tearSize, 0), h - seededRandom() * tearSize);
      ctx.lineTo(Math.max(x - tearSize * 2, 0), h - tearSize * 0.5 - seededRandom() * tearSize * 0.5);
    }

    // Left edge
    ctx.lineTo(0, h - tearSize);
    for (let y = h - tearSize; y > tearSize; y -= tearSize * 2) {
      ctx.lineTo(seededRandom() * tearSize, Math.max(y - tearSize, tearSize));
    }

    ctx.closePath();
  } : undefined;

  const needsFrame = frameStyle === "polaroid" || frameStyle === "rounded";
  const hasTape = frameStyle === "taped";

  return (
    <>
      <Group
        ref={groupRef}
        x={element.x}
        y={element.y}
        rotation={element.rotation}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        {/* Frame background for polaroid/rounded */}
        {needsFrame && (
          <Rect
            x={0}
            y={0}
            width={dims.frameWidth}
            height={dims.frameHeight}
            fill="#FFFFFF"
            cornerRadius={frameStyle === "polaroid" ? 2 : 12}
            shadowColor="rgba(0,0,0,0.15)"
            shadowBlur={isSelected ? 15 : 10}
            shadowOffset={{ x: 2, y: 3 }}
            shadowOpacity={0.6}
          />
        )}

        {/* Main image */}
        <Image
          image={image}
          x={dims.imageX}
          y={dims.imageY}
          width={element.width}
          height={element.height}
          cornerRadius={circleClipFunc || tornClipFunc ? 0 : dims.cornerRadius}
          clipFunc={circleClipFunc || tornClipFunc}
          shadowColor={needsFrame ? undefined : "rgba(0,0,0,0.2)"}
          shadowBlur={needsFrame ? undefined : (isSelected ? 15 : 8)}
          shadowOffset={needsFrame ? undefined : { x: 2, y: 2 }}
          shadowOpacity={needsFrame ? undefined : 0.5}
        />

        {/* Washi tape for taped frame */}
        {hasTape && tapeImage1 && tapeImage2 && (
          <>
            {/* Top-left tape */}
            <Image
              image={tapeImage1}
              x={-15}
              y={-8}
              width={50}
              height={12}
              rotation={-35}
              opacity={0.9}
            />
            {/* Bottom-right tape */}
            <Image
              image={tapeImage2}
              x={element.width - 35}
              y={element.height - 4}
              width={50}
              height={12}
              rotation={-35}
              opacity={0.9}
            />
          </>
        )}
      </Group>

      {isSelected && (
        <Transformer
          ref={transformerRef}
          rotateEnabled={true}
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 50 || newBox.height < 50) {
              return oldBox;
            }
            return newBox;
          }}
          anchorSize={12}
          anchorCornerRadius={6}
          borderStroke="#F97066"
          borderStrokeWidth={2}
          anchorStroke="#F97066"
          anchorFill="#fff"
        />
      )}
    </>
  );
}
