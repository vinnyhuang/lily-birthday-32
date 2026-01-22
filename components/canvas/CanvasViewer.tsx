"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Stage, Layer } from "react-konva";
import Konva from "konva";
import { CanvasPage, CanvasElement } from "@/lib/canvas/types";
import { CanvasImage } from "./CanvasImage";
import { CanvasVideo } from "./CanvasVideo";
import { CanvasSticker } from "./CanvasSticker";
import { CanvasText } from "./CanvasText";
import { CanvasDrawing } from "./CanvasDrawing";
import { CanvasBackground } from "./CanvasBackground";
import { SpiralBinding } from "./SpiralBinding";

interface CanvasViewerProps {
  page: CanvasPage;
  canvasWidth: number;
  canvasHeight: number;
}

export function CanvasViewer({ page, canvasWidth, canvasHeight }: CanvasViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);

  // Set global Konva pixel ratio
  if (typeof window !== "undefined") {
    Konva.pixelRatio = 2;
  }

  // Responsive container sizing
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        if (width > 0) {
          setContainerWidth(Math.min(width, 1200));
        }
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const scale = containerWidth / canvasWidth;
  const displayHeight = containerWidth * (canvasHeight / canvasWidth);

  // Sort elements by zIndex
  const sortedElements = useMemo(
    () => [...page.elements].sort((a, b) => a.zIndex - b.zIndex),
    [page.elements]
  );

  const renderElement = (element: CanvasElement) => {
    switch (element.type) {
      case "image":
        return (
          <CanvasImage
            key={element.id}
            element={element}
            isSelected={false}
            readOnly
          />
        );
      case "video":
        return (
          <CanvasVideo
            key={element.id}
            element={element}
            isSelected={false}
            readOnly
          />
        );
      case "sticker":
        return (
          <CanvasSticker
            key={element.id}
            element={element}
            isSelected={false}
            readOnly
          />
        );
      case "text":
        return (
          <CanvasText
            key={element.id}
            element={element}
            isSelected={false}
            readOnly
          />
        );
      case "drawing":
        return (
          <CanvasDrawing
            key={element.id}
            element={element}
            isSelected={false}
            readOnly
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-[1200px]">
      <div
        ref={containerRef}
        className="relative bg-white rounded-xl shadow-lg overflow-hidden"
        style={{ height: displayHeight }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <Stage
            width={canvasWidth}
            height={canvasHeight}
            pixelRatio={2}
          >
            {/* Background layer */}
            <Layer listening={false}>
              <CanvasBackground
                background={page.background}
                width={canvasWidth}
                height={canvasHeight}
              />
            </Layer>

            {/* Content layer */}
            <Layer>
              {sortedElements.map(renderElement)}
            </Layer>

            {/* Spiral binding overlay */}
            <Layer listening={false}>
              <SpiralBinding
                canvasWidth={canvasWidth}
                canvasHeight={canvasHeight}
              />
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
}
