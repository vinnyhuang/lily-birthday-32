"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LocationAutocomplete } from "./LocationAutocomplete";
import { formatDateTaken } from "@/lib/exif/extractExif";

interface MediaItem {
  id: string;
  type: "photo" | "video";
  url: string;
  caption: string | null;
  location: string | null;
  dateTaken: string | null;
}

interface MediaDetailsProps {
  media: MediaItem | null;
  open: boolean;
  onClose: () => void;
  onSave: (mediaId: string, updates: { caption?: string; location?: string }) => Promise<void>;
}

export function MediaDetails({ media, open, onClose, onSave }: MediaDetailsProps) {
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when media changes
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (isOpen && media) {
        setCaption(media.caption || "");
        setLocation(media.location || "");
      }
      if (!isOpen) {
        onClose();
      }
    },
    [media, onClose]
  );

  const handleSave = async () => {
    if (!media) return;

    setIsSaving(true);
    try {
      await onSave(media.id, {
        caption: caption || undefined,
        location: location || undefined,
      });
      onClose();
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!media) return null;

  const dateTakenFormatted = media.dateTaken
    ? formatDateTaken(new Date(media.dateTaken))
    : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Photo Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview */}
          <div className="aspect-square bg-muted rounded-lg overflow-hidden">
            {media.type === "photo" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={media.url}
                alt="Photo preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={media.url}
                className="w-full h-full object-cover"
                controls
              />
            )}
          </div>

          {/* Date taken */}
          {dateTakenFormatted && (
            <div className="text-sm text-muted-foreground">
              Taken on {dateTakenFormatted}
            </div>
          )}

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="caption">Caption</Label>
            <Input
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption (optional)"
            />
          </div>

          {/* Location */}
          <LocationAutocomplete
            value={location}
            onChange={setLocation}
          />

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
