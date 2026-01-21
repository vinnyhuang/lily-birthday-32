"use client";

import { Drawer } from "vaul";
import { Button } from "@/components/ui/button";
import { StickerPicker } from "./StickerPicker";
import { BackgroundPicker } from "./BackgroundPicker";
import { PhotoPicker } from "./PhotoPicker";
import { WashiTapePicker } from "./WashiTapePicker";
import { DecorativeElementsPicker } from "./DecorativeElementsPicker";
import { Sticker } from "./stickers";
import { WashiTape } from "./washiTapes";
import { Doodle } from "./doodles";
import { ShapeDefinition } from "./shapes";
import { PhotoCorner } from "./photoCorners";
import { CanvasBackground, MediaItem } from "@/lib/canvas/types";

export type TabType = "photos" | "stickers" | "washi" | "decor" | "text" | "background";

interface DecorationPanelProps {
  onAddSticker: (sticker: Sticker, src: string) => void;
  onAddNativeShape: (shape: ShapeDefinition) => void;
  onChangeBackground: (background: CanvasBackground) => void;
  onAddText: () => void;
  onAddPhotos: (media: MediaItem[]) => void;
  currentBackground: CanvasBackground;
  media: MediaItem[];
  onCanvasMediaIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function DecorationPanel({
  onAddSticker,
  onAddNativeShape,
  onChangeBackground,
  onAddText,
  onAddPhotos,
  currentBackground,
  media,
  onCanvasMediaIds,
  open,
  onOpenChange,
  activeTab,
  onTabChange,
}: DecorationPanelProps) {

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: "photos", label: "Photos", icon: "📷" },
    { id: "stickers", label: "Stickers", icon: "🎨" },
    { id: "washi", label: "Washi", icon: "📏" },
    { id: "decor", label: "Decor", icon: "✨" },
    { id: "text", label: "Text", icon: "Aa" },
    { id: "background", label: "Background", icon: "🖼️" },
  ];

  const handleAddSticker = (sticker: Sticker, src: string) => {
    onAddSticker(sticker, src);
    onOpenChange(false);
  };

  const handleAddWashiTape = (tape: WashiTape, dataUrl: string) => {
    // Convert washi tape to sticker format
    const stickerLike: Sticker = {
      id: tape.id,
      emoji: tape.label,
      label: tape.label,
      category: "washi",
    };
    onAddSticker(stickerLike, dataUrl);
    onOpenChange(false);
  };

  const handleAddDoodle = (doodle: Doodle, dataUrl: string) => {
    const stickerLike: Sticker = {
      id: doodle.id,
      emoji: doodle.label,
      label: doodle.label,
      category: "doodle",
    };
    onAddSticker(stickerLike, dataUrl);
    onOpenChange(false);
  };

  const handleAddNativeShape = (shape: ShapeDefinition) => {
    onAddNativeShape(shape);
    onOpenChange(false);
  };

  const handleAddCorner = (corner: PhotoCorner, dataUrl: string) => {
    const stickerLike: Sticker = {
      id: corner.id,
      emoji: corner.label,
      label: corner.label,
      category: "photo-corner",
    };
    onAddSticker(stickerLike, dataUrl);
    onOpenChange(false);
  };

  const handleAddText = () => {
    onAddText();
    onOpenChange(false);
  };

  const handleAddPhotos = (mediaItems: MediaItem[]) => {
    onAddPhotos(mediaItems);
    onOpenChange(false);
  };

  // Count photos not on canvas
  const availablePhotoCount = media.filter(
    (m) => m.type === "photo" && !onCanvasMediaIds.includes(m.id)
  ).length;

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 bg-[#FDF8F3] rounded-t-3xl">
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#D4C8BC] mt-4 mb-2" />

          <div className="p-4 max-h-[70vh] overflow-y-auto">
            <Drawer.Title className="sr-only">Add Content</Drawer.Title>

            {/* Tab buttons */}
            <div className="flex gap-2 mb-4 border-b border-[#E8DFD6] pb-4 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-primary text-white shadow-sm"
                      : "bg-white border border-[#E8DFD6] hover:border-primary/50"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.id === "photos" && availablePhotoCount > 0 && activeTab !== "photos" && (
                    <span className="bg-[#FCEAE6] text-primary text-xs px-1.5 rounded-full">
                      {availablePhotoCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="min-h-[200px]">
              {activeTab === "photos" && (
                <PhotoPicker
                  media={media}
                  onCanvasMediaIds={onCanvasMediaIds}
                  onSelect={handleAddPhotos}
                />
              )}

              {activeTab === "stickers" && (
                <StickerPicker onSelect={handleAddSticker} />
              )}

              {activeTab === "washi" && (
                <WashiTapePicker onSelect={handleAddWashiTape} />
              )}

              {activeTab === "decor" && (
                <DecorativeElementsPicker
                  onSelectDoodle={handleAddDoodle}
                  onSelectNativeShape={handleAddNativeShape}
                  onSelectCorner={handleAddCorner}
                />
              )}

              {activeTab === "text" && (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">✏️</div>
                  <p className="text-muted-foreground mb-4">
                    Add a text box to write messages or captions
                  </p>
                  <Button onClick={handleAddText}>
                    Add Text Box
                  </Button>
                </div>
              )}

              {activeTab === "background" && (
                <BackgroundPicker
                  currentBackground={currentBackground}
                  onSelect={onChangeBackground}
                />
              )}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
