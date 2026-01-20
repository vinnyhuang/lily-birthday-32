"use client";

import { FrameStyle } from "@/lib/canvas/types";
import { frames, FrameDefinition } from "@/lib/canvas/frames";

interface FramePickerProps {
  currentFrame: FrameStyle;
  onSelect: (frame: FrameStyle) => void;
}

export function FramePicker({ currentFrame, onSelect }: FramePickerProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-white rounded-lg shadow-sm border">
      {frames.map((frame) => (
        <FrameButton
          key={frame.id}
          frame={frame}
          isSelected={currentFrame === frame.id}
          onSelect={() => onSelect(frame.id)}
        />
      ))}
    </div>
  );
}

interface FrameButtonProps {
  frame: FrameDefinition;
  isSelected: boolean;
  onSelect: () => void;
}

function FrameButton({ frame, isSelected, onSelect }: FrameButtonProps) {
  return (
    <button
      onClick={onSelect}
      className={`p-1.5 rounded transition-colors ${
        isSelected
          ? "bg-primary/10 text-primary"
          : "hover:bg-accent text-muted-foreground"
      }`}
      title={frame.name}
    >
      <FrameIcon frameId={frame.id} />
    </button>
  );
}

function FrameIcon({ frameId }: { frameId: FrameStyle }) {
  const size = 20;
  const strokeWidth = 1.5;

  switch (frameId) {
    case "none":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
        </svg>
      );
    case "polaroid":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
          <rect x="4" y="3" width="16" height="18" rx="1" />
          <rect x="6" y="5" width="12" height="10" />
          <line x1="8" y1="18" x2="16" y2="18" />
        </svg>
      );
    case "torn":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
          <path d="M4 5 L6 4 L8 5 L10 4 L12 5 L14 4 L16 5 L18 4 L20 5 L20 19 L18 20 L16 19 L14 20 L12 19 L10 20 L8 19 L6 20 L4 19 Z" />
        </svg>
      );
    case "taped":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
          <rect x="5" y="5" width="14" height="14" rx="1" />
          <path d="M2 2 L8 8" strokeWidth={2} />
          <path d="M22 2 L16 8" strokeWidth={2} />
        </svg>
      );
    case "circle":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
    case "rounded":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
          <rect x="4" y="4" width="16" height="16" rx="6" />
        </svg>
      );
    default:
      return null;
  }
}
