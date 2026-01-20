"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LocationAutocompleteProps {
  value: string;
  onChange: (location: string) => void;
  placeholder?: string;
}

// Declare google namespace for TypeScript
declare global {
  interface Window {
    google?: typeof google;
    initGooglePlaces?: () => void;
  }
}

export function LocationAutocomplete({
  value,
  onChange,
  placeholder = "Add a location (optional)",
}: LocationAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  // Load Google Places script
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      console.debug("Google Places API key not configured");
      return;
    }

    // Check if already loaded
    if (window.google?.maps?.places) {
      setIsLoaded(true);
      return;
    }

    // Create callback for script load
    window.initGooglePlaces = () => {
      setIsLoaded(true);
    };

    // Load the script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGooglePlaces`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      // Clean up callback
      delete window.initGooglePlaces;
    };
  }, []);

  // Initialize autocomplete
  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

    const autocomplete = new window.google!.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ["establishment", "geocode"],
        fields: ["formatted_address", "name"],
      }
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place) {
        const locationName = place.name || place.formatted_address || "";
        setInputValue(locationName);
        onChange(locationName);
      }
    });

    autocompleteRef.current = autocomplete;
  }, [isLoaded, onChange]);

  // Sync external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      // Only call onChange on blur or when place is selected via autocomplete
    },
    []
  );

  const handleBlur = useCallback(() => {
    // Update parent with current value on blur (for manual entry)
    onChange(inputValue);
  }, [inputValue, onChange]);

  // If no API key, render a simple input
  if (!process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY) {
    return (
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            onChange(e.target.value);
          }}
          placeholder={placeholder}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="location">Location</Label>
      <Input
        ref={inputRef}
        id="location"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder={isLoaded ? placeholder : "Loading..."}
        disabled={!isLoaded}
        autoComplete="off"
      />
    </div>
  );
}
