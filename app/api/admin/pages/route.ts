import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminRequest } from "@/lib/auth";
import { getProxyUrl } from "@/lib/s3";

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

    // Add proxy URLs for media thumbnails (no more presigned URLs needed)
    const pagesWithUrls = pages.map((page) => ({
      ...page,
      media: page.media.map((item) => ({
        ...item,
        url: getProxyUrl(item.s3Key),
      })),
    }));

    return NextResponse.json(pagesWithUrls);
  } catch (error) {
    console.error("Pages fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pages" },
      { status: 500 }
    );
  }
}
