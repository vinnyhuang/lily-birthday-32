"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGoogleMaps } from "@/lib/google/useGoogleMaps";

interface LocationAutocompleteProps {
  value: string;
  onChange: (location: string) => void;
  placeholder?: string;
}

export function LocationAutocomplete({
  value,
  onChange,
  placeholder = "Add a location (optional)",
}: LocationAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const { isLoaded } = useGoogleMaps();
  const [inputValue, setInputValue] = useState(value);

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

  // If not loaded yet (no API key or still loading), render a simple input
  if (!isLoaded) {
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
