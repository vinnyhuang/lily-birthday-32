import exifr from "exifr";

export interface ExifData {
  dateTaken: Date | null;
  gpsCoordinates: {
    latitude: number;
    longitude: number;
  } | null;
}

/**
 * Extract EXIF data from an image file
 * Returns date taken and GPS coordinates if available
 */
export async function extractExif(file: File): Promise<ExifData> {
  try {
    const exif = await exifr.parse(file, {
      // Only pick the fields we need for performance
      pick: ["DateTimeOriginal", "CreateDate", "GPSLatitude", "GPSLongitude"],
      // Enable GPS parsing
      gps: true,
    });

    if (!exif) {
      return { dateTaken: null, gpsCoordinates: null };
    }

    // Get date taken (try multiple fields)
    let dateTaken: Date | null = null;
    if (exif.DateTimeOriginal) {
      dateTaken = new Date(exif.DateTimeOriginal);
    } else if (exif.CreateDate) {
      dateTaken = new Date(exif.CreateDate);
    }

    // Get GPS coordinates
    let gpsCoordinates: ExifData["gpsCoordinates"] = null;
    if (exif.latitude != null && exif.longitude != null) {
      gpsCoordinates = {
        latitude: exif.latitude,
        longitude: exif.longitude,
      };
    }

    return { dateTaken, gpsCoordinates };
  } catch (error) {
    // Silently fail for files without EXIF or unsupported formats
    console.debug("EXIF extraction failed:", error);
    return { dateTaken: null, gpsCoordinates: null };
  }
}

/**
 * Format a date for display
 */
export function formatDateTaken(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
