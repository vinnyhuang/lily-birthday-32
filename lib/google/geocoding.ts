/**
 * Google Geocoding API utilities
 * Used for reverse geocoding (lat/lng -> place name)
 */

interface ReverseGeocodeResult {
  location: string;
  formattedAddress: string;
  city?: string;
  country?: string;
}

interface GeocodeResponse {
  results: Array<{
    formatted_address: string;
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }>;
  status: string;
  error_message?: string;
}

/**
 * Reverse geocode coordinates to a place name
 * Uses Google Geocoding API (server-side)
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.warn("GOOGLE_MAPS_API_KEY not configured for reverse geocoding");
    return null;
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    url.searchParams.set("latlng", `${latitude},${longitude}`);
    url.searchParams.set("key", apiKey);
    // Request results in English
    url.searchParams.set("language", "en");

    const response = await fetch(url.toString());
    const data: GeocodeResponse = await response.json();

    if (data.status !== "OK" || !data.results.length) {
      console.debug("Geocoding failed:", data.status, data.error_message);
      return null;
    }

    const result = data.results[0];
    const components = result.address_components;

    // Extract useful parts
    let city: string | undefined;
    let country: string | undefined;
    let neighborhood: string | undefined;
    let premise: string | undefined;

    for (const component of components) {
      if (component.types.includes("locality")) {
        city = component.long_name;
      } else if (component.types.includes("country")) {
        country = component.long_name;
      } else if (component.types.includes("neighborhood")) {
        neighborhood = component.long_name;
      } else if (
        component.types.includes("premise") ||
        component.types.includes("point_of_interest") ||
        component.types.includes("establishment")
      ) {
        premise = component.long_name;
      }
    }

    // Build a friendly location name
    // Prefer: "Premise, City" or "Neighborhood, City" or "City, Country"
    let location: string;
    if (premise && city) {
      location = `${premise}, ${city}`;
    } else if (neighborhood && city) {
      location = `${neighborhood}, ${city}`;
    } else if (city && country) {
      location = `${city}, ${country}`;
    } else if (city) {
      location = city;
    } else {
      // Fall back to formatted address, but shorten it
      const parts = result.formatted_address.split(",");
      location = parts.slice(0, 2).join(",").trim();
    }

    return {
      location,
      formattedAddress: result.formatted_address,
      city,
      country,
    };
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
}

/**
 * Forward geocode a place name to coordinates
 * Uses Google Geocoding API (server-side)
 */
export async function forwardGeocode(
  address: string
): Promise<{ latitude: number; longitude: number } | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.warn("GOOGLE_MAPS_API_KEY not configured for geocoding");
    return null;
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    url.searchParams.set("address", address);
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString());
    const data: GeocodeResponse = await response.json();

    if (data.status !== "OK" || !data.results.length) {
      console.debug("Geocoding failed:", data.status, data.error_message);
      return null;
    }

    const location = data.results[0].geometry.location;
    return {
      latitude: location.lat,
      longitude: location.lng,
    };
  } catch (error) {
    console.error("Forward geocoding error:", error);
    return null;
  }
}
