import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { deleteObject } from "@/lib/s3";

type RouteContext = {
  params: Promise<{ mediaId: string }>;
};

const updateMediaSchema = z.object({
  caption: z.string().optional(),
  location: z.string().optional(),
  dateTaken: z.string().datetime().optional().nullable(),
  position: z.any().optional(),
});

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { mediaId } = await context.params;
    const body = await request.json();
    const parsed = updateMediaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { caption, location, dateTaken, position } = parsed.data;

    const media = await db.media.update({
      where: { id: mediaId },
      data: {
        caption,
        location,
        dateTaken: dateTaken ? new Date(dateTaken) : dateTaken,
        position,
      },
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error("Media update error:", error);
    return NextResponse.json(
      { error: "Failed to update media" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { mediaId } = await context.params;

    const media = await db.media.findUnique({
      where: { id: mediaId },
    });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Delete from S3
    try {
      await deleteObject(media.s3Key);
    } catch (s3Error) {
      console.error("S3 deletion error:", s3Error);
      // Continue with database deletion even if S3 fails
    }

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
