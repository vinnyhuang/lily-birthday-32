"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { GuestNameForm } from "@/components/GuestNameForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type TokenStatus =
  | { status: "loading" }
  | { status: "invalid" }
  | { status: "available" }
  | { status: "used"; guestId: string; pageId: string; name: string };

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>({
    status: "loading",
  });

  useEffect(() => {
    async function checkToken() {
      try {
        const response = await fetch(`/api/invite/${token}`);
        const data = await response.json();

        if (!response.ok || !data.valid) {
          setTokenStatus({ status: "invalid" });
          return;
        }

        if (data.used && data.guest) {
          setTokenStatus({
            status: "used",
            guestId: data.guest.id,
            pageId: data.guest.pageId,
            name: data.guest.name,
          });
        } else {
          setTokenStatus({ status: "available" });
        }
      } catch {
        setTokenStatus({ status: "invalid" });
      }
    }

    checkToken();
  }, [token]);

  const handleSuccess = (data: {
    guestId: string;
    pageId: string;
    name: string;
  }) => {
    router.push(`/page/${data.pageId}`);
  };

  const handleContinue = (pageId: string) => {
    router.push(`/page/${pageId}`);
  };

  if (tokenStatus.status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading your invite...</p>
        </div>
      </div>
    );
  }

  if (tokenStatus.status === "invalid") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="text-5xl mb-4">😢</div>
            <CardTitle className="page-title text-destructive">
              Invalid Invite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This invite link is invalid or has expired. Please check with the
              host for a new link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tokenStatus.status === "used") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="text-5xl mb-2">👋</div>
            <CardTitle className="page-title">Welcome Back!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-lg">
              Hi <span className="font-semibold text-foreground">{tokenStatus.name}</span>! Ready
              to continue working on your scrapbook page?
            </p>
            <Button
              onClick={() => handleContinue(tokenStatus.pageId)}
              className="w-full text-lg py-6"
            >
              Continue to My Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="page-title">
            You&apos;re Invited!
          </h1>
          <p className="text-lg text-muted-foreground">
            Create a special memory page for the birthday celebration
          </p>
        </div>
        <GuestNameForm token={token} onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
