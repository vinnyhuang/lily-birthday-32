"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PageData {
  id: string;
  layoutType: string;
  createdAt: string;
  guest: {
    id: string;
    name: string;
    createdAt: string;
  };
  media: {
    id: string;
    type: string;
    url: string;
  }[];
  _count: {
    media: number;
  };
}

export default function PagesPage() {
  const [pages, setPages] = useState<PageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPages() {
      try {
        const response = await fetch("/api/admin/pages");
        if (response.ok) {
          const data = await response.json();
          setPages(data);
        }
      } catch (error) {
        console.error("Failed to fetch pages:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPages();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">Loading pages...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="page-title">Guest Pages</h1>
        <p className="text-muted-foreground mt-1">
          View all guest scrapbook pages and their memories
        </p>
      </div>

      {pages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-5xl mb-4">📖</div>
            <p className="text-muted-foreground">
              No guest pages yet. Share invite links to get started!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pages.map((page, pageIndex) => (
            <Card
              key={page.id}
              className="overflow-hidden card-interactive"
              style={{ transform: `rotate(${pageIndex % 2 === 0 ? -1 : 1}deg)` }}
            >
              {/* Preview thumbnails with photo-like styling */}
              <div className="aspect-video bg-[#F5EDE4] relative">
                {page.media.length > 0 ? (
                  <div className="grid grid-cols-2 gap-1 h-full p-2">
                    {page.media.slice(0, 4).map((media, index) => (
                      <div
                        key={media.id}
                        className="relative overflow-hidden rounded-md photo-shadow"
                        style={{ transform: `rotate(${(index - 1.5) * 2}deg)` }}
                      >
                        {media.type === "photo" ? (
                          <img
                            src={media.url}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={media.url}
                            className="w-full h-full object-cover"
                            muted
                          />
                        )}
                        {index === 3 && page._count.media > 4 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white font-bold font-display text-xl">
                              +{page._count.media - 4}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <span className="text-4xl mb-2">📷</span>
                    <span className="text-sm">No photos yet</span>
                  </div>
                )}
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-display text-primary">{page.guest.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {page._count.media} {page._count.media === 1 ? "memory" : "memories"}
                  </p>
                  <Link href={`/page/${page.id}`} target="_blank">
                    <Button variant="outline" size="sm">
                      View Page
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
