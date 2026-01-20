import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <div className="text-7xl mb-4">🎂</div>
            <h1 className="page-title text-5xl md:text-6xl">
              Lily&apos;s 32nd Birthday
            </h1>
            <p className="text-xl text-muted-foreground">
              A collaborative scrapbook where friends and family share
              their favorite memories with Lily
            </p>
          </div>

          <Card className="bg-[#FBF5E6]/70 border-[#D4A853]/30">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <p className="text-lg">
                  Have an invite link? Click it to create your page for Lily!
                </p>
                <p className="text-sm text-muted-foreground">
                  Share your favorite photos, stories, and memories to celebrate Lily&apos;s special day.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/admin/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Admin Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-16 px-4 bg-[#F5EDE4]/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-display text-primary text-center mb-10">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="card-interactive bg-white">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#FCEAE6] flex items-center justify-center">
                  <span className="text-2xl font-display text-primary">1</span>
                </div>
                <h3 className="font-semibold mb-2 text-lg">Get Your Invite</h3>
                <p className="text-sm text-muted-foreground">
                  You&apos;ll receive a unique invite link to join
                </p>
              </CardContent>
            </Card>
            <Card className="card-interactive bg-white">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#E8F0E9] flex items-center justify-center">
                  <span className="text-2xl font-display text-[#5A7A5E]">2</span>
                </div>
                <h3 className="font-semibold mb-2 text-lg">Share Memories</h3>
                <p className="text-sm text-muted-foreground">
                  Upload your favorite photos with Lily and add stories
                </p>
              </CardContent>
            </Card>
            <Card className="card-interactive bg-white">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#FBF5E6] flex items-center justify-center">
                  <span className="text-2xl font-display text-[#8B7028]">3</span>
                </div>
                <h3 className="font-semibold mb-2 text-lg">Celebrate Lily</h3>
                <p className="text-sm text-muted-foreground">
                  All pages come together as a gift for Lily&apos;s birthday
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-sm text-muted-foreground">
        <p>Made with love for Lily&apos;s 32nd 💝</p>
      </footer>
    </div>
  );
}
