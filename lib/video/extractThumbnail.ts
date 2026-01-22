/**
 * Extract a thumbnail frame from a video file
 * This runs client-side using the browser's video decoding and canvas APIs
 */

const THUMBNAIL_SEEK_TIME = 1; // seconds - seek to 1 second for thumbnail
const THUMBNAIL_MAX_WIDTH = 640; // max width for thumbnail
const THUMBNAIL_QUALITY = 0.85; // JPEG quality (0-1)

export interface ThumbnailResult {
  blob: Blob;
  width: number;
  height: number;
}

/**
 * Extract a thumbnail from a video file
 * @param file - The video file to extract thumbnail from
 * @returns Promise with thumbnail blob and dimensions
 */
export async function extractVideoThumbnail(file: File): Promise<ThumbnailResult> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Failed to get canvas context"));
      return;
    }

    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    const cleanup = () => {
      URL.revokeObjectURL(video.src);
      video.remove();
      canvas.remove();
    };

    video.onloadedmetadata = () => {
      // Seek to 1 second or 10% of video duration, whichever is smaller
      const seekTime = Math.min(THUMBNAIL_SEEK_TIME, video.duration * 0.1);
      video.currentTime = seekTime;
    };

    video.onseeked = () => {
      // Calculate thumbnail dimensions (maintain aspect ratio)
      let width = video.videoWidth;
      let height = video.videoHeight;

      if (width > THUMBNAIL_MAX_WIDTH) {
        height = Math.round((height * THUMBNAIL_MAX_WIDTH) / width);
        width = THUMBNAIL_MAX_WIDTH;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw the video frame to canvas
      ctx.drawImage(video, 0, 0, width, height);

      // Convert to JPEG blob
      canvas.toBlob(
        (blob) => {
          cleanup();
          if (blob) {
            resolve({ blob, width, height });
          } else {
            reject(new Error("Failed to create thumbnail blob"));
          }
        },
        "image/jpeg",
        THUMBNAIL_QUALITY
      );
    };

    video.onerror = () => {
      cleanup();
      reject(new Error("Failed to load video for thumbnail extraction"));
    };

    // Set source and start loading
    video.src = URL.createObjectURL(file);
  });
}
