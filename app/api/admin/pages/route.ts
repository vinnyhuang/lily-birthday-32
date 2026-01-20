import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminRequest } from "@/lib/auth";
import { getPresignedViewUrl } from "@/lib/s3";

export async function GET(request: NextRequest) {
  const isAuthorized = await verifyAdminRequest(request);
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const pages = await db.page.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        guest: {
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
        },
        media: {
          select: {
            id: true,
            type: true,
            s3Key: true,
          },
        },
        _count: {
          select: {
            media: true,
          },
        },
      },
    });

    // Generate presigned URLs for media thumbnails
    const pagesWithUrls = await Promise.all(
      pages.map(async (page) => ({
        ...page,
        media: await Promise.all(
          page.media.map(async (item) => ({
            ...item,
            url: await getPresignedViewUrl(item.s3Key),
          }))
        ),
      }))
    );

    return NextResponse.json(pagesWithUrls);
  } catch (error) {
    console.error("Pages fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pages" },
      { status: 500 }
    );
  }
}
