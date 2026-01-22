"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LocationAutocomplete } from "@/components/upload/LocationAutocomplete";
import { formatDateTaken } from "@/lib/exif/extractExif";
import { getProxyUrl, getThumbnailS3Key } from "@/lib/s3";
import { Calendar } from "lucide-react";

export interface MediaItem {
  id: string;
  type: "photo" | "video";
  url: string;
  s3Key: string;
  caption: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  dateTaken: string | null;
}

interface MediaGridProps {
  media: MediaItem[];
  onUpdate: (id: string, data: { caption?: string; location?: string; latitude?: number; longitude?: number; dateTaken?: string | null }) => void;
  onDelete: (id: string) => void;
}

export function MediaGrid({ media, onUpdate, onDelete }: MediaGridProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editCoordinates, setEditCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [editDateTaken, setEditDateTaken] = useState<string>("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const openEditDialog = (item: MediaItem) => {
    setSelectedMedia(item);
    setIsVideoPlaying(false);
    setEditCaption(item.caption || "");
    setEditLocation(item.location || "");
    setEditCoordinates(
      item.latitude && item.longitude
        ? { latitude: item.latitude, longitude: item.longitude }
        : null
    );
    // Convert ISO date to YYYY-MM-DD format for date input
    setEditDateTaken(item.dateTaken ? item.dateTaken.split("T")[0] : "");
  };

  const handleSave = async () => {
    if (!selectedMedia) return;
    setIsSaving(true);

    // Convert date to ISO string if present
    let dateTakenISO: string | null | undefined = undefined;
    if (editDateTaken !== (selectedMedia.dateTaken?.split("T")[0] || "")) {
      dateTakenISO = editDateTaken ? new Date(editDateTaken + "T12:00:00").toISOString() : null;
    }

    await onUpdate(selectedMedia.id, {
      caption: editCaption || undefined,
      location: editLocation || undefined,
      latitude: editCoordinates?.latitude,
      longitude: editCoordinates?.longitude,
      ...(dateTakenISO !== undefined && { dateTaken: dateTakenISO }),
    });
    setIsSaving(false);
    setSelectedMedia(null);
  };

  const handleDelete = async () => {
    if (!selectedMedia) return;
    const mediaToDelete = selectedMedia;
    // Close modal immediately for better UX
    setSelectedMedia(null);
    setIsDeleting(true);
    try {
      await onDelete(mediaToDelete.id);
    } finally {
      setIsDeleting(false);
    }
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
            <img
              src={item.type === "photo"
                ? getProxyUrl(item.s3Key)
                : getProxyUrl(getThumbnailS3Key(item.s3Key))}
              alt={item.caption || "Memory"}
              className="absolute inset-0 w-full h-full object-cover"
            />
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
        modal={false}
      >
        <DialogContent
          className="max-w-2xl"
          hideOverlay
          onClick={(e) => {
            // Close autocomplete dropdown when clicking inside dialog but outside the dropdown
            const target = e.target as HTMLElement;
            if (!target.closest('.pac-container') && !target.closest('input[id="location"]')) {
              // Blur the location input to close autocomplete
              const locationInput = document.getElementById('location') as HTMLInputElement;
              if (locationInput && document.activeElement === locationInput) {
                locationInput.blur();
              }
            }
          }}
          onInteractOutside={(e) => {
            // Prevent dialog from closing when Google Places autocomplete is visible
            // Check ALL pac-containers since Google may create multiple
            const pacContainers = document.querySelectorAll('.pac-container');
            let hasVisibleDropdown = false;
            pacContainers.forEach(container => {
              const style = window.getComputedStyle(container);
              if (style.display !== 'none' && style.visibility !== 'hidden') {
                hasVisibleDropdown = true;
              }
            });

            if (hasVisibleDropdown) {
              e.preventDefault();
              // Blur the input to close the autocomplete dropdown
              const locationInput = document.getElementById('location') as HTMLInputElement;
              if (locationInput) {
                locationInput.blur();
              }
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Edit Memory</DialogTitle>
          </DialogHeader>

          {selectedMedia && (
            <div className="space-y-4">
              <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
                {selectedMedia.type === "photo" ? (
                  <img
                    src={getProxyUrl(selectedMedia.s3Key)}
                    alt={selectedMedia.caption || "Memory"}
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                ) : isVideoPlaying ? (
                  <video
                    src={getProxyUrl(selectedMedia.s3Key)}
                    className="w-full h-full"
                    controls
                    autoPlay
                  />
                ) : (
                  <div
                    className="relative w-full h-full cursor-pointer group"
                    onClick={() => setIsVideoPlaying(true)}
                  >
                    <img
                      src={getProxyUrl(getThumbnailS3Key(selectedMedia.s3Key))}
                      alt={selectedMedia.caption || "Video thumbnail"}
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <span className="text-2xl ml-1">▶</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {/* Date taken field with calendar picker */}
                <div className="space-y-2">
                  <Label htmlFor="dateTaken">Taken on</Label>
                  <div className="relative">
                    <Input
                      id="dateTaken"
                      type="date"
                      value={editDateTaken}
                      onChange={(e) => setEditDateTaken(e.target.value)}
                      className="pr-10"
                      placeholder="Select date..."
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

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
                  onChange={(location, coordinates) => {
                    setEditLocation(location);
                    if (coordinates) {
                      setEditCoordinates(coordinates);
                    }
                  }}
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
