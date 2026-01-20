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
        <h1 className="page-title">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your birthday scrapbook
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-elevated hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span className="text-lg">🎟️</span>
              Total Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-display text-primary">{tokenCount}</div>
            <p className="text-sm text-muted-foreground">
              {unusedTokenCount} unused
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span className="text-lg">👥</span>
              Guests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-display text-primary">{guestCount}</div>
            <p className="text-sm text-muted-foreground">have joined</p>
          </CardContent>
        </Card>

        <Card className="card-elevated hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span className="text-lg">📸</span>
              Media Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-display text-primary">{mediaCount}</div>
            <p className="text-sm text-muted-foreground">photos & videos</p>
          </CardContent>
        </Card>

        <Card className="card-elevated hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span className="text-lg">✨</span>
              Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-display text-primary">
              {tokenCount > 0
                ? Math.round((guestCount / tokenCount) * 100)
                : 0}
              %
            </div>
            <p className="text-sm text-muted-foreground">tokens claimed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="section-header">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/tokens">
              <Button className="w-full justify-start gap-3" variant="outline">
                <span>🎟️</span>
                Generate Invite Tokens
              </Button>
            </Link>
            <Link href="/admin/pages">
              <Button className="w-full justify-start gap-3" variant="outline">
                <span>📖</span>
                View Guest Pages
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-[#FBF5E6] border-[#D4A853]/30">
          <CardHeader>
            <CardTitle className="section-header flex items-center gap-2">
              <span>📝</span>
              Getting Started
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#D4A853]/20 text-xs font-bold text-[#8B7028]">1</span>
              <p className="text-muted-foreground">Generate invite tokens for your guests</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#D4A853]/20 text-xs font-bold text-[#8B7028]">2</span>
              <p className="text-muted-foreground">Share the unique invite links</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#D4A853]/20 text-xs font-bold text-[#8B7028]">3</span>
              <p className="text-muted-foreground">Guests enter their name and upload memories</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#D4A853]/20 text-xs font-bold text-[#8B7028]">4</span>
              <p className="text-muted-foreground">View all pages from the dashboard</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
