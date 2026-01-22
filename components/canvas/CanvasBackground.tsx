"use client";

import { useEffect, useState } from "react";
import { Rect } from "react-konva";
import { CanvasBackground as CanvasBackgroundType } from "@/lib/canvas/types";
import { getTextureById, loadTextureImage } from "@/lib/canvas/textures";

interface CanvasBackgroundProps {
  background: CanvasBackgroundType;
  width: number;
  height: number;
}

export function CanvasBackground({
  background,
  width,
  height,
}: CanvasBackgroundProps) {
  const [textureImage, setTextureImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (background.type !== "texture") return;
    const texture = getTextureById(background.value);
    if (texture) {
      loadTextureImage(texture).then(setTextureImage).catch(() => {
        setTextureImage(null);
      });
    }
  }, [background.type, background.value]);

  if (background.type === "color") {
    return (
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill={background.value}
        listening={false}
      />
    );
  }

  return (
    <Rect
      x={0}
      y={0}
      width={width}
      height={height}
      fill={textureImage ? undefined : "#FFFFFF"}
      fillPatternImage={textureImage || undefined}
      fillPatternRepeat="repeat"
      fillPatternScale={{
        x: 1,
        y: 1,
      }}
      fillPatternOffset={{
        x: 0,
        y: 0,
      }}
      listening={false}
    />
  );
}
