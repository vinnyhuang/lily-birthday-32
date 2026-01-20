"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { useGoogleMaps } from "@/lib/google/useGoogleMaps";

interface PhotoLocation {
  id: string;
  url: string;
  caption: string | null;
  location: string | null;
  latitude: number;
  longitude: number;
}

interface PhotoMapProps {
  photos: PhotoLocation[];
  className?: string;
}

export function PhotoMap({ photos, className = "" }: PhotoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const { isLoaded } = useGoogleMaps();
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoLocation | null>(null);

  // Filter to only photos with valid numeric coordinates (defensive runtime check)
  const validPhotos = useMemo(() => {
    return photos.filter((photo) => {
      const lat = photo.latitude;
      const lng = photo.longitude;
      return (
        typeof lat === "number" &&
        typeof lng === "number" &&
        !isNaN(lat) &&
        !isNaN(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
      );
    });
  }, [photos]);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;
    if (!window.google?.maps) return;

    // Default center (will be overridden by photo locations)
    const defaultCenter = { lat: 37.7749, lng: -122.4194 }; // San Francisco

    const map = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 10,
      mapId: "photo-map", // Required for AdvancedMarkerElement
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      styles: [
        // Warm, soft map styling
        {
          featureType: "all",
          elementType: "geometry",
          stylers: [{ saturation: -20 }],
        },
        {
          featureType: "water",
          elementType: "geometry.fill",
          stylers: [{ color: "#E5ECF0" }],
        },
        {
          featureType: "landscape",
          elementType: "geometry.fill",
          stylers: [{ color: "#F5EDE4" }],
        },
        {
          featureType: "road",
          elementType: "geometry.fill",
          stylers: [{ color: "#FFFFFF" }],
        },
        {
          featureType: "road",
          elementType: "geometry.stroke",
          stylers: [{ color: "#E8DFD6" }],
        },
      ],
    });

    mapInstanceRef.current = map;
  }, [isLoaded]);

  // Create custom marker element
  const createMarkerContent = useCallback((photo: PhotoLocation, isSelected: boolean) => {
    const container = document.createElement("div");
    container.className = `relative cursor-pointer transition-transform duration-200 ${isSelected ? "scale-125 z-10" : "hover:scale-110"}`;

    // Photo thumbnail
    const img = document.createElement("img");
    img.src = photo.url;
    img.className = "w-12 h-12 rounded-lg object-cover border-2 border-white shadow-lg";
    if (isSelected) {
      img.className += " ring-2 ring-[#E8846E] ring-offset-2";
    }

    // Pin pointer
    const pointer = document.createElement("div");
    pointer.className = "absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-white";

    container.appendChild(img);
    container.appendChild(pointer);

    return container;
  }, []);

  // Add markers for photos
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;
    if (!window.google?.maps?.marker?.AdvancedMarkerElement) return;

    const map = mapInstanceRef.current;
    const bounds = new window.google.maps.LatLngBounds();

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      marker.map = null;
    });
    markersRef.current = [];

    // Add markers for each photo with valid location
    validPhotos.forEach((photo) => {
      const position = { lat: photo.latitude, lng: photo.longitude };
      bounds.extend(position);

      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        map,
        position,
        content: createMarkerContent(photo, selectedPhoto?.id === photo.id),
        title: photo.location || photo.caption || "Photo",
      });

      marker.addListener("click", () => {
        setSelectedPhoto(photo);
      });

      markersRef.current.push(marker);
    });

    // Fit map to show all markers
    if (validPhotos.length > 0) {
      if (validPhotos.length === 1) {
        map.setCenter({ lat: validPhotos[0].latitude, lng: validPhotos[0].longitude });
        map.setZoom(14);
      } else {
        map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
      }
    }
  }, [isLoaded, validPhotos, selectedPhoto, createMarkerContent]);

  // Update marker appearance when selection changes
  useEffect(() => {
    if (!isLoaded || markersRef.current.length === 0) return;

    markersRef.current.forEach((marker, index) => {
      const photo = validPhotos[index];
      if (photo && marker.content) {
        marker.content = createMarkerContent(photo, selectedPhoto?.id === photo.id);
      }
    });
  }, [selectedPhoto, validPhotos, isLoaded, createMarkerContent]);

  // No photos with valid location
  if (validPhotos.length === 0) {
    return (
      <Card className={`flex items-center justify-center p-8 bg-[#F5EDE4] ${className}`}>
        <div className="text-center text-muted-foreground">
          <div className="text-4xl mb-3">🗺️</div>
          <p className="font-medium">No photo locations yet</p>
          <p className="text-sm mt-1">
            Photos with GPS data will appear on the map
          </p>
        </div>
      </Card>
    );
  }

  // No API key
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <Card className={`flex items-center justify-center p-8 bg-[#F5EDE4] ${className}`}>
        <div className="text-center text-muted-foreground">
          <div className="text-4xl mb-3">🔑</div>
          <p className="font-medium">Map not configured</p>
          <p className="text-sm mt-1">
            Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable maps
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Map container */}
      <Card className="overflow-hidden">
        <div
          ref={mapRef}
          className="w-full h-[400px]"
          style={{ minHeight: "300px" }}
        />
      </Card>

      {/* Selected photo info */}
      {selectedPhoto && (
        <Card className="absolute bottom-4 left-4 right-4 p-3 bg-white/95 backdrop-blur-sm shadow-lg flex items-center gap-3">
          <img
            src={selectedPhoto.url}
            alt={selectedPhoto.caption || "Photo"}
            className="w-16 h-16 rounded-lg object-cover photo-shadow"
          />
          <div className="flex-1 min-w-0">
            {selectedPhoto.location && (
              <p className="font-medium text-sm truncate flex items-center gap-1">
                <span>📍</span>
                {selectedPhoto.location}
              </p>
            )}
            {selectedPhoto.caption && (
              <p className="text-sm text-muted-foreground truncate mt-0.5">
                {selectedPhoto.caption}
              </p>
            )}
          </div>
          <button
            onClick={() => setSelectedPhoto(null)}
            className="p-1 hover:bg-muted rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </Card>
      )}

      {/* Loading state */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#F5EDE4] rounded-2xl">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}
