"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { LocationAutocomplete } from "@/components/upload/LocationAutocomplete";
import { formatDateTaken } from "@/lib/exif/extractExif";

export interface MediaItem {
  id: string;
  type: "photo" | "video";
  url: string;
  caption: string | null;
  location: string | null;
  dateTaken: string | null;
}

interface MediaGridProps {
  media: MediaItem[];
  onUpdate: (id: string, data: { caption?: string; location?: string }) => void;
  onDelete: (id: string) => void;
}

export function MediaGrid({ media, onUpdate, onDelete }: MediaGridProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const openEditDialog = (item: MediaItem) => {
    setSelectedMedia(item);
    setEditCaption(item.caption || "");
    setEditLocation(item.location || "");
  };

  const handleSave = async () => {
    if (!selectedMedia) return;
    setIsSaving(true);
    await onUpdate(selectedMedia.id, {
      caption: editCaption || undefined,
      location: editLocation || undefined,
    });
    setIsSaving(false);
    setSelectedMedia(null);
  };

  const handleDelete = async () => {
    if (!selectedMedia) return;
    setIsDeleting(true);
    await onDelete(selectedMedia.id);
    setIsDeleting(false);
    setSelectedMedia(null);
  };

  if (media.length === 0) {
    return (
      <Card className="p-12 text-center bg-[#FBF5E6]/50 border-dashed border-2 border-[#D4C8BC]">
        <div className="text-5xl mb-4">📸</div>
        <p className="text-lg text-muted-foreground">
          No memories yet! Upload some photos or videos to get started.
        </p>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {media.map((item, index) => (
          <Card
            key={item.id}
            className="photo-grid-item group relative aspect-square overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all photo-shadow hover:scale-105"
            onClick={() => openEditDialog(item)}
            style={{ transform: `rotate(${(index % 4 - 1.5) * 1}deg)` }}
          >
            {item.type === "photo" ? (
              <img
                src={item.url}
                alt={item.caption || "Memory"}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <video
                src={item.url}
                className="w-full h-full object-cover"
                muted
                playsInline
                onMouseEnter={(e) => e.currentTarget.play()}
                onMouseLeave={(e) => {
                  e.currentTarget.pause();
                  e.currentTarget.currentTime = 0;
                }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
              {item.caption && (
                <p className="text-sm line-clamp-2">{item.caption}</p>
              )}
              {item.location && (
                <p className="text-xs opacity-75">📍 {item.location}</p>
              )}
            </div>
            {item.type === "video" && (
              <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                🎬 Video
              </div>
            )}
          </Card>
        ))}
      </div>

      <Dialog
        open={!!selectedMedia}
        onOpenChange={(open) => !open && setSelectedMedia(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Memory</DialogTitle>
          </DialogHeader>

          {selectedMedia && (
            <div className="space-y-4">
              <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
                {selectedMedia.type === "photo" ? (
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.caption || "Memory"}
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                ) : (
                  <video
                    src={selectedMedia.url}
                    className="w-full h-full"
                    controls
                  />
                )}
              </div>

              {/* Date taken badge */}
              {selectedMedia.dateTaken && (
                <div className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-lg">
                  Taken on {formatDateTaken(new Date(selectedMedia.dateTaken))}
                </div>
              )}

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="caption">Caption / Story</Label>
                  <Textarea
                    id="caption"
                    placeholder="Tell the story behind this memory..."
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    rows={3}
                  />
                </div>

                <LocationAutocomplete
                  value={editLocation}
                  onChange={setEditLocation}
                  placeholder="Where was this taken?"
                />
              </div>

              <div className="flex gap-2 justify-between">
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting || isSaving}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedMedia(null)}
                    disabled={isSaving || isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving || isDeleting}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
