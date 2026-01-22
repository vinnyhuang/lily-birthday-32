"use client";

import { useMemo } from "react";

interface TourTooltipProps {
  targetRect: DOMRect | null;
  position: "top" | "bottom" | "left" | "right" | "center";
  step: number;
  totalSteps: number;
  title: string;
  description: string;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const TOOLTIP_GAP = 16;
const TOOLTIP_WIDTH = 320;

export function TourTooltip({
  targetRect,
  position,
  step,
  totalSteps,
  title,
  description,
  onNext,
  onPrev,
  onSkip,
  isFirst,
  isLast,
}: TourTooltipProps) {
  const style = useMemo(() => {
    if (!targetRect || position === "center") {
      // Centered on screen
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      } as React.CSSProperties;
    }

    const padding = 8; // matches overlay padding
    let top: number;
    let left: number;

    switch (position) {
      case "bottom":
        top = targetRect.bottom + padding + TOOLTIP_GAP;
        left = targetRect.left + targetRect.width / 2 - TOOLTIP_WIDTH / 2;
        break;
      case "top":
        top = targetRect.top - padding - TOOLTIP_GAP;
        left = targetRect.left + targetRect.width / 2 - TOOLTIP_WIDTH / 2;
        break;
      case "right":
        top = targetRect.top + targetRect.height / 2;
        left = targetRect.right + padding + TOOLTIP_GAP;
        break;
      case "left":
        top = targetRect.top + targetRect.height / 2;
        left = targetRect.left - padding - TOOLTIP_GAP - TOOLTIP_WIDTH;
        break;
    }

    // Clamp to viewport
    const maxLeft = window.innerWidth - TOOLTIP_WIDTH - 16;
    left = Math.max(16, Math.min(left, maxLeft));

    const styles: React.CSSProperties = {
      left,
    };

    if (position === "top") {
      styles.bottom = window.innerHeight - top;
    } else if (position === "right" || position === "left") {
      styles.top = top;
      styles.transform = "translateY(-50%)";
    } else {
      styles.top = top;
    }

    return styles;
  }, [targetRect, position]);

  const arrowPosition = useMemo(() => {
    if (!targetRect || position === "center") return null;
    return position;
  }, [targetRect, position]);

  return (
    <div
      className="fixed z-[60] transition-all duration-300 ease-in-out"
      style={{ ...style, width: TOOLTIP_WIDTH }}
    >
      <div className="relative bg-white rounded-xl shadow-xl border border-[#E8DFD6] p-5">
        {/* Arrow */}
        {arrowPosition && <Arrow position={arrowPosition} />}

        {/* Content */}
        <h3 className="font-display text-lg text-primary mb-1.5">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-1.5 mt-4 mb-3">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === step ? "bg-primary" : "bg-[#E8DFD6]"
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={onSkip}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip tour
          </button>
          <div className="flex gap-2">
            {!isFirst && (
              <button
                onClick={onPrev}
                className="px-3 py-1.5 text-sm rounded-lg border border-[#E8DFD6] hover:bg-[#FDF8F6] transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={onNext}
              className="px-3 py-1.5 text-sm rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              {isLast ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Arrow({ position }: { position: "top" | "bottom" | "left" | "right" }) {
  const baseClass = "absolute w-3 h-3 bg-white border-[#E8DFD6] rotate-45";

  switch (position) {
    case "bottom":
      // Arrow points up (tooltip is below target)
      return (
        <div
          className={`${baseClass} border-l border-t -top-1.5 left-1/2 -translate-x-1/2`}
        />
      );
    case "top":
      // Arrow points down (tooltip is above target)
      return (
        <div
          className={`${baseClass} border-r border-b -bottom-1.5 left-1/2 -translate-x-1/2`}
        />
      );
    case "right":
      // Arrow points left (tooltip is to the right)
      return (
        <div
          className={`${baseClass} border-l border-b -left-1.5 top-1/2 -translate-y-1/2`}
        />
      );
    case "left":
      // Arrow points right (tooltip is to the left)
      return (
        <div
          className={`${baseClass} border-r border-t -right-1.5 top-1/2 -translate-y-1/2`}
        />
      );
  }
}
