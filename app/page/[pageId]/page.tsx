"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { MediaUploader } from "@/components/MediaUploader";
import { MediaGrid } from "@/components/MediaGrid";
import { PhotoMap } from "@/components/PhotoMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CanvasData, MediaItem } from "@/lib/canvas/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Dynamic import for canvas (Konva doesn't work with SSR)
const CanvasEditor = dynamic(
  () => import("@/components/canvas/CanvasEditor").then((mod) => mod.CanvasEditor),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-[16/9] max-w-[1200px] mx-auto bg-muted rounded-xl flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading canvas...</p>
        </div>
      </div>
    ),
  }
);

interface PageData {
  id: string;
  layoutType: string;
  canvasData: CanvasData | null;
  guest: {
    id: string;
    name: string;
  };
  media: MediaItem[];
}

export default function PageBuilder() {
  const params = useParams();
  const pageId = params.pageId as string;
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(async () => {
    try {
      const response = await fetch(`/api/page/${pageId}`);
      if (!response.ok) {
        throw new Error("Failed to load page");
      }
      const data = await response.json();
      setPageData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  const handleSaveCanvas = useCallback(
    async (canvasData: CanvasData) => {
      try {
        const response = await fetch(`/api/page/${pageId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ canvasData }),
        });

        if (!response.ok) {
          throw new Error("Failed to save canvas");
        }
      } catch (err) {
        console.error("Save error:", err);
        throw err;
      }
    },
    [pageId]
  );

  const handleUpdateMedia = useCallback(
    async (mediaId: string, data: { caption?: string; location?: string; latitude?: number; longitude?: number }) => {
      try {
        const response = await fetch("/api/media", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mediaId, ...data }),
        });

        if (!response.ok) {
          throw new Error("Failed to update media");
        }

        // Refresh page data to get updated media
        await fetchPage();
      } catch (err) {
        console.error("Update error:", err);
        throw err;
      }
    },
    [fetchPage]
  );

  const handleDeleteMedia = useCallback(
    async (mediaId: string) => {
      try {
        const response = await fetch("/api/media", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mediaId }),
        });

        if (!response.ok) {
          throw new Error("Failed to delete media");
        }

        // Refresh page data to reflect deletion
        await fetchPage();
      } catch (err) {
        console.error("Delete error:", err);
        throw err;
      }
    },
    [fetchPage]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading your page...</p>
        </div>
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-destructive">
              Unable to Load Page
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {error || "Page not found. Please check your invite link."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="page-title">
            {pageData.guest.name}&apos;s Page for Lily
          </h1>
          <p className="text-muted-foreground text-lg">
            Share your favorite memories and photos with Lily for her 32nd birthday
          </p>
        </div>

        {/* Tabs for Photos, Canvas, and Map */}
        <Tabs defaultValue="photos" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="photos">
              My Photos ({pageData.media.length})
            </TabsTrigger>
            <TabsTrigger value="canvas">
              Scrapbook Page
            </TabsTrigger>
            <TabsTrigger value="map">
              Map View
            </TabsTrigger>
          </TabsList>

          {/* Photo Manager Tab */}
          <TabsContent value="photos" className="mt-6 space-y-6">
            {/* Upload Section - only shows when My Photos tab is active */}
            <MediaUploader
              guestId={pageData.guest.id}
              pageId={pageData.id}
              onUploadComplete={fetchPage}
            />
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Click on a photo to add a caption, location, or story. These details will be saved with your memories.
              </p>
              <MediaGrid
                media={pageData.media}
                onUpdate={handleUpdateMedia}
                onDelete={handleDeleteMedia}
              />
            </div>
          </TabsContent>

          {/* Canvas Editor Tab - forceMount keeps it mounted to preserve state */}
          {/* Use absolute positioning with full width when inactive to avoid Konva dimension errors */}
          <TabsContent
            value="canvas"
            className="mt-6 data-[state=inactive]:absolute data-[state=inactive]:left-0 data-[state=inactive]:right-0 data-[state=inactive]:opacity-0 data-[state=inactive]:pointer-events-none data-[state=inactive]:-z-10"
            forceMount
          >
            <div>
              {/* Key forces re-init when media changes (add/delete) */}
              <CanvasEditor
                key={pageData.media.map((m) => m.id).join(",")}
                pageId={pageData.id}
                initialCanvasData={pageData.canvasData}
                media={pageData.media}
                onSave={handleSaveCanvas}
              />
            </div>
          </TabsContent>

          {/* Map View Tab */}
          <TabsContent value="map" className="mt-6">
            <p className="text-sm text-muted-foreground mb-4">
              See where your photos were taken on a map. Photos with GPS data from your camera will appear automatically.
            </p>
            <PhotoMap
              photos={pageData.media
                .filter((m): m is MediaItem & { latitude: number; longitude: number } =>
                  m.type === "photo" && m.latitude !== null && m.longitude !== null
                )
                .map((m) => ({
                  id: m.id,
                  url: m.url,
                  caption: m.caption,
                  location: m.location,
                  latitude: m.latitude,
                  longitude: m.longitude,
                }))}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
