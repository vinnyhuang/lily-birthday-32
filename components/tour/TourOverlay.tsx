"use client";

interface TourOverlayProps {
  targetRect: DOMRect | null;
  onSkip: () => void;
}

const PADDING = 8;

export function TourOverlay({ targetRect, onSkip }: TourOverlayProps) {
  if (!targetRect) {
    // Centered step - full backdrop with no cutout
    return (
      <div
        className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-300"
        onClick={onSkip}
      />
    );
  }

  // Backdrop with cutout using box-shadow technique
  return (
    <>
      {/* Clickable backdrop areas (outside the cutout) */}
      <div
        className="fixed inset-0 z-50"
        onClick={onSkip}
      />
      {/* Cutout highlight */}
      <div
        className="fixed z-50 rounded-lg pointer-events-none transition-all duration-300 ease-in-out"
        style={{
          top: targetRect.top - PADDING,
          left: targetRect.left - PADDING,
          width: targetRect.width + PADDING * 2,
          height: targetRect.height + PADDING * 2,
          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
        }}
      />
    </>
  );
}
