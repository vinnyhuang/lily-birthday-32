"use client";

import { useRef, useEffect } from "react";
import { Image, Transformer } from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import { CanvasStickerElement, SnapResult } from "@/lib/canvas/types";

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
  const [image] = useImage(element.src, "anonymous");
  const imageRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && transformerRef.current && imageRef.current) {
      transformerRef.current.nodes([imageRef.current]);
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
    const node = imageRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale and apply to width/height
    node.scaleX(1);
    node.scaleY(1);

    onChange({
      x: node.x(),
      y: node.y(),
      width: Math.max(30, node.width() * scaleX),
      height: Math.max(30, node.height() * scaleY),
      rotation: node.rotation(),
    });
  };

  return (
    <>
      <Image
        ref={imageRef}
        image={image}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        rotation={element.rotation}
        opacity={element.opacity}
        draggable
        onClick={(e) => onSelect(e)}
        onTap={(e) => onSelect(e)}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      />
      {isSelected && (
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
            const node = imageRef.current;
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
