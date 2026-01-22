"use client";

import { useRef, useEffect, useMemo } from "react";
import { Image, Transformer, Group } from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import { CanvasStickerElement, SnapResult } from "@/lib/canvas/types";
import {
  washiTapes,
  generateWashiTapeDataUrl,
} from "@/components/decorations/washiTapes";

interface CanvasStickerProps {
  element: CanvasStickerElement;
  isSelected: boolean;
  onSelect: (e?: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onChange: (updates: Partial<CanvasStickerElement>) => void;
  onDragStart?: () => void;
  onDragMove?: (newX: number, newY: number) => SnapResult;
  onDragEnd?: () => void;
  onTransform?: (scaleX: number, scaleY: number) => void;
}

export function CanvasSticker({
  element,
  isSelected,
  onSelect,
  onChange,
  onDragStart,
  onDragMove,
  onDragEnd,
  onTransform,
}: CanvasStickerProps) {
  const groupRef = useRef<Konva.Group>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  const isWashi = element.category === "washi";

  // For washi tape, generate SVG at exact element dimensions
  const washiDataUrl = useMemo(() => {
    if (!isWashi) return null;

    // Find the tape definition by stickerId
    const tape = washiTapes.find((t) => t.id === element.stickerId);
    if (!tape) return null;

    // Generate SVG at exact element dimensions (rounded to avoid sub-pixel issues)
    const width = Math.round(element.width);
    const height = Math.round(element.height);
    return generateWashiTapeDataUrl(tape, width, height);
  }, [isWashi, element.stickerId, element.width, element.height]);

  // Use the dynamically generated washi URL or the element's src for regular stickers
  const imageSrc = isWashi && washiDataUrl ? washiDataUrl : element.src;
  const [image] = useImage(imageSrc, "anonymous");

  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, element.width, element.height, element.rotation]);

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

    // Reset scale and apply to width/height
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

  // Both washi tape and regular stickers now render as simple Images
  // Washi tape SVG is generated at exact element dimensions, no tiling needed
  return (
    <>
      <Group
        ref={groupRef}
        x={element.x}
        y={element.y}
        rotation={element.rotation}
        draggable
        onClick={(e) => onSelect(e)}
        onTap={(e) => onSelect(e)}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        <Image
          image={image}
          x={0}
          y={0}
          width={element.width}
          height={element.height}
          opacity={element.opacity}
        />
      </Group>
      {isSelected && (
        <Transformer
          ref={transformerRef}
          rotateEnabled={true}
          enabledAnchors={
            isWashi
              ? [
                  "top-left",
                  "top-right",
                  "bottom-left",
                  "bottom-right",
                  "middle-left",
                  "middle-right",
                ]
              : [
                  "top-left",
                  "top-right",
                  "bottom-left",
                  "bottom-right",
                  "middle-left",
                  "middle-right",
                  "top-center",
                  "bottom-center",
                ]
          }
          boundBoxFunc={(oldBox, newBox) => {
            const minHeight = isWashi ? 10 : 30;
            if (newBox.width < 30 || newBox.height < minHeight) {
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
