import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { verifyAdminRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const isAuthorized = await verifyAdminRequest(request);
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tokens = await db.inviteToken.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        guest: {
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json(tokens);
  } catch (error) {
    console.error("Token fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tokens" },
      { status: 500 }
    );
  }
}

const createTokensSchema = z.object({
  count: z.number().int().min(1).max(50).default(1),
});

export async function POST(request: NextRequest) {
  const isAuthorized = await verifyAdminRequest(request);
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createTokensSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { count } = parsed.data;
    const tokens = [];

    for (let i = 0; i < count; i++) {
      const token = await db.inviteToken.create({
        data: {
          token: nanoid(12), // 12 character unique token
        },
      });
      tokens.push(token);
    }

    return NextResponse.json(tokens, { status: 201 });
  } catch (error) {
    console.error("Token creation error:", error);
    return NextResponse.json(
      { error: "Failed to create tokens" },
      { status: 500 }
    );
  }
}

const deleteTokenSchema = z.object({
  tokenId: z.string().min(1),
});

export async function DELETE(request: NextRequest) {
  const isAuthorized = await verifyAdminRequest(request);
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = deleteTokenSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { tokenId } = parsed.data;

    const token = await db.inviteToken.findUnique({
      where: { id: tokenId },
      include: {
        guest: {
          include: {
            page: true,
          },
        },
      },
    });

    if (!token) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    // Cascade delete: media (auto via Page onDelete), page, guest, then token
    if (token.guest) {
      if (token.guest.page) {
        await db.page.delete({
          where: { id: token.guest.page.id },
        });
      }
      await db.guest.delete({
        where: { id: token.guest.id },
      });
    }

    await db.inviteToken.delete({
      where: { id: tokenId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Token deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete token" },
      { status: 500 }
    );
  }
}
