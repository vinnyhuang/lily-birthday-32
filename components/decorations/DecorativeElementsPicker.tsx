"use client";

import { useState, useEffect } from "react";
import { doodles, Doodle, generateDoodleDataUrl, getDoodlesByType } from "./doodles";
import { shapeDefinitions, ShapeDefinition, getShapesByCategory, generateShapePreviewSvg } from "./shapes";
import { photoCorners, PhotoCorner, generatePhotoCornerDataUrl, getCornersByStyle } from "./photoCorners";

type ElementCategory = "doodles" | "shapes" | "corners";

interface DecorativeElementsPickerProps {
  onSelectDoodle: (doodle: Doodle, dataUrl: string) => void;
  onSelectNativeShape: (shape: ShapeDefinition) => void;
  onSelectCorner: (corner: PhotoCorner, dataUrl: string) => void;
}

export function DecorativeElementsPicker({
  onSelectDoodle,
  onSelectNativeShape,
  onSelectCorner,
}: DecorativeElementsPickerProps) {
  const [activeCategory, setActiveCategory] = useState<ElementCategory>("shapes");
  const [previews, setPreviews] = useState<Record<string, string>>({});

  // Generate previews on mount
  useEffect(() => {
    const newPreviews: Record<string, string> = {};

    doodles.forEach((d) => {
      newPreviews[d.id] = generateDoodleDataUrl(d);
    });
    shapeDefinitions.forEach((s) => {
      newPreviews[s.id] = `data:image/svg+xml,${encodeURIComponent(generateShapePreviewSvg(s, 64))}`;
    });
    photoCorners.forEach((c) => {
      newPreviews[c.id] = generatePhotoCornerDataUrl(c);
    });

    setPreviews(newPreviews);
  }, []);

  const categories: { id: ElementCategory; label: string }[] = [
    { id: "shapes", label: "Shapes" },
    { id: "doodles", label: "Doodles" },
    { id: "corners", label: "Corners" },
  ];

  const doodleGroups = getDoodlesByType();
  const shapeGroups = getShapesByCategory();
  const cornerGroups = getCornersByStyle();

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
              activeCategory === cat.id
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-accent"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Shapes (Native) */}
      {activeCategory === "shapes" && (
        <div className="space-y-4">
          <NativeShapeSection
            title="Basic Shapes"
            items={shapeGroups.basic}
            previews={previews}
            onSelect={onSelectNativeShape}
          />
          <NativeShapeSection
            title="Banners"
            items={shapeGroups.banners}
            previews={previews}
            onSelect={onSelectNativeShape}
          />
          <NativeShapeSection
            title="Labels"
            items={shapeGroups.labels}
            previews={previews}
            onSelect={onSelectNativeShape}
          />
          <NativeShapeSection
            title="Bubbles"
            items={shapeGroups.bubbles}
            previews={previews}
            onSelect={onSelectNativeShape}
          />
        </div>
      )}

      {/* Doodles */}
      {activeCategory === "doodles" && (
        <div className="space-y-4">
          <DoodleSection
            title="Arrows"
            items={doodleGroups.arrows}
            previews={previews}
            onSelect={onSelectDoodle}
          />
          <DoodleSection
            title="Underlines"
            items={doodleGroups.underlines}
            previews={previews}
            onSelect={onSelectDoodle}
          />
          <DoodleSection
            title="Circles"
            items={doodleGroups.circles}
            previews={previews}
            onSelect={onSelectDoodle}
          />
          <DoodleSection
            title="Stars & Hearts"
            items={[...doodleGroups.stars, ...doodleGroups.hearts]}
            previews={previews}
            onSelect={onSelectDoodle}
          />
        </div>
      )}

      {/* Corners */}
      {activeCategory === "corners" && (
        <div className="space-y-4">
          <CornerSection
            title="Classic"
            items={cornerGroups.classic}
            previews={previews}
            onSelect={onSelectCorner}
          />
          <CornerSection
            title="Decorative"
            items={cornerGroups.decorative}
            previews={previews}
            onSelect={onSelectCorner}
          />
          <CornerSection
            title="Tape Style"
            items={cornerGroups.tape}
            previews={previews}
            onSelect={onSelectCorner}
          />
        </div>
      )}
    </div>
  );
}

// Native shape section component
interface NativeShapeSectionProps {
  title: string;
  items: ShapeDefinition[];
  previews: Record<string, string>;
  onSelect: (shape: ShapeDefinition) => void;
}

function NativeShapeSection({ title, items, previews, onSelect }: NativeShapeSectionProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {title}
      </h4>
      <div className="grid grid-cols-4 gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="flex items-center justify-center p-2 h-14 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-colors"
            title={item.label}
          >
            {previews[item.id] && (
              <img
                src={previews[item.id]}
                alt={item.label}
                className="max-w-full max-h-full object-contain"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// Doodle section component
interface DoodleSectionProps {
  title: string;
  items: Doodle[];
  previews: Record<string, string>;
  onSelect: (doodle: Doodle, dataUrl: string) => void;
}

function DoodleSection({ title, items, previews, onSelect }: DoodleSectionProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {title}
      </h4>
      <div className="grid grid-cols-4 gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item, generateDoodleDataUrl(item))}
            className="flex items-center justify-center p-2 h-14 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-colors"
            title={item.label}
          >
            {previews[item.id] && (
              <img
                src={previews[item.id]}
                alt={item.label}
                className="max-w-full max-h-full object-contain"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// Corner section component
interface CornerSectionProps {
  title: string;
  items: PhotoCorner[];
  previews: Record<string, string>;
  onSelect: (corner: PhotoCorner, dataUrl: string) => void;
}

function CornerSection({ title, items, previews, onSelect }: CornerSectionProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {title}
      </h4>
      <div className="grid grid-cols-4 gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item, generatePhotoCornerDataUrl(item))}
            className="flex items-center justify-center p-2 h-14 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-colors"
            title={item.label}
          >
            {previews[item.id] && (
              <img
                src={previews[item.id]}
                alt={item.label}
                className="max-w-full max-h-full object-contain"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
