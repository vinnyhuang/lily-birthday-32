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
            <h1 className="text-5xl md:text-6xl font-bold text-primary">
              Birthday Scrapbook
            </h1>
            <p className="text-xl text-muted-foreground">
              A collaborative digital scrapbook where friends and family can
              share their favorite memories and photos
            </p>
          </div>

          <Card className="bg-secondary/30">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <p className="text-lg">
                  Have an invite link? Click it to start creating your page!
                </p>
                <p className="text-sm text-muted-foreground">
                  If you&apos;re the host, access the admin dashboard to
                  generate invite links.
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
      <section className="py-16 px-4 bg-secondary/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-4xl mb-4">1</div>
                <h3 className="font-semibold mb-2">Get Your Invite</h3>
                <p className="text-sm text-muted-foreground">
                  The host shares a unique invite link with you
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-4xl mb-4">2</div>
                <h3 className="font-semibold mb-2">Upload Memories</h3>
                <p className="text-sm text-muted-foreground">
                  Add your favorite photos and videos with captions
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-4xl mb-4">3</div>
                <h3 className="font-semibold mb-2">Celebrate Together</h3>
                <p className="text-sm text-muted-foreground">
                  Everyone&apos;s pages come together in one special collection
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 text-center text-sm text-muted-foreground">
        <p>Made with love for birthday celebrations</p>
      </footer>
    </div>
  );
}
