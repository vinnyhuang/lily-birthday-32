"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { Image, Transformer, Group, Rect, Text } from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import { CanvasVideoElement, SnapResult } from "@/lib/canvas/types";
import { generateTapeDataUrl, generateFloralOverlayUrl, generateCelebrationOverlayUrl } from "@/lib/canvas/frames";
import { getThumbnailS3Key, getProxyUrl } from "@/lib/s3";

interface CanvasVideoProps {
  element: CanvasVideoElement;
  isSelected: boolean;
  readOnly?: boolean;
  onSelect?: (e?: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onChange?: (updates: Partial<CanvasVideoElement>) => void;
  onDragStart?: () => void;
  onDragMove?: (newX: number, newY: number) => SnapResult;
  onDragEnd?: () => void;
  onTransform?: (scaleX: number, scaleY: number) => void;
}

export function CanvasVideo({
  element,
  isSelected,
  readOnly,
  onSelect,
  onChange,
  onDragStart,
  onDragMove,
  onDragEnd,
  onTransform,
}: CanvasVideoProps) {
  const groupRef = useRef<Konva.Group>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const imageRef = useRef<Konva.Image>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Create and configure video element
  useEffect(() => {
    const video = document.createElement("video");
    video.src = element.src;
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";

    video.addEventListener("loadeddata", () => {
      setIsLoaded(true);
      const node = imageRef.current;
      if (node) {
        node.image(video);
        node.getLayer()?.batchDraw();
      }
    });

    videoRef.current = video;

    return () => {
      video.pause();
      video.src = "";
      videoRef.current = null;
    };
  }, [element.src]);

  // Load tape images for "taped" frame style
  const tapeUrl1 = useMemo(() => generateTapeDataUrl(50, 12, "#F5B8C4", 1), []);
  const tapeUrl2 = useMemo(() => generateTapeDataUrl(50, 12, "#9DC88D", 2), []);
  const tapeUrl3 = useMemo(() => generateTapeDataUrl(50, 12, "#A8D4E6", 3), []);
  const tapeUrl4 = useMemo(() => generateTapeDataUrl(50, 12, "#F5D89A", 4), []);
  const [tapeImage1] = useImage(tapeUrl1);
  const [tapeImage2] = useImage(tapeUrl2);
  const [tapeImage3] = useImage(tapeUrl3);
  const [tapeImage4] = useImage(tapeUrl4);

  // Load floral overlay
  const floralOverlayUrl = useMemo(
    () => generateFloralOverlayUrl(element.width + 30, element.height + 30),
    [element.width, element.height]
  );
  const [floralOverlay] = useImage(floralOverlayUrl);

  // Load celebration overlay
  const celebrationOverlayUrl = useMemo(
    () => generateCelebrationOverlayUrl(element.width + 30, element.height + 30, element.id.charCodeAt(0)),
    [element.width, element.height, element.id]
  );
  const [celebrationOverlay] = useImage(celebrationOverlayUrl);

  // Load thumbnail image for display while video is loading/paused
  const thumbnailUrl = useMemo(
    () => getProxyUrl(getThumbnailS3Key(element.s3Key)),
    [element.s3Key]
  );
  const [thumbnailImage] = useImage(thumbnailUrl, "anonymous");

  // Animation loop to update canvas when video is playing
  const animate = useCallback(() => {
    const node = imageRef.current;
    if (node && videoRef.current && !videoRef.current.paused) {
      node.getLayer()?.batchDraw();
      animationRef.current = requestAnimationFrame(animate);
    }
  }, []);

  // Handle play/pause
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
      animate();
    } else {
      video.pause();
      setIsPlaying(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  }, [animate]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

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

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (readOnly) {
      togglePlay();
    } else if (isSelected) {
      togglePlay();
    } else {
      onSelect?.(e);
    }
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

  // Clip functions for special frames
  const circleClipFunc = frameStyle === "circle" ? (ctx: Konva.Context) => {
    const radius = Math.min(element.width, element.height) / 2;
    ctx.beginPath();
    ctx.arc(element.width / 2, element.height / 2, radius, 0, Math.PI * 2, false);
    ctx.closePath();
  } : undefined;

  const tornClipFunc = frameStyle === "torn" ? (ctx: Konva.Context) => {
    const w = element.width;
    const h = element.height;
    const tearSize = 4;
    let seed = element.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const seededRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    ctx.beginPath();
    ctx.moveTo(0, tearSize);
    for (let x = 0; x < w; x += tearSize * 2) {
      ctx.lineTo(Math.min(x + tearSize, w), seededRandom() * tearSize);
      ctx.lineTo(Math.min(x + tearSize * 2, w), tearSize * 0.5 + seededRandom() * tearSize * 0.5);
    }
    ctx.lineTo(w, tearSize);
    for (let y = tearSize; y < h - tearSize; y += tearSize * 2) {
      ctx.lineTo(w - seededRandom() * tearSize, Math.min(y + tearSize, h - tearSize));
    }
    ctx.lineTo(w, h - tearSize);
    for (let x = w; x > 0; x -= tearSize * 2) {
      ctx.lineTo(Math.max(x - tearSize, 0), h - seededRandom() * tearSize);
      ctx.lineTo(Math.max(x - tearSize * 2, 0), h - tearSize * 0.5 - seededRandom() * tearSize * 0.5);
    }
    ctx.lineTo(0, h - tearSize);
    for (let y = h - tearSize; y > tearSize; y -= tearSize * 2) {
      ctx.lineTo(seededRandom() * tearSize, Math.max(y - tearSize, tearSize));
    }
    ctx.closePath();
  } : undefined;

  const heartClipFunc = frameStyle === "heart" ? (ctx: Konva.Context) => {
    const w = element.width;
    const h = element.height;
    const scaleX = w / 100;
    const scaleY = h / 85;
    ctx.beginPath();
    ctx.moveTo(50 * scaleX, 85 * scaleY);
    ctx.bezierCurveTo(50 * scaleX, 85 * scaleY, 0 * scaleX, 55 * scaleY, 0 * scaleX, 32 * scaleY);
    ctx.bezierCurveTo(0 * scaleX, 8 * scaleY, 25 * scaleX, 0 * scaleY, 50 * scaleX, 18 * scaleY);
    ctx.bezierCurveTo(75 * scaleX, 0 * scaleY, 100 * scaleX, 8 * scaleY, 100 * scaleX, 32 * scaleY);
    ctx.bezierCurveTo(100 * scaleX, 55 * scaleY, 50 * scaleX, 85 * scaleY, 50 * scaleX, 85 * scaleY);
    ctx.closePath();
  } : undefined;

  const scallopedClipFunc = frameStyle === "scalloped" ? (ctx: Konva.Context) => {
    const w = element.width;
    const h = element.height;
    const scallopSize = 12;
    const r = scallopSize / 2;
    const halfScallop = scallopSize / 2;
    ctx.beginPath();
    ctx.moveTo(r, r);
    ctx.lineTo(r, r);
    ctx.quadraticCurveTo(r + halfScallop / 2, 0, r + halfScallop, r);
    for (let x = r + halfScallop; x < w - r - halfScallop; x += scallopSize) {
      const midX = x + r;
      ctx.lineTo(x, r);
      ctx.quadraticCurveTo(midX, 0, x + scallopSize, r);
    }
    ctx.lineTo(w - r - halfScallop, r);
    ctx.quadraticCurveTo(w - r - halfScallop / 2, 0, w - r, r);
    for (let y = r; y < h - r; y += scallopSize) {
      const midY = y + r;
      ctx.lineTo(w - r, y);
      ctx.quadraticCurveTo(w, midY, w - r, Math.min(y + scallopSize, h - r));
    }
    ctx.lineTo(w - r, h - r);
    ctx.lineTo(w - r, h - r);
    ctx.quadraticCurveTo(w - r - halfScallop / 2, h, w - r - halfScallop, h - r);
    for (let x = w - r - halfScallop; x > r + halfScallop; x -= scallopSize) {
      const midX = x - r;
      ctx.lineTo(x, h - r);
      ctx.quadraticCurveTo(midX, h, x - scallopSize, h - r);
    }
    ctx.lineTo(r + halfScallop, h - r);
    ctx.quadraticCurveTo(r + halfScallop / 2, h, r, h - r);
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
        onClick={handleClick}
        onTap={handleClick}
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

        {/* Video content - with or without clip mask */}
        {hasClipMask ? (
          <Group x={dims.imageX} y={dims.imageY} clipFunc={clipFunc}>
            {/* Show video when playing, thumbnail when paused */}
            {isPlaying && isLoaded && videoRef.current ? (
              <Image
                ref={imageRef}
                image={videoRef.current}
                x={0}
                y={0}
                width={element.width}
                height={element.height}
                shadowColor="rgba(0,0,0,0.2)"
                shadowBlur={isSelected ? 15 : 8}
                shadowOffset={{ x: 2, y: 2 }}
                shadowOpacity={0.5}
              />
            ) : thumbnailImage ? (
              <Image
                image={thumbnailImage}
                x={0}
                y={0}
                width={element.width}
                height={element.height}
                shadowColor="rgba(0,0,0,0.2)"
                shadowBlur={isSelected ? 15 : 8}
                shadowOffset={{ x: 2, y: 2 }}
                shadowOpacity={0.5}
              />
            ) : (
              <Rect
                x={0}
                y={0}
                width={element.width}
                height={element.height}
                fill="#2a2a2a"
              />
            )}
            {/* Play button overlay when not playing */}
            {!isPlaying && (
              <>
                <Rect
                  x={0}
                  y={0}
                  width={element.width}
                  height={element.height}
                  fill="rgba(0,0,0,0.2)"
                />
                <Rect
                  x={element.width / 2 - 25}
                  y={element.height / 2 - 25}
                  width={50}
                  height={50}
                  fill="rgba(255,255,255,0.9)"
                  cornerRadius={25}
                />
                <Text
                  x={element.width / 2 - 8}
                  y={element.height / 2 - 12}
                  text="▶"
                  fontSize={24}
                  fill="#333"
                />
              </>
            )}
          </Group>
        ) : (
          <>
            {/* Show video when playing, thumbnail when paused */}
            {isPlaying && isLoaded && videoRef.current ? (
              <Image
                ref={imageRef}
                image={videoRef.current}
                x={dims.imageX}
                y={dims.imageY}
                width={element.width}
                height={element.height}
                cornerRadius={dims.cornerRadius}
                shadowColor={needsFrame ? undefined : "rgba(0,0,0,0.2)"}
                shadowBlur={needsFrame ? undefined : (isSelected ? 15 : 8)}
                shadowOffset={needsFrame ? undefined : { x: 2, y: 2 }}
                shadowOpacity={needsFrame ? undefined : 0.5}
              />
            ) : thumbnailImage ? (
              <Image
                image={thumbnailImage}
                x={dims.imageX}
                y={dims.imageY}
                width={element.width}
                height={element.height}
                cornerRadius={dims.cornerRadius}
                shadowColor={needsFrame ? undefined : "rgba(0,0,0,0.2)"}
                shadowBlur={needsFrame ? undefined : (isSelected ? 15 : 8)}
                shadowOffset={needsFrame ? undefined : { x: 2, y: 2 }}
                shadowOpacity={needsFrame ? undefined : 0.5}
              />
            ) : (
              <Rect
                x={dims.imageX}
                y={dims.imageY}
                width={element.width}
                height={element.height}
                fill="#2a2a2a"
                cornerRadius={dims.cornerRadius}
              />
            )}
            {/* Play button overlay when not playing */}
            {!isPlaying && (
              <>
                <Rect
                  x={dims.imageX}
                  y={dims.imageY}
                  width={element.width}
                  height={element.height}
                  fill="rgba(0,0,0,0.2)"
                  cornerRadius={dims.cornerRadius}
                />
                <Rect
                  x={dims.imageX + element.width / 2 - 25}
                  y={dims.imageY + element.height / 2 - 25}
                  width={50}
                  height={50}
                  fill="rgba(255,255,255,0.9)"
                  cornerRadius={25}
                />
                <Text
                  x={dims.imageX + element.width / 2 - 8}
                  y={dims.imageY + element.height / 2 - 12}
                  text="▶"
                  fontSize={24}
                  fill="#333"
                />
              </>
            )}
          </>
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

        {/* Washi tape for taped frame */}
        {hasTape && tapeImage1 && tapeImage2 && tapeImage3 && tapeImage4 && (
          <>
            <Image image={tapeImage1} x={-16} y={20} width={50} height={12} rotation={-45} opacity={0.9} />
            <Image image={tapeImage2} x={element.width - 22} y={-12} width={50} height={12} rotation={45} opacity={0.9} />
            <Image image={tapeImage3} x={-10} y={element.height - 30} width={50} height={12} rotation={45} opacity={0.9} />
            <Image image={tapeImage4} x={element.width - 30} y={element.height + 4} width={50} height={12} rotation={-45} opacity={0.9} />
          </>
        )}
      </Group>

      {isSelected && !readOnly && (
        <Transformer
          ref={transformerRef}
          rotateEnabled={true}
          enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
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
