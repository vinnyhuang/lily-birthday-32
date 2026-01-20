import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { deleteObject } from "@/lib/s3";

const createMediaSchema = z.object({
  s3Key: z.string().min(1),
  pageId: z.string().min(1),
  type: z.enum(["photo", "video"]),
  caption: z.string().optional(),
  location: z.string().optional(),
  dateTaken: z.string().datetime().nullable().optional(),
  gpsCoordinates: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .nullable()
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createMediaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { s3Key, pageId, type, caption, location, dateTaken } =
      parsed.data;

    // Verify page exists
    const page = await db.page.findUnique({
      where: { id: pageId },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Create media record (url field is not stored - we generate presigned URLs on demand)
    const media = await db.media.create({
      data: {
        s3Key,
        url: "", // Placeholder - actual URLs are generated via presigned URLs
        pageId,
        type,
        caption,
        location,
        dateTaken: dateTaken ? new Date(dateTaken) : null,
      },
    });

    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    console.error("Media creation error:", error);
    return NextResponse.json(
      { error: "Failed to create media record" },
      { status: 500 }
    );
  }
}

const updateMediaSchema = z.object({
  mediaId: z.string().min(1),
  caption: z.string().optional(),
  location: z.string().optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = updateMediaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { mediaId, caption, location } = parsed.data;

    const media = await db.media.findUnique({
      where: { id: mediaId },
    });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    const updatedMedia = await db.media.update({
      where: { id: mediaId },
      data: {
        ...(caption !== undefined && { caption }),
        ...(location !== undefined && { location }),
      },
    });

    return NextResponse.json(updatedMedia);
  } catch (error) {
    console.error("Media update error:", error);
    return NextResponse.json(
      { error: "Failed to update media" },
      { status: 500 }
    );
  }
}

const deleteMediaSchema = z.object({
  mediaId: z.string().min(1),
});

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = deleteMediaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { mediaId } = parsed.data;

    const media = await db.media.findUnique({
      where: { id: mediaId },
    });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Delete from S3
    await deleteObject(media.s3Key);

    // Delete from database
    await db.media.delete({
      where: { id: mediaId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Media deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 }
    );
  }
}
