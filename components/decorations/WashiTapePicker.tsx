"use client";

import { useState } from "react";
import {
  WashiTape,
  washiTapes,
  generateWashiTapeDataUrl,
  getWashiTapesByPattern,
} from "./washiTapes";

interface WashiTapePickerProps {
  onSelect: (tape: WashiTape, dataUrl: string) => void;
}

export function WashiTapePicker({ onSelect }: WashiTapePickerProps) {
  const [previews] = useState(() => {
    const generated: Record<string, string> = {};
    washiTapes.forEach((tape) => {
      generated[tape.id] = generateWashiTapeDataUrl(tape, 80, 24);
    });
    return generated;
  });
  const { solid, patterned } = getWashiTapesByPattern();

  const handleSelect = (tape: WashiTape) => {
    const dataUrl = generateWashiTapeDataUrl(tape, 120, 30);
    onSelect(tape, dataUrl);
  };

  return (
    <div className="space-y-4">
      {/* Solid tapes */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Solid
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {solid.map((tape) => (
            <button
              key={tape.id}
              onClick={() => handleSelect(tape)}
              className="flex flex-col items-center p-2 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-colors"
              title={tape.label}
            >
              {previews[tape.id] && (
                <img
                  src={previews[tape.id]}
                  alt={tape.label}
                  className="w-16 h-5 object-contain"
                  style={{ transform: "rotate(-3deg)" }}
                />
              )}
              <span className="text-xs text-muted-foreground mt-1 truncate w-full text-center">
                {tape.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Patterned tapes */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Patterned
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {patterned.map((tape) => (
            <button
              key={tape.id}
              onClick={() => handleSelect(tape)}
              className="flex flex-col items-center p-2 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-colors"
              title={tape.label}
            >
              {previews[tape.id] && (
                <img
                  src={previews[tape.id]}
                  alt={tape.label}
                  className="w-16 h-5 object-contain"
                  style={{ transform: "rotate(-3deg)" }}
                />
              )}
              <span className="text-xs text-muted-foreground mt-1 truncate w-full text-center">
                {tape.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
