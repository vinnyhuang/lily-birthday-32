"use client";

import { useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { useGoogleMaps } from "@/lib/google/useGoogleMaps";

interface LocationAutocompleteProps {
  value: string;
  onChange: (location: string, coordinates?: { latitude: number; longitude: number }) => void;
  placeholder?: string;
}

export function LocationAutocomplete({
  value,
  onChange,
  placeholder = "Add a location (optional)",
}: LocationAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const justSelectedFromAutocomplete = useRef(false);
  const { isLoaded } = useGoogleMaps();

  // Memoize onChange to prevent effect re-runs
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Initialize Google Places Autocomplete when API is loaded
  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) {
      return;
    }

    // Create autocomplete instance
    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ["establishment", "geocode"],
        fields: ["formatted_address", "name", "geometry"],
      }
    );

    // Handle place selection
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place) {
        const locationName = place.name || place.formatted_address || "";
        const coordinates = place.geometry?.location
          ? {
              latitude: place.geometry.location.lat(),
              longitude: place.geometry.location.lng(),
            }
          : undefined;
        // Set flag to prevent blur handler from overriding this selection
        justSelectedFromAutocomplete.current = true;
        onChangeRef.current(locationName, coordinates);
      }
    });

    autocompleteRef.current = autocomplete;

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
      // Clean up pac-containers when component unmounts
      // Google creates these and doesn't always clean them up
      const pacContainers = document.querySelectorAll('.pac-container');
      pacContainers.forEach(container => {
        container.remove();
      });
    };
  }, [isLoaded]);

  // Sync value to input when it changes externally
  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value;
    }
  }, [value]);

  // Handle blur to capture manual edits
  const handleBlur = () => {
    // Skip if we just selected from autocomplete (it already called onChange with coordinates)
    if (justSelectedFromAutocomplete.current) {
      justSelectedFromAutocomplete.current = false;
      return;
    }
    if (inputRef.current) {
      onChangeRef.current(inputRef.current.value);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="location">Location</Label>
      <input
        ref={inputRef}
        id="location"
        type="text"
        defaultValue={value}
        onBlur={handleBlur}
        placeholder={placeholder}
        autoComplete="off"
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
      />
    </div>
  );
}
