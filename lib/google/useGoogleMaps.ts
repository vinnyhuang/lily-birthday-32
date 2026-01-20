"use client";

import { useEffect, useState } from "react";

// Declare google namespace for TypeScript
declare global {
  interface Window {
    google?: typeof google;
    __googleMapsCallback?: () => void;
    __googleMapsLoading?: boolean;
  }
}

/**
 * Shared hook for loading Google Maps JavaScript API
 * Ensures the script is only loaded once across all components
 */
export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      setError("Google Maps API key not configured");
      return;
    }

    // Already loaded
    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    // Already loading - wait for it
    if (window.__googleMapsLoading) {
      const checkLoaded = setInterval(() => {
        if (window.google?.maps) {
          setIsLoaded(true);
          clearInterval(checkLoaded);
        }
      }, 100);

      return () => clearInterval(checkLoaded);
    }

    // Start loading
    window.__googleMapsLoading = true;

    // Create callback
    window.__googleMapsCallback = () => {
      window.__googleMapsLoading = false;
      setIsLoaded(true);
    };

    // Load the script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&callback=__googleMapsCallback`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      window.__googleMapsLoading = false;
      setError("Failed to load Google Maps");
    };
    document.head.appendChild(script);

    return () => {
      // Don't remove the script - other components may need it
    };
  }, []);

  return { isLoaded, error };
}
