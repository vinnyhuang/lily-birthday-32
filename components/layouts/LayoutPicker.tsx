"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { layoutTemplates } from "./templates";
import { LayoutType } from "@/lib/canvas/types";

interface LayoutPickerProps {
  onApplyLayout: (
    generatePositions: (
      count: number,
      width: number,
      height: number
    ) => Array<{ x: number; y: number; width: number; height: number; rotation: number }>
  ) => void;
}

export function LayoutPicker({ onApplyLayout }: LayoutPickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState<LayoutType | null>(null);

  const handleApply = () => {
    if (selectedLayout) {
      onApplyLayout(layoutTemplates[selectedLayout].generatePositions);
      setOpen(false);
    }
  };

  const layouts = Object.values(layoutTemplates);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Change Layout
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Choose a Layout</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 py-4">
            {layouts.map((layout) => (
              <button
                key={layout.id}
                onClick={() => setSelectedLayout(layout.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  selectedLayout === layout.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <span className="text-3xl">{layout.icon}</span>
                <span className="font-medium">{layout.name}</span>
                <span className="text-xs text-muted-foreground text-center">
                  {layout.description}
                </span>
              </button>
            ))}
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={!selectedLayout}>
              Apply Layout
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
