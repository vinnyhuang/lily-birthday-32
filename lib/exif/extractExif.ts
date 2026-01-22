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
    // Parse with GPS enabled
    const exif = await exifr.parse(file, {
      // Enable GPS block parsing
      gps: true,
      // Include EXIF for DateTimeOriginal
      exif: true,
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
    // exifr should provide signed latitude/longitude, but browser builds sometimes
    // don't correctly apply the reference (N/S, E/W) for the sign
    let gpsCoordinates: ExifData["gpsCoordinates"] = null;
    if (exif.latitude != null && exif.longitude != null) {
      let latitude = exif.latitude;
      let longitude = exif.longitude;

      // Manually apply sign based on reference if the values are positive
      // and references indicate they should be negative
      // S (South) latitude should be negative
      if (exif.GPSLatitudeRef === "S" && latitude > 0) {
        latitude = -latitude;
      }
      // W (West) longitude should be negative
      if (exif.GPSLongitudeRef === "W" && longitude > 0) {
        longitude = -longitude;
      }

      console.debug("EXIF GPS data:", {
        raw: { lat: exif.latitude, lng: exif.longitude },
        refs: { latRef: exif.GPSLatitudeRef, lngRef: exif.GPSLongitudeRef },
        corrected: { latitude, longitude },
      });

      gpsCoordinates = { latitude, longitude };
    }

    return { dateTaken, gpsCoordinates };
  } catch (error) {
    // Silently fail for files without EXIF or unsupported formats
    console.debug("EXIF extraction failed:", error);
    return { dateTaken: null, gpsCoordinates: null };
  }
}

/**
 * Extract metadata from a video file
 * Uses exifr for MOV/MP4 metadata and file lastModified as fallback
 */
export async function extractVideoMetadata(file: File): Promise<ExifData> {
  try {
    // Try to extract metadata using exifr (works for MOV, MP4 with embedded GPS)
    const metadata = await exifr.parse(file, {
      gps: true,
      exif: true,
    });

    let dateTaken: Date | null = null;
    let gpsCoordinates: ExifData["gpsCoordinates"] = null;

    if (metadata) {
      // Try various date fields that videos might have
      if (metadata.DateTimeOriginal) {
        dateTaken = new Date(metadata.DateTimeOriginal);
      } else if (metadata.CreateDate) {
        dateTaken = new Date(metadata.CreateDate);
      } else if (metadata.ModifyDate) {
        dateTaken = new Date(metadata.ModifyDate);
      }

      // Extract GPS if available
      if (metadata.latitude != null && metadata.longitude != null) {
        let latitude = metadata.latitude;
        let longitude = metadata.longitude;

        // Apply sign corrections
        if (metadata.GPSLatitudeRef === "S" && latitude > 0) {
          latitude = -latitude;
        }
        if (metadata.GPSLongitudeRef === "W" && longitude > 0) {
          longitude = -longitude;
        }

        console.debug("Video GPS data:", {
          raw: { lat: metadata.latitude, lng: metadata.longitude },
          refs: { latRef: metadata.GPSLatitudeRef, lngRef: metadata.GPSLongitudeRef },
          corrected: { latitude, longitude },
        });

        gpsCoordinates = { latitude, longitude };
      }
    }

    // Fall back to file's lastModified if no date was found
    if (!dateTaken && file.lastModified) {
      dateTaken = new Date(file.lastModified);
      console.debug("Using file lastModified as dateTaken:", dateTaken);
    }

    return { dateTaken, gpsCoordinates };
  } catch (error) {
    console.debug("Video metadata extraction failed:", error);

    // Fall back to file's lastModified
    if (file.lastModified) {
      return {
        dateTaken: new Date(file.lastModified),
        gpsCoordinates: null,
      };
    }

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
