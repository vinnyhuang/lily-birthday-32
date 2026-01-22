"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { extractExif, extractVideoMetadata, ExifData } from "@/lib/exif/extractExif";
import { extractVideoThumbnail } from "@/lib/video/extractThumbnail";

interface MediaUploaderProps {
  guestId: string;
  pageId: string;
  onUploadComplete: () => void;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "complete" | "error";
  error?: string;
  exifData?: ExifData;
}

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];
const HEIC_TYPES = ["image/heic", "image/heif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
const MAX_VIDEO_DURATION = 60; // seconds

// Convert HEIC/HEIF to JPEG using Canvas API (works on iOS Safari which can decode HEIC natively)
function convertHeicToJpeg(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Could not get canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) {
            reject(new Error("Failed to convert image"));
            return;
          }
          const newName = file.name.replace(/\.heic$/i, ".jpg").replace(/\.heif$/i, ".jpg");
          resolve(new File([blob], newName, { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.92
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load HEIC image for conversion"));
    };
    img.src = url;
  });
}

export function MediaUploader({
  guestId,
  pageId,
  onUploadComplete,
}: MediaUploaderProps) {
  const [uploads, setUploads] = useState<Map<string, UploadingFile>>(new Map());
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileType = (file: File): "photo" | "video" | null => {
    if (ALLOWED_IMAGE_TYPES.includes(file.type)) return "photo";
    if (ALLOWED_VIDEO_TYPES.includes(file.type)) return "video";
    // Fallback: check extension for HEIC files (iOS sometimes reports empty type)
    if (!file.type) {
      const ext = file.name.toLowerCase().split(".").pop();
      if (ext === "heic" || ext === "heif") return "photo";
    }
    return null;
  };

  const validateVideo = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        resolve(video.duration <= MAX_VIDEO_DURATION);
      };
      video.onerror = () => resolve(false);
      video.src = URL.createObjectURL(file);
    });
  };

  const uploadFile = async (file: File) => {
    const fileId = `${file.name}-${Date.now()}`;
    const fileType = getFileType(file);

    if (!fileType) {
      setUploads((prev) => {
        const next = new Map(prev);
        next.set(fileId, {
          file,
          progress: 0,
          status: "error",
          error: "Unsupported file type",
        });
        return next;
      });
      return;
    }

    // Validate video duration
    if (fileType === "video") {
      const isValidDuration = await validateVideo(file);
      if (!isValidDuration) {
        setUploads((prev) => {
          const next = new Map(prev);
          next.set(fileId, {
            file,
            progress: 0,
            status: "error",
            error: `Video must be ${MAX_VIDEO_DURATION} seconds or less`,
          });
          return next;
        });
        return;
      }
    }

    // Extract metadata for photos and videos
    let exifData: ExifData | undefined;
    if (fileType === "photo") {
      exifData = await extractExif(file);
    } else if (fileType === "video") {
      exifData = await extractVideoMetadata(file);
    }

    // Convert HEIC/HEIF to JPEG before upload (only Safari can decode HEIC natively)
    let fileToUpload = file;
    const ext = file.name.toLowerCase().split(".").pop();
    const isHeic = HEIC_TYPES.includes(file.type) || ext === "heic" || ext === "heif";
    if (isHeic && fileType === "photo") {
      try {
        fileToUpload = await convertHeicToJpeg(file);
      } catch (err) {
        console.warn("HEIC conversion failed, uploading original:", err);
      }
    }

    setUploads((prev) => {
      const next = new Map(prev);
      next.set(fileId, { file, progress: 0, status: "uploading", exifData });
      return next;
    });

    try {
      // Get presigned URL(s)
      const presignResponse = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: fileToUpload.name,
          contentType: fileToUpload.type,
          guestId,
          type: fileType,
        }),
      });

      if (!presignResponse.ok) {
        throw new Error("Failed to get upload URL");
      }

      const presignData = await presignResponse.json();
      const { uploadUrl, s3Key } = presignData;

      // For videos, extract and upload thumbnail in parallel with video upload
      let thumbnailBlob: Blob | null = null;
      if (fileType === "video" && presignData.thumbnailUploadUrl) {
        try {
          const thumbnailResult = await extractVideoThumbnail(file);
          thumbnailBlob = thumbnailResult.blob;
        } catch (error) {
          console.warn("Failed to extract video thumbnail:", error);
        }
      }

      // Read file into ArrayBuffer for S3 upload
      // (iOS Safari hangs on fetch PUT with raw File body)
      const fileBuffer = await fileToUpload.arrayBuffer();

      // Upload to S3 (video/photo and optionally thumbnail)
      const uploadPromises: Promise<Response>[] = [
        fetch(uploadUrl, {
          method: "PUT",
          body: fileBuffer,
          headers: {
            "Content-Type": fileToUpload.type,
          },
        }),
      ];

      // Add thumbnail upload if available
      if (thumbnailBlob && presignData.thumbnailUploadUrl) {
        const thumbBuffer = await thumbnailBlob.arrayBuffer();
        uploadPromises.push(
          fetch(presignData.thumbnailUploadUrl, {
            method: "PUT",
            body: thumbBuffer,
            headers: {
              "Content-Type": "image/jpeg",
            },
          })
        );
      }

      const uploadResponses = await Promise.all(uploadPromises);

      if (!uploadResponses[0].ok) {
        throw new Error("Failed to upload file");
      }

      if (uploadResponses[1] && !uploadResponses[1].ok) {
        console.warn("Failed to upload thumbnail, continuing without it");
      }

      setUploads((prev) => {
        const next = new Map(prev);
        next.set(fileId, { file, progress: 50, status: "uploading" });
        return next;
      });

      // Create media record with EXIF data
      const mediaResponse = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          s3Key,
          pageId,
          type: fileType,
          dateTaken: exifData?.dateTaken?.toISOString() || null,
          gpsCoordinates: exifData?.gpsCoordinates || null,
        }),
      });

      if (!mediaResponse.ok) {
        throw new Error("Failed to save media record");
      }

      setUploads((prev) => {
        const next = new Map(prev);
        next.set(fileId, { file, progress: 100, status: "complete" });
        return next;
      });

      // Clear completed upload after a delay
      setTimeout(() => {
        setUploads((prev) => {
          const next = new Map(prev);
          next.delete(fileId);
          return next;
        });
      }, 2000);

      onUploadComplete();
    } catch (error) {
      setUploads((prev) => {
        const next = new Map(prev);
        next.set(fileId, {
          file,
          progress: 0,
          status: "error",
          error: error instanceof Error ? error.message : "Upload failed",
        });
        return next;
      });
    }
  };

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      Array.from(files).forEach(uploadFile);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [guestId, pageId]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <div className="space-y-4">
      <Card
        className={`border-2 border-dashed p-8 text-center transition-all duration-200 cursor-pointer bg-[#FBF5E6]/50 ${
          isDragging
            ? "border-primary bg-[#FCEAE6] scale-[1.02]"
            : "border-[#D4C8BC] hover:border-primary/50 hover:bg-[#FBF5E6]"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={[...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].join(",")}
          multiple
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="space-y-3">
          <div className="text-5xl">📷</div>
          <p className="text-xl font-display text-primary">Drop photos or videos here</p>
          <p className="text-sm text-muted-foreground">
            or click to browse (videos max {MAX_VIDEO_DURATION}s)
          </p>
          <Button variant="default" className="mt-4">
            Choose Files
          </Button>
        </div>
      </Card>

      {uploads.size > 0 && (
        <div className="space-y-2">
          {Array.from(uploads.entries()).map(([id, upload]) => (
            <div
              key={id}
              className="flex items-center gap-3 p-4 bg-white border border-[#E8DFD6] rounded-xl shadow-sm"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{upload.file.name}</p>
                {upload.status === "uploading" && (
                  <div className="w-full h-2 bg-[#F5EDE4] rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                )}
                {upload.status === "error" && (
                  <p className="text-sm text-destructive mt-1">{upload.error}</p>
                )}
                {upload.status === "complete" && (
                  <p className="text-sm text-[#5A7A5E] mt-1 flex items-center gap-1">
                    <span>✓</span> Uploaded!
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
