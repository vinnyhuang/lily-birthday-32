"use client";

import { useRef, useEffect, useMemo } from "react";
import { Image, Transformer, Group, Rect } from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import { CanvasImageElement, SnapResult, FilterType } from "@/lib/canvas/types";
import { generateTapeDataUrl, generateFloralOverlayUrl, generateCelebrationOverlayUrl } from "@/lib/canvas/frames";
import { getProxyUrl } from "@/lib/s3";

// Get Konva filters configuration based on filter type and intensity
function getKonvaFilters(filterType: FilterType, intensity: number): {
  filters: Array<typeof Konva.Filters.Brighten>;
  config: Record<string, number>;
} | null {
  if (!filterType || filterType === "none") {
    return null;
  }

  const t = intensity / 100; // 0 to 1

  // Konva filter scales:
  // - Contrast: -100 to 100
  // - Brighten: -1 to 1
  // - HSL hue: -180 to 180 degrees
  // - HSL saturation: -2 to 10
  // - HSL luminance: -2 to 2
  // - Blur: blurRadius in pixels

  switch (filterType) {
    case "grayscale":
      return {
        filters: [Konva.Filters.Grayscale, Konva.Filters.Contrast],
        config: {
          contrast: 10 * t, // 10% contrast boost (scale: -100 to 100)
        },
      };
    case "sepia":
      return {
        filters: [Konva.Filters.Sepia, Konva.Filters.Brighten],
        config: {
          sepia: t,
          brightness: 0.05 * t, // 5% brighter (scale: -1 to 1)
        },
      };
    case "warm":
      return {
        filters: [Konva.Filters.HSL, Konva.Filters.Brighten],
        config: {
          hue: 0, // No hue shift
          saturation: 0.3 * t, // Boost saturation (scale: -2 to 10)
          luminance: 0.05 * t, // Slight brightness boost (scale: -2 to 2)
          brightness: 0.02 * t,
        },
      };
    case "cool":
      return {
        filters: [Konva.Filters.HSL, Konva.Filters.Contrast],
        config: {
          hue: -10 * t, // Slight blue shift (scale: -180 to 180 degrees)
          saturation: -0.1 * t, // Reduce saturation
          luminance: -0.05 * t, // Slightly darker
          contrast: 10 * t, // 10% contrast boost (scale: -100 to 100)
        },
      };
    case "faded":
      return {
        filters: [Konva.Filters.Contrast, Konva.Filters.HSL, Konva.Filters.Brighten],
        config: {
          contrast: -10 * t, // Reduce contrast (scale: -100 to 100)
          saturation: -0.2 * t, // Reduce saturation
          luminance: 0,
          hue: 0,
          brightness: 0.1 * t, // 10% brighter
        },
      };
    case "contrast":
      return {
        filters: [Konva.Filters.Contrast, Konva.Filters.HSL],
        config: {
          contrast: 40 * t, // Strong 40% contrast boost (scale: -100 to 100)
          saturation: 0.1 * t, // Slight saturation boost
          hue: 0,
          luminance: 0,
        },
      };
    case "soft":
      return {
        filters: [Konva.Filters.Blur, Konva.Filters.Brighten, Konva.Filters.Contrast],
        config: {
          blurRadius: 0.5 * t, // 0.5px blur
          brightness: 0.08 * t, // 8% brighter
          contrast: -5 * t, // 5% contrast reduction (scale: -100 to 100)
        },
      };
    default:
      return null;
  }
}

interface CanvasImageProps {
  element: CanvasImageElement;
  isSelected: boolean;
  readOnly?: boolean;
  onSelect?: (e?: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onChange?: (updates: Partial<CanvasImageElement>) => void;
  onDragStart?: () => void;
  onDragMove?: (newX: number, newY: number) => SnapResult;
  onDragEnd?: () => void;
  onTransform?: (scaleX: number, scaleY: number) => void;
}

export function CanvasImage({
  element,
  isSelected,
  readOnly,
  onSelect,
  onChange,
  onDragStart,
  onDragMove,
  onDragEnd,
  onTransform,
}: CanvasImageProps) {
  // Use proxy URL for S3 images to avoid CORS issues and enable canvas export
  const imageUrl = element.s3Key ? getProxyUrl(element.s3Key) : element.src;
  const [image] = useImage(imageUrl, "anonymous");
  const groupRef = useRef<Konva.Group>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const imageRef = useRef<Konva.Image>(null);

  // Get filter configuration
  const filterConfig = useMemo(() => {
    return getKonvaFilters(
      element.filterType || "none",
      element.filterIntensity ?? 100
    );
  }, [element.filterType, element.filterIntensity]);

  // Apply filter configuration to the image node
  useEffect(() => {
    const node = imageRef.current;
    if (!node || !image) return;

    if (filterConfig) {
      // Apply filter config values
      Object.entries(filterConfig.config).forEach(([key, value]) => {
        node.setAttr(key, value);
      });
      node.cache();
      node.getLayer()?.batchDraw();
    } else {
      // Clear cache when no filter
      node.clearCache();
      node.getLayer()?.batchDraw();
    }
  }, [filterConfig, image, element.width, element.height]);

  // Load tape images for "taped" frame style (4 corners, different colors)
  const tapeUrl1 = useMemo(
    () => generateTapeDataUrl(50, 12, "#F5B8C4", 1), // Pink - top-left
    []
  );
  const tapeUrl2 = useMemo(
    () => generateTapeDataUrl(50, 12, "#9DC88D", 2), // Green - top-right
    []
  );
  const tapeUrl3 = useMemo(
    () => generateTapeDataUrl(50, 12, "#A8D4E6", 3), // Blue - bottom-left
    []
  );
  const tapeUrl4 = useMemo(
    () => generateTapeDataUrl(50, 12, "#F5D89A", 4), // Yellow - bottom-right
    []
  );
  const [tapeImage1] = useImage(tapeUrl1);
  const [tapeImage2] = useImage(tapeUrl2);
  const [tapeImage3] = useImage(tapeUrl3);
  const [tapeImage4] = useImage(tapeUrl4);

  // Load floral overlay for "floral" frame style
  const floralOverlayUrl = useMemo(
    () => generateFloralOverlayUrl(element.width + 30, element.height + 30),
    [element.width, element.height]
  );
  const [floralOverlay] = useImage(floralOverlayUrl);

  // Load celebration overlay for "celebration" frame style
  const celebrationOverlayUrl = useMemo(
    () => generateCelebrationOverlayUrl(element.width + 30, element.height + 30, element.id.charCodeAt(0)),
    [element.width, element.height, element.id]
  );
  const [celebrationOverlay] = useImage(celebrationOverlayUrl);

  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, element.width, element.height, element.rotation, element.frameStyle]);

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
      case "simple-border":
        return {
          frameWidth: width + 16,
          frameHeight: height + 16,
          imageX: 8,
          imageY: 8,
          cornerRadius: frameStyle === "rounded" ? 16 : 0,
        };
      case "floral":
      case "celebration":
        return {
          frameWidth: width + 30,
          frameHeight: height + 30,
          imageX: 15,
          imageY: 15,
          cornerRadius: 4,
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

  // Clip function for heart frame - fills the entire frame
  const heartClipFunc = frameStyle === "heart" ? (ctx: Konva.Context) => {
    const w = element.width;
    const h = element.height;
    // Scale to fill the frame (heart is ~100 units wide, ~85 units tall in normalized coords)
    const scaleX = w / 100;
    const scaleY = h / 85;

    ctx.beginPath();
    ctx.moveTo(50 * scaleX, 85 * scaleY);
    // Left curve
    ctx.bezierCurveTo(
      50 * scaleX, 85 * scaleY,
      0 * scaleX, 55 * scaleY,
      0 * scaleX, 32 * scaleY
    );
    ctx.bezierCurveTo(
      0 * scaleX, 8 * scaleY,
      25 * scaleX, 0 * scaleY,
      50 * scaleX, 18 * scaleY
    );
    // Right curve
    ctx.bezierCurveTo(
      75 * scaleX, 0 * scaleY,
      100 * scaleX, 8 * scaleY,
      100 * scaleX, 32 * scaleY
    );
    ctx.bezierCurveTo(
      100 * scaleX, 55 * scaleY,
      50 * scaleX, 85 * scaleY,
      50 * scaleX, 85 * scaleY
    );
    ctx.closePath();
  } : undefined;

  // Clip function for scalloped edge frame - scallops curve outward, inset by radius
  const scallopedClipFunc = frameStyle === "scalloped" ? (ctx: Konva.Context) => {
    const w = element.width;
    const h = element.height;
    const scallopSize = 12;
    const r = scallopSize / 2; // radius / inset amount
    const halfScallop = scallopSize / 2;

    ctx.beginPath();
    ctx.moveTo(r, r); // Start at inset corner

    // Top edge scallops - start with half scallop, full scallops in middle, end with half
    // First half scallop
    ctx.lineTo(r, r);
    ctx.quadraticCurveTo(r + halfScallop / 2, 0, r + halfScallop, r);

    // Full scallops in the middle
    for (let x = r + halfScallop; x < w - r - halfScallop; x += scallopSize) {
      const midX = x + r;
      ctx.lineTo(x, r);
      ctx.quadraticCurveTo(midX, 0, x + scallopSize, r);
    }

    // Last half scallop
    ctx.lineTo(w - r - halfScallop, r);
    ctx.quadraticCurveTo(w - r - halfScallop / 2, 0, w - r, r);

    // Right edge scallops - base at x=w-r, peaks at x=w
    for (let y = r; y < h - r; y += scallopSize) {
      const midY = y + r;
      ctx.lineTo(w - r, y);
      ctx.quadraticCurveTo(w, midY, w - r, Math.min(y + scallopSize, h - r));
    }
    ctx.lineTo(w - r, h - r);

    // Bottom edge scallops - start with half scallop, full scallops in middle, end with half
    // First half scallop (from right)
    ctx.lineTo(w - r, h - r);
    ctx.quadraticCurveTo(w - r - halfScallop / 2, h, w - r - halfScallop, h - r);

    // Full scallops in the middle
    for (let x = w - r - halfScallop; x > r + halfScallop; x -= scallopSize) {
      const midX = x - r;
      ctx.lineTo(x, h - r);
      ctx.quadraticCurveTo(midX, h, x - scallopSize, h - r);
    }

    // Last half scallop
    ctx.lineTo(r + halfScallop, h - r);
    ctx.quadraticCurveTo(r + halfScallop / 2, h, r, h - r);

    // Left edge scallops - base at x=r, peaks at x=0
    for (let y = h - r; y > r; y -= scallopSize) {
      const midY = y - r;
      ctx.lineTo(r, y);
      ctx.quadraticCurveTo(0, midY, r, Math.max(y - scallopSize, r));
    }
    ctx.lineTo(r, r);

    ctx.closePath();
  } : undefined;

  const needsFrame = frameStyle === "polaroid" || frameStyle === "rounded" || frameStyle === "simple-border";
  const hasTape = frameStyle === "taped";
  const hasFloral = frameStyle === "floral";
  const hasCelebration = frameStyle === "celebration";
  const hasClipMask = circleClipFunc || tornClipFunc || heartClipFunc || scallopedClipFunc;
  const clipFunc = circleClipFunc || tornClipFunc || heartClipFunc || scallopedClipFunc;

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
        onDragStart={readOnly ? undefined : handleDragStart}
        onDragMove={readOnly ? undefined : handleDragMove}
        onDragEnd={readOnly ? undefined : handleDragEnd}
        onTransformEnd={readOnly ? undefined : handleTransformEnd}
      >
        {/* Frame background for polaroid/rounded/simple-border */}
        {needsFrame && (
          <Rect
            x={0}
            y={0}
            width={dims.frameWidth}
            height={dims.frameHeight}
            fill={frameStyle === "polaroid" ? "#FFFFFF" : (element.borderColor || "#FFFFFF")}
            cornerRadius={frameStyle === "polaroid" ? 2 : (frameStyle === "rounded" ? 12 : 0)}
            shadowColor="rgba(0,0,0,0.15)"
            shadowBlur={isSelected ? 15 : 10}
            shadowOffset={{ x: 2, y: 3 }}
            shadowOpacity={0.6}
          />
        )}

        {/* No background for floral/celebration frames - transparent */}

        {/* Main image - wrap in Group for clipping (circle/torn/heart/scalloped frames) */}
        {hasClipMask ? (
          <Group
            x={dims.imageX}
            y={dims.imageY}
            clipFunc={clipFunc}
          >
            <Image
              ref={imageRef}
              image={image}
              x={0}
              y={0}
              width={element.width}
              height={element.height}
              shadowColor="rgba(0,0,0,0.2)"
              shadowBlur={isSelected ? 15 : 8}
              shadowOffset={{ x: 2, y: 2 }}
              shadowOpacity={0.5}
              filters={filterConfig?.filters}
            />
          </Group>
        ) : (
          <Image
            ref={imageRef}
            image={image}
            x={dims.imageX}
            y={dims.imageY}
            width={element.width}
            height={element.height}
            cornerRadius={dims.cornerRadius}
            shadowColor={needsFrame ? undefined : "rgba(0,0,0,0.2)"}
            shadowBlur={needsFrame ? undefined : (isSelected ? 15 : 8)}
            shadowOffset={needsFrame ? undefined : { x: 2, y: 2 }}
            shadowOpacity={needsFrame ? undefined : 0.5}
            filters={filterConfig?.filters}
          />
        )}

        {/* Floral overlay */}
        {hasFloral && floralOverlay && (
          <Image
            image={floralOverlay}
            x={0}
            y={0}
            width={dims.frameWidth}
            height={dims.frameHeight}
            listening={false}
          />
        )}

        {/* Celebration overlay */}
        {hasCelebration && celebrationOverlay && (
          <Image
            image={celebrationOverlay}
            x={0}
            y={0}
            width={dims.frameWidth}
            height={dims.frameHeight}
            listening={false}
          />
        )}

        {/* Washi tape for taped frame - 4 corners */}
        {hasTape && tapeImage1 && tapeImage2 && tapeImage3 && tapeImage4 && (
          <>
            {/* Top-left tape */}
            <Image
              image={tapeImage1}
              x={-16}
              y={20}
              width={50}
              height={12}
              rotation={-45}
              opacity={0.9}
            />
            {/* Top-right tape */}
            <Image
              image={tapeImage2}
              x={element.width - 22}
              y={-12}
              width={50}
              height={12}
              rotation={45}
              opacity={0.9}
            />
            {/* Bottom-left tape */}
            <Image
              image={tapeImage3}
              x={-10}
              y={element.height - 30}
              width={50}
              height={12}
              rotation={45}
              opacity={0.9}
            />
            {/* Bottom-right tape */}
            <Image
              image={tapeImage4}
              x={element.width - 30}
              y={element.height + 4}
              width={50}
              height={12}
              rotation={-45}
              opacity={0.9}
            />
          </>
        )}
      </Group>

      {isSelected && !readOnly && (
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
