import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { setGuestSession } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { token } = await context.params;

    const inviteToken = await db.inviteToken.findUnique({
      where: { token },
      include: {
        guest: {
          include: {
            page: true,
          },
        },
      },
    });

    if (!inviteToken) {
      return NextResponse.json(
        { error: "Invalid invite link" },
        { status: 404 }
      );
    }

    // If token is used, return guest info
    if (inviteToken.used && inviteToken.guest) {
      return NextResponse.json({
        valid: true,
        used: true,
        guest: {
          id: inviteToken.guest.id,
          name: inviteToken.guest.name,
          pageId: inviteToken.guest.page?.id,
        },
      });
    }

    return NextResponse.json({
      valid: true,
      used: false,
    });
  } catch (error) {
    console.error("Token validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate token" },
      { status: 500 }
    );
  }
}

const claimTokenSchema = z.object({
  name: z.string().min(1).max(100),
});

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { token } = await context.params;
    const body = await request.json();
    const parsed = claimTokenSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name } = parsed.data;

    const inviteToken = await db.inviteToken.findUnique({
      where: { token },
      include: { guest: true },
    });

    if (!inviteToken) {
      return NextResponse.json(
        { error: "Invalid invite link" },
        { status: 404 }
      );
    }

    if (inviteToken.used) {
      return NextResponse.json(
        { error: "This invite link has already been used" },
        { status: 400 }
      );
    }

    // Create guest and page in a transaction
    const guest = await db.$transaction(async (tx) => {
      const newGuest = await tx.guest.create({
        data: {
          name,
          inviteTokenId: inviteToken.id,
        },
      });

      await tx.page.create({
        data: {
          guestId: newGuest.id,
        },
      });

      await tx.inviteToken.update({
        where: { id: inviteToken.id },
        data: { used: true },
      });

      return tx.guest.findUnique({
        where: { id: newGuest.id },
        include: { page: true },
      });
    });

    if (!guest || !guest.page) {
      return NextResponse.json(
        { error: "Failed to create guest" },
        { status: 500 }
      );
    }

    // Set guest session cookie
    await setGuestSession(guest.id);

    return NextResponse.json({
      guest: {
        id: guest.id,
        name: guest.name,
        pageId: guest.page.id,
      },
    });
  } catch (error) {
    console.error("Token claim error:", error);
    return NextResponse.json(
      { error: "Failed to claim invite" },
      { status: 500 }
    );
  }
}
