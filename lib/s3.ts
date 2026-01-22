import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const bucket = process.env.AWS_S3_BUCKET!;

export async function getPresignedUploadUrl(
  key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
}

export async function deleteObject(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  await s3Client.send(command);
}

export function generateS3Key(
  guestId: string,
  filename: string,
  type: "photo" | "video"
): string {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `uploads/${guestId}/${type}s/${timestamp}-${sanitizedFilename}`;
}

/**
 * Generate S3 keys for a video upload (includes both video and thumbnail keys)
 */
export function generateVideoS3Keys(
  guestId: string,
  filename: string
): { videoKey: string; thumbnailKey: string } {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  return {
    videoKey: `uploads/${guestId}/videos/${timestamp}-${sanitizedFilename}`,
    thumbnailKey: `uploads/${guestId}/thumbnails/${timestamp}-${sanitizedFilename}.jpg`,
  };
}

/**
 * Generate a proxy URL for an S3 key
 * This routes through our API to avoid CORS issues and enable canvas export
 */
export function getProxyUrl(s3Key: string): string {
  return `/api/image-proxy?key=${encodeURIComponent(s3Key)}`;
}

/**
 * Derive the thumbnail S3 key from a video S3 key
 * Video: uploads/{guestId}/videos/{timestamp}-{filename}
 * Thumbnail: uploads/{guestId}/thumbnails/{timestamp}-{filename}.jpg
 */
export function getThumbnailS3Key(videoS3Key: string): string {
  // Replace /videos/ with /thumbnails/ and append .jpg
  return videoS3Key.replace("/videos/", "/thumbnails/") + ".jpg";
}

/**
 * Generate a thumbnail S3 key for a new video upload
 */
export function generateThumbnailS3Key(
  guestId: string,
  filename: string,
  timestamp: number
): string {
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `uploads/${guestId}/thumbnails/${timestamp}-${sanitizedFilename}.jpg`;
}
