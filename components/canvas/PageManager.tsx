"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CanvasPage, CanvasBackground, DEFAULT_PAGE_BACKGROUND } from "@/lib/canvas/types";
import { Plus, Trash2, ChevronUp, ChevronDown, Layers, Image, Type, Sticker, X } from "lucide-react";
import { textures } from "@/lib/canvas/textures";

interface PageManagerProps {
  pages: CanvasPage[];
  currentPageIndex: number;
  onAddPage: (background?: CanvasBackground) => void;
  onDeletePage: (pageIndex: number) => void;
  onReorderPage: (fromIndex: number, toIndex: number) => void;
  onSelectPage: (pageIndex: number) => void;
}

// Get background style for a page thumbnail
function getBackgroundStyle(page: CanvasPage): React.CSSProperties {
  if (page.background.type === "color") {
    return { backgroundColor: page.background.value };
  }
  // Texture background
  const texture = textures.find((t) => t.id === page.background.value);
  if (texture) {
    return {
      backgroundImage: `url(${texture.pattern})`,
      backgroundSize: `${texture.tileSize}px ${texture.tileSize}px`,
      backgroundRepeat: "repeat",
    };
  }
  return { backgroundColor: "#FFF8F0" };
}

// Get a random unused background for a new page
function getRandomUnusedBackground(pages: CanvasPage[]): CanvasBackground {
  // Get all backgrounds currently in use
  const usedBackgrounds = new Set(
    pages.map((p) => `${p.background.type}:${p.background.value}`)
  );

  // Build list of all available backgrounds (textures + default color)
  const allBackgrounds: CanvasBackground[] = [
    DEFAULT_PAGE_BACKGROUND,
    ...textures.map((t) => ({ type: "texture" as const, value: t.id })),
  ];

  // Filter to unused backgrounds
  const unusedBackgrounds = allBackgrounds.filter(
    (bg) => !usedBackgrounds.has(`${bg.type}:${bg.value}`)
  );

  // If all are used, pick from all backgrounds
  const availablePool = unusedBackgrounds.length > 0 ? unusedBackgrounds : allBackgrounds;

  // Pick one at random
  const randomIndex = Math.floor(Math.random() * availablePool.length);
  return availablePool[randomIndex];
}

// Count elements by type
function countElements(page: CanvasPage) {
  let media = 0;
  let text = 0;
  let stickers = 0;

  for (const el of page.elements) {
    if (el.type === "image" || el.type === "video") {
      media++;
    } else if (el.type === "text") {
      text++;
    } else if (el.type === "sticker") {
      stickers++;
    }
  }

  return { media, text, stickers, total: page.elements.length };
}

export function PageManager({
  pages,
  currentPageIndex,
  onAddPage,
  onDeletePage,
  onReorderPage,
  onSelectPage,
}: PageManagerProps) {
  const canDelete = pages.length > 1;

  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Layers className="h-5 w-5" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Manage Pages</p>
        </TooltipContent>
      </Tooltip>

      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Manage Pages</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => {
                  const background = getRandomUnusedBackground(pages);
                  onAddPage(background);
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Page
              </Button>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </DialogTrigger>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable page list */}
        <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1">
          {pages.map((page, index) => {
            const isCurrent = index === currentPageIndex;
            const canMoveUp = index > 0;
            const canMoveDown = index < pages.length - 1;
            const counts = countElements(page);

            return (
              <div
                key={page.id}
                className={`flex items-center gap-3 p-2 rounded-lg border transition-colors cursor-pointer ${
                  isCurrent
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
                onClick={() => onSelectPage(index)}
              >
                {/* Page thumbnail with background */}
                <div
                  className="w-16 h-10 rounded border border-border/50 flex-shrink-0"
                  style={getBackgroundStyle(page)}
                />

                {/* Page info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      Page {index + 1}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                        Current
                      </span>
                    )}
                  </div>

                  {/* Element counts */}
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    {counts.media > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Image className="h-3 w-3" />
                        {counts.media}
                      </span>
                    )}
                    {counts.text > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Type className="h-3 w-3" />
                        {counts.text}
                      </span>
                    )}
                    {counts.stickers > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Sticker className="h-3 w-3" />
                        {counts.stickers}
                      </span>
                    )}
                    {counts.total === 0 && (
                      <span className="italic">Empty</span>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                  {/* Move up */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => canMoveUp && onReorderPage(index, index - 1)}
                    disabled={!canMoveUp}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>

                  {/* Move down */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => canMoveDown && onReorderPage(index, index + 1)}
                    disabled={!canMoveDown}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>

                  {/* Delete */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => canDelete && onDeletePage(index)}
                    disabled={!canDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
