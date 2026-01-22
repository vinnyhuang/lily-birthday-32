import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPresignedUploadUrl, generateS3Key, generateVideoS3Keys } from "@/lib/s3";

const uploadRequestSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
  guestId: z.string().min(1),
  type: z.enum(["photo", "video"]),
});

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = uploadRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { filename, contentType, guestId, type } = parsed.data;

    // Validate content type
    if (type === "photo" && !ALLOWED_IMAGE_TYPES.includes(contentType)) {
      return NextResponse.json(
        {
          error: "Invalid image type",
          allowed: ALLOWED_IMAGE_TYPES,
        },
        { status: 400 }
      );
    }

    if (type === "video" && !ALLOWED_VIDEO_TYPES.includes(contentType)) {
      return NextResponse.json(
        {
          error: "Invalid video type",
          allowed: ALLOWED_VIDEO_TYPES,
        },
        { status: 400 }
      );
    }

    // For videos, generate both video and thumbnail presigned URLs
    if (type === "video") {
      const { videoKey, thumbnailKey } = generateVideoS3Keys(guestId, filename);
      const [videoUploadUrl, thumbnailUploadUrl] = await Promise.all([
        getPresignedUploadUrl(videoKey, contentType),
        getPresignedUploadUrl(thumbnailKey, "image/jpeg"),
      ]);

      return NextResponse.json({
        uploadUrl: videoUploadUrl,
        s3Key: videoKey,
        thumbnailUploadUrl,
        thumbnailS3Key: thumbnailKey,
      });
    }

    // For photos, just return the single upload URL
    const s3Key = generateS3Key(guestId, filename, type);
    const uploadUrl = await getPresignedUploadUrl(s3Key, contentType);

    return NextResponse.json({
      uploadUrl,
      s3Key,
    });
  } catch (error) {
    console.error("Upload URL generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
