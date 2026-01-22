import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const isAuthorized = await verifyAdminRequest(request);
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const guests = await db.guest.findMany({
      orderBy: { name: "asc" },
      include: {
        page: {
          include: {
            media: {
              select: {
                id: true,
                type: true,
                s3Key: true,
                caption: true,
                location: true,
                dateTaken: true,
                latitude: true,
                longitude: true,
              },
            },
          },
        },
      },
    });

    const result = guests.map((guest) => ({
      id: guest.id,
      name: guest.name,
      page: guest.page
        ? {
            id: guest.page.id,
            canvasData: guest.page.canvasData,
            media: guest.page.media,
          }
        : null,
    }));

    return NextResponse.json({ guests: result });
  } catch (error) {
    console.error("Aggregate fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch aggregate data" },
      { status: 500 }
    );
  }
}
