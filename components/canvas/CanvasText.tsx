"use client";

import { useRef, useEffect, useState } from "react";
import { Text, Transformer } from "react-konva";
import Konva from "konva";
import { CanvasTextElement, SnapResult } from "@/lib/canvas/types";

interface CanvasTextProps {
  element: CanvasTextElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<CanvasTextElement>) => void;
  onDragStart?: () => void;
  onDragMove?: (newX: number, newY: number) => SnapResult;
  onDragEnd?: () => void;
}

export function CanvasText({
  element,
  isSelected,
  onSelect,
  onChange,
  onDragStart,
  onDragMove,
  onDragEnd,
}: CanvasTextProps) {
  const textRef = useRef<Konva.Text>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isSelected && transformerRef.current && textRef.current && !isEditing) {
      transformerRef.current.nodes([textRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, isEditing]);

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
    const node = textRef.current;
    if (!node) return;

    const scaleX = node.scaleX();

    // Reset scale and apply to fontSize
    node.scaleX(1);
    node.scaleY(1);

    onChange({
      x: node.x(),
      y: node.y(),
      fontSize: Math.max(12, element.fontSize * scaleX),
      rotation: node.rotation(),
    });
  };

  const handleDoubleClick = () => {
    const textNode = textRef.current;
    if (!textNode) return;

    setIsEditing(true);

    const stage = textNode.getStage();
    if (!stage) return;

    const textPosition = textNode.absolutePosition();
    const stageBox = stage.container().getBoundingClientRect();

    // Create textarea for editing
    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);

    textarea.value = element.text;
    textarea.style.position = "absolute";
    textarea.style.top = `${stageBox.top + textPosition.y * stage.scaleY()}px`;
    textarea.style.left = `${stageBox.left + textPosition.x * stage.scaleX()}px`;
    textarea.style.width = `${textNode.width() * stage.scaleX()}px`;
    textarea.style.height = "auto";
    textarea.style.fontSize = `${element.fontSize * stage.scaleX()}px`;
    textarea.style.fontFamily = element.fontFamily;
    textarea.style.color = element.fill;
    textarea.style.border = "2px solid #F97066";
    textarea.style.borderRadius = "4px";
    textarea.style.padding = "4px";
    textarea.style.background = "white";
    textarea.style.outline = "none";
    textarea.style.resize = "none";
    textarea.style.zIndex = "1000";

    textarea.focus();

    const handleBlur = () => {
      onChange({ text: textarea.value || "Text" });
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

  return (
    <>
      <Text
        ref={textRef}
        text={element.text}
        x={element.x}
        y={element.y}
        fontSize={element.fontSize}
        fontFamily={element.fontFamily}
        fontStyle={element.fontStyle}
        fill={element.fill}
        align={element.align}
        rotation={element.rotation}
        width={element.width}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDblClick={handleDoubleClick}
        onDblTap={handleDoubleClick}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        visible={!isEditing}
      />
      {isSelected && !isEditing && (
        <Transformer
          ref={transformerRef}
          rotateEnabled={true}
          enabledAnchors={["middle-left", "middle-right"]}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 50) {
              return oldBox;
            }
            return newBox;
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
