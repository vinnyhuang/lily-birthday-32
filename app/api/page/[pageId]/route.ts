import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getPresignedViewUrl } from "@/lib/s3";

type RouteContext = {
  params: Promise<{ pageId: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { pageId } = await context.params;

    const page = await db.page.findUnique({
      where: { id: pageId },
      include: {
        guest: {
          select: {
            id: true,
            name: true,
          },
        },
        media: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Generate presigned URLs for all media
    const mediaWithUrls = await Promise.all(
      page.media.map(async (item) => ({
        ...item,
        url: await getPresignedViewUrl(item.s3Key),
      }))
    );

    return NextResponse.json({
      ...page,
      media: mediaWithUrls,
    });
  } catch (error) {
    console.error("Page fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch page" },
      { status: 500 }
    );
  }
}

const updatePageSchema = z.object({
  layoutType: z.enum(["grid", "collage", "hero", "freeform"]).optional(),
  canvasData: z.any().optional(),
});

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { pageId } = await context.params;
    const body = await request.json();
    const parsed = updatePageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const page = await db.page.update({
      where: { id: pageId },
      data: parsed.data,
      include: {
        guest: {
          select: {
            id: true,
            name: true,
          },
        },
        media: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // Generate fresh presigned URLs for all media
    const mediaWithUrls = await Promise.all(
      page.media.map(async (item) => ({
        ...item,
        url: await getPresignedViewUrl(item.s3Key),
      }))
    );

    return NextResponse.json({
      ...page,
      media: mediaWithUrls,
    });
  } catch (error) {
    console.error("Page update error:", error);
    return NextResponse.json(
      { error: "Failed to update page" },
      { status: 500 }
    );
  }
}
