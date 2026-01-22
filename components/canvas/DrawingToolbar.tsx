"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { BrushType } from "@/lib/canvas/types";
import { Pencil, PenTool, Eraser, X } from "lucide-react";

interface DrawingToolbarProps {
  brushType: BrushType;
  brushColor: string;
  brushSize: number;
  brushOpacity: number;
  isErasing: boolean;
  onBrushTypeChange: (type: BrushType) => void;
  onColorChange: (color: string) => void;
  onSizeChange: (size: number) => void;
  onOpacityChange: (opacity: number) => void;
  onEraserToggle: () => void;
  onDone: () => void;
}

const PRESET_COLORS = [
  "#000000", // Black
  "#FFFFFF", // White
  "#EF4444", // Red
  "#F97316", // Orange
  "#EAB308", // Yellow
  "#22C55E", // Green
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#6B7280", // Gray
];

// Check if a color is a preset
function isPresetColor(value: string): boolean {
  return PRESET_COLORS.some((c) => c.toLowerCase() === value.toLowerCase());
}

const brushButtons: { type: BrushType; icon: React.ReactNode; label: string }[] = [
  { type: "pen", icon: <Pencil className="h-4 w-4" />, label: "Pen" },
  { type: "marker", icon: <PenTool className="h-4 w-4" />, label: "Marker" },
];

export function DrawingToolbar({
  brushType,
  brushColor,
  brushSize,
  brushOpacity,
  isErasing,
  onBrushTypeChange,
  onColorChange,
  onSizeChange,
  onOpacityChange,
  onEraserToggle,
  onDone,
}: DrawingToolbarProps) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border rounded-xl shadow-lg p-3 flex items-center gap-4">
        {/* Brush Type Selection */}
        <div className="flex items-center gap-1">
          {brushButtons.map((btn) => (
            <Button
              key={btn.type}
              variant={!isErasing && brushType === btn.type ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                onBrushTypeChange(btn.type);
                if (isErasing) onEraserToggle();
              }}
              title={btn.label}
            >
              {btn.icon}
            </Button>
          ))}

          <div className="w-px h-6 bg-border mx-1" />

          {/* Eraser */}
          <Button
            variant={isErasing ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={onEraserToggle}
            title="Eraser"
          >
            <Eraser className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-8 bg-border" />

        {/* Color Selection */}
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Color</Label>
          <div className="flex gap-1">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  brushColor === color
                    ? "border-primary scale-110"
                    : "border-transparent hover:border-muted-foreground/50"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => onColorChange(color)}
                title={color}
              />
            ))}
            {/* Custom color picker */}
            <div className="relative">
              <button
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  !isPresetColor(brushColor)
                    ? "border-primary scale-110"
                    : "border-transparent hover:border-muted-foreground/50"
                }`}
                style={{
                  background: !isPresetColor(brushColor)
                    ? brushColor
                    : "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
                }}
                onClick={() => {
                  const input = document.getElementById('drawing-custom-color-input') as HTMLInputElement;
                  input?.click();
                }}
                title="Custom color"
              />
              <input
                id="drawing-custom-color-input"
                type="color"
                value={brushColor}
                onChange={(e) => onColorChange(e.target.value)}
                className="absolute top-full left-1/2 -translate-x-1/2 opacity-0 w-0 h-0"
              />
            </div>
          </div>
        </div>

        <div className="w-px h-8 bg-border" />

        {/* Size Slider */}
        <div className="flex items-center gap-2 min-w-[120px]">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">Size</Label>
          <Slider
            value={[brushSize]}
            onValueChange={([value]) => onSizeChange(value)}
            min={1}
            max={50}
            step={1}
            className="w-20"
          />
          <span className="text-xs text-muted-foreground w-6">{brushSize}</span>
        </div>

        <div className="w-px h-8 bg-border" />

        {/* Opacity Slider */}
        <div className="flex items-center gap-2 min-w-[120px]">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">Opacity</Label>
          <Slider
            value={[brushOpacity * 100]}
            onValueChange={([value]) => onOpacityChange(value / 100)}
            min={10}
            max={100}
            step={5}
            className="w-20"
          />
          <span className="text-xs text-muted-foreground w-8">{Math.round(brushOpacity * 100)}%</span>
        </div>

        <div className="w-px h-8 bg-border" />

        {/* Done Button */}
        <Button
          variant="default"
          size="sm"
          className="h-8"
          onClick={onDone}
        >
          <X className="h-4 w-4 mr-1" />
          Done
        </Button>
      </div>
    </div>
  );
}
