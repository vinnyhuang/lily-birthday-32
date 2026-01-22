"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhotoMap } from "@/components/PhotoMap";
import { Timeline } from "@/components/Timeline";
import { Button } from "@/components/ui/button";
import { CanvasData, CanvasPage, normalizeCanvasData } from "@/lib/canvas/types";
import { getProxyUrl } from "@/lib/s3";

const CanvasViewer = dynamic(
  () => import("@/components/canvas/CanvasViewer").then((mod) => mod.CanvasViewer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full max-w-[1200px] aspect-[16/9] bg-muted rounded-xl flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading canvas...</p>
        </div>
      </div>
    ),
  }
);

interface MediaData {
  id: string;
  type: string;
  s3Key: string;
  caption: string | null;
  location: string | null;
  dateTaken: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface GuestData {
  id: string;
  name: string;
  page: {
    id: string;
    canvasData: CanvasData | null;
    media: MediaData[];
  } | null;
}

interface FlattenedPage {
  guestId: string;
  guestName: string;
  pageIndex: number;
  totalGuestPages: number;
  page: CanvasPage;
  canvasWidth: number;
  canvasHeight: number;
}

export default function AggregatePage() {
  const router = useRouter();
  const [guests, setGuests] = useState<GuestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPageIdx, setCurrentPageIdx] = useState(0);

  // Hide admin nav bar on this page
  useEffect(() => {
    const nav = document.querySelector("nav");
    const main = nav?.closest(".min-h-screen")?.querySelector("main");
    if (nav) nav.style.display = "none";
    if (main) (main as HTMLElement).style.paddingTop = "0";
    return () => {
      if (nav) nav.style.display = "";
      if (main) (main as HTMLElement).style.paddingTop = "";
    };
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/admin/aggregate");
        if (response.ok) {
          const data = await response.json();
          setGuests(data.guests);
        }
      } catch (error) {
        console.error("Failed to fetch aggregate data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Flatten all guests' pages into a sequential list
  const flattenedPages = useMemo(() => {
    const pages: FlattenedPage[] = [];
    for (const guest of guests) {
      if (!guest.page?.canvasData) continue;
      const normalized = normalizeCanvasData(guest.page.canvasData);
      for (let i = 0; i < normalized.pages.length; i++) {
        pages.push({
          guestId: guest.id,
          guestName: guest.name,
          pageIndex: i,
          totalGuestPages: normalized.pages.length,
          page: normalized.pages[i],
          canvasWidth: normalized.width,
          canvasHeight: normalized.height,
        });
      }
    }
    return pages;
  }, [guests]);

  // All media for map and timeline
  const allMedia = useMemo(() => {
    const media: MediaData[] = [];
    for (const guest of guests) {
      if (guest.page?.media) {
        media.push(...guest.page.media);
      }
    }
    return media;
  }, [guests]);

  // Map photos (media with valid lat/lng)
  const mapPhotos = useMemo(() => {
    return allMedia
      .filter((m): m is MediaData & { latitude: number; longitude: number } =>
        m.latitude !== null && m.longitude !== null
      )
      .map((m) => ({
        id: m.id,
        type: m.type as "photo" | "video",
        url: getProxyUrl(m.s3Key),
        s3Key: m.s3Key,
        caption: m.caption,
        location: m.location,
        latitude: m.latitude,
        longitude: m.longitude,
      }));
  }, [allMedia]);

  // Timeline media
  const timelineMedia = useMemo(() => {
    return allMedia.map((m) => ({
      id: m.id,
      type: m.type as "photo" | "video",
      url: getProxyUrl(m.s3Key),
      s3Key: m.s3Key,
      caption: m.caption,
      location: m.location,
      dateTaken: m.dateTaken,
    }));
  }, [allMedia]);

  // Guest list for dropdown (only guests with canvas pages)
  const guestsWithPages = useMemo(() => {
    const seen = new Set<string>();
    const result: { id: string; name: string; startIdx: number }[] = [];
    flattenedPages.forEach((fp, idx) => {
      if (!seen.has(fp.guestId)) {
        seen.add(fp.guestId);
        result.push({ id: fp.guestId, name: fp.guestName, startIdx: idx });
      }
    });
    return result;
  }, [flattenedPages]);

  const currentFlatPage = flattenedPages[currentPageIdx];

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">Loading aggregate data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="page-title">Happy Birthday Lily!</h1>
      </div>

      <Tabs defaultValue="scrapbook" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scrapbook">
            Scrapbook Pages ({flattenedPages.length})
          </TabsTrigger>
          <TabsTrigger value="map">
            Map View ({mapPhotos.length})
          </TabsTrigger>
          <TabsTrigger value="timeline">
            Timeline ({timelineMedia.length})
          </TabsTrigger>
        </TabsList>

        {/* Scrapbook Pages Tab */}
        <TabsContent value="scrapbook" className="mt-6">
          {flattenedPages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-5xl mb-4">📖</div>
              <p>No scrapbook pages created yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Navigation bar */}
              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPageIdx === 0}
                  onClick={() => setCurrentPageIdx((i) => Math.max(0, i - 1))}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </Button>

                <div className="flex items-center gap-2 text-sm">
                  <select
                    value={currentFlatPage?.guestId || ""}
                    onChange={(e) => {
                      const guest = guestsWithPages.find((g) => g.id === e.target.value);
                      if (guest) setCurrentPageIdx(guest.startIdx);
                    }}
                    className="border rounded px-2 py-1 text-sm bg-white"
                  >
                    {guestsWithPages.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                  {currentFlatPage && (
                    <span className="text-muted-foreground">
                      Page {currentFlatPage.pageIndex + 1}/{currentFlatPage.totalGuestPages}
                    </span>
                  )}
                  <span className="text-muted-foreground">
                    ({currentPageIdx + 1}/{flattenedPages.length} total)
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPageIdx === flattenedPages.length - 1}
                  onClick={() => setCurrentPageIdx((i) => Math.min(flattenedPages.length - 1, i + 1))}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Button>
              </div>

              {/* Canvas viewer */}
              <div className="flex justify-center">
                {currentFlatPage && (
                  <CanvasViewer
                    key={`${currentFlatPage.guestId}-${currentFlatPage.pageIndex}`}
                    page={currentFlatPage.page}
                    canvasWidth={currentFlatPage.canvasWidth}
                    canvasHeight={currentFlatPage.canvasHeight}
                  />
                )}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Map View Tab */}
        <TabsContent value="map" className="mt-6">
          <PhotoMap photos={mapPhotos} />
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="mt-6">
          <Timeline media={timelineMedia} />
        </TabsContent>
      </Tabs>

      {/* Floating return button */}
      <button
        onClick={() => router.push("/admin")}
        className="fixed bottom-4 right-4 px-3 py-1.5 text-xs text-muted-foreground bg-white/80 backdrop-blur-sm border border-border rounded-full shadow-sm hover:text-foreground hover:bg-white transition-colors"
      >
        Return to Admin
      </button>
    </div>
  );
}
