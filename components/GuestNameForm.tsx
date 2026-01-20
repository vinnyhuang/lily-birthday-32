"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface GuestNameFormProps {
  token: string;
  onSuccess: (data: { guestId: string; pageId: string; name: string }) => void;
}

export function GuestNameForm({ token, onSuccess }: GuestNameFormProps) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/invite/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      onSuccess({
        guestId: data.guest.id,
        pageId: data.guest.pageId,
        name: data.guest.name,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg bg-white">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-display text-primary">Welcome!</CardTitle>
        <CardDescription className="text-base">
          Enter your name to start creating your scrapbook page
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">Your Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
              maxLength={100}
              className="text-lg h-12"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive text-center bg-destructive/10 py-2 px-3 rounded-lg">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full text-lg py-6"
            disabled={isLoading || !name.trim()}
          >
            {isLoading ? "Getting started..." : "Start Creating ✨"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
