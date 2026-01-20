"use client";

import { useState } from "react";
import { Drawer } from "vaul";
import { Button } from "@/components/ui/button";
import { StickerPicker } from "./StickerPicker";
import { BackgroundPicker } from "./BackgroundPicker";
import { PhotoPicker } from "./PhotoPicker";
import { Sticker } from "./stickers";
import { CanvasBackground, MediaItem } from "@/lib/canvas/types";

interface DecorationPanelProps {
  onAddSticker: (sticker: Sticker, src: string) => void;
  onChangeBackground: (background: CanvasBackground) => void;
  onAddText: () => void;
  onAddPhotos: (media: MediaItem[]) => void;
  currentBackground: CanvasBackground;
  media: MediaItem[];
  onCanvasMediaIds: string[];
}

type TabType = "photos" | "stickers" | "text" | "background";

export function DecorationPanel({
  onAddSticker,
  onChangeBackground,
  onAddText,
  onAddPhotos,
  currentBackground,
  media,
  onCanvasMediaIds,
}: DecorationPanelProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("photos");

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: "photos", label: "Photos", icon: "📷" },
    { id: "stickers", label: "Stickers", icon: "🎨" },
    { id: "text", label: "Text", icon: "Aa" },
    { id: "background", label: "Background", icon: "🖼️" },
  ];

  const handleAddSticker = (sticker: Sticker, src: string) => {
    onAddSticker(sticker, src);
    setOpen(false);
  };

  const handleAddText = () => {
    onAddText();
    setOpen(false);
  };

  const handleAddPhotos = (mediaItems: MediaItem[]) => {
    onAddPhotos(mediaItems);
    setOpen(false);
  };

  // Count photos not on canvas
  const availablePhotoCount = media.filter(
    (m) => m.type === "photo" && !onCanvasMediaIds.includes(m.id)
  ).length;

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <Button variant="outline" size="sm">
          Add Content
          {availablePhotoCount > 0 && (
            <span className="ml-1.5 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
              {availablePhotoCount}
            </span>
          )}
        </Button>
      </Drawer.Trigger>

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
                  onClick={() => setActiveTab(tab.id)}
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
