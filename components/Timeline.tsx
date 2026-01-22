"use client";

import { useMemo, useState, memo } from "react";
import { getProxyUrl } from "@/lib/s3";
import { formatDateTaken } from "@/lib/exif/extractExif";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MediaItem {
  id: string;
  type: "photo" | "video";
  url: string;
  s3Key: string;
  caption: string | null;
  location: string | null;
  dateTaken: string | null;
}

interface TimelineProps {
  media: MediaItem[];
}

// Memoized timeline item to prevent unnecessary re-renders
const TimelineItem = memo(function TimelineItem({
  item,
  isTop,
  onClick,
}: {
  item: MediaItem;
  isTop: boolean;
  onClick: () => void;
}) {
  // Media thumbnail component
  const MediaThumbnail = (
    <div className="aspect-square relative overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {item.type === "photo" ? (
        <img
          src={getProxyUrl(item.s3Key)}
          alt={item.caption || "Memory"}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
          loading="lazy"
        />
      ) : (
        <video
          src={item.url}
          className="w-full h-full object-cover"
          muted
          playsInline
          preload="none"
          draggable={false}
        />
      )}
      {item.type === "video" && (
        <div className="absolute top-1 right-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full">
          🎬
        </div>
      )}
    </div>
  );

  // Caption and location component (caption always above location)
  const CaptionLocation = (item.caption || item.location) ? (
    <div className={`space-y-0.5 ${isTop ? "mb-1.5" : "mt-1.5"}`}>
      {item.caption && (
        <p className="text-xs text-gray-700 line-clamp-2 leading-tight">
          {item.caption}
        </p>
      )}
      {item.location && (
        <p className="text-[10px] text-muted-foreground truncate">
          📍 {item.location}
        </p>
      )}
    </div>
  ) : null;

  return (
    <div className="relative flex flex-col items-center" style={{ width: "160px" }}>
      {/* Card positioned above or below with 28px gap */}
      <div
        className={`absolute left-0 right-0 cursor-pointer transition-transform hover:scale-105 ${
          isTop ? "bottom-[calc(50%+28px)]" : "top-[calc(50%+28px)]"
        }`}
        onClick={onClick}
      >
        {/* For top cards: caption/location then photo (text above, photo near track) */}
        {/* For bottom cards: photo then caption/location (photo near track, text below) */}
        {isTop ? (
          <>
            {CaptionLocation}
            {MediaThumbnail}
          </>
        ) : (
          <>
            {MediaThumbnail}
            {CaptionLocation}
          </>
        )}
      </div>

      {/* Connector line */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 w-0.5 h-6 bg-[#D4C8BC] ${
          isTop ? "bottom-1/2 mb-1.5" : "top-1/2 mt-1.5"
        }`}
      />

      {/* Timeline dot (centered) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-[3px] border-[#E8846E] z-10" />

      {/* Date label near the dot */}
      {item.dateTaken && (
        <div
          className={`absolute left-1/2 -translate-x-1/2 ${
            isTop ? "top-[calc(50%+10px)]" : "bottom-[calc(50%+10px)]"
          }`}
        >
          <span className="text-[10px] font-medium text-[#E8846E] whitespace-nowrap bg-white/90 px-1 rounded">
            {formatDateTaken(new Date(item.dateTaken))}
          </span>
        </div>
      )}
    </div>
  );
});

export function Timeline({ media }: TimelineProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  // Sort media by date taken (oldest first), items without dates go to the end
  const sortedMedia = useMemo(() => {
    return [...media].sort((a, b) => {
      if (!a.dateTaken && !b.dateTaken) return 0;
      if (!a.dateTaken) return 1;
      if (!b.dateTaken) return -1;
      return new Date(a.dateTaken).getTime() - new Date(b.dateTaken).getTime();
    });
  }, [media]);

  if (media.length === 0) {
    return (
      <div className="p-12 text-center bg-[#FBF5E6]/50 border-dashed border-2 border-[#D4C8BC] rounded-xl">
        <div className="text-5xl mb-4">📅</div>
        <p className="text-lg text-muted-foreground">
          No memories yet! Upload some photos or videos to see them on the timeline.
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        className="overflow-x-auto overflow-y-hidden"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#D4C8BC transparent'
        }}
      >
        {/* Container with fixed height to accommodate cards above and below */}
        <div className="relative min-w-max px-8" style={{ height: "500px" }}>
          {/* Timeline track - warm neutral color */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#D4C8BC] rounded-full" />

          {/* Timeline items */}
          <div className="relative h-full flex items-center gap-4">
            {sortedMedia.map((item, index) => (
              <TimelineItem
                key={item.id}
                item={item}
                isTop={index % 2 === 0}
                onClick={() => setSelectedMedia(item)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog
        open={!!selectedMedia}
        onOpenChange={(open) => !open && setSelectedMedia(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Memory Details</DialogTitle>
          </DialogHeader>

          {selectedMedia && (
            <div className="space-y-4">
              {/* Media display */}
              <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
                {selectedMedia.type === "photo" ? (
                  <img
                    src={getProxyUrl(selectedMedia.s3Key)}
                    alt={selectedMedia.caption || "Memory"}
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                ) : (
                  <video
                    src={getProxyUrl(selectedMedia.s3Key)}
                    className="w-full h-full"
                    controls
                    autoPlay
                  />
                )}
              </div>

              {/* Details */}
              <div className="space-y-3">
                {selectedMedia.dateTaken && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">📅</span>
                    <span className="font-medium">
                      {formatDateTaken(new Date(selectedMedia.dateTaken))}
                    </span>
                  </div>
                )}

                {selectedMedia.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">📍</span>
                    <span>{selectedMedia.location}</span>
                  </div>
                )}

                {selectedMedia.caption && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedMedia.caption}
                    </p>
                  </div>
                )}

                {!selectedMedia.dateTaken && !selectedMedia.location && !selectedMedia.caption && (
                  <p className="text-sm text-muted-foreground italic">
                    No additional details for this memory.
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
