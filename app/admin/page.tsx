import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminDashboard() {
  const isAuthenticated = await isAdminAuthenticated();

  if (!isAuthenticated) {
    redirect("/admin/login");
  }

  const [tokenCount, guestCount, mediaCount] = await Promise.all([
    db.inviteToken.count(),
    db.guest.count(),
    db.media.count(),
  ]);

  const unusedTokenCount = await db.inviteToken.count({
    where: { used: false },
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your birthday scrapbook
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{tokenCount}</div>
            <p className="text-sm text-muted-foreground">
              {unusedTokenCount} unused
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Guests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{guestCount}</div>
            <p className="text-sm text-muted-foreground">have joined</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Media Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mediaCount}</div>
            <p className="text-sm text-muted-foreground">photos & videos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {tokenCount > 0
                ? Math.round((guestCount / tokenCount) * 100)
                : 0}
              %
            </div>
            <p className="text-sm text-muted-foreground">tokens claimed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/tokens">
              <Button className="w-full" variant="secondary">
                Generate Invite Tokens
              </Button>
            </Link>
            <Link href="/admin/pages">
              <Button className="w-full" variant="secondary">
                View Guest Pages
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Generate invite tokens for your guests</p>
            <p>2. Share the unique invite links</p>
            <p>3. Guests enter their name and upload memories</p>
            <p>4. View all pages from the dashboard</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
