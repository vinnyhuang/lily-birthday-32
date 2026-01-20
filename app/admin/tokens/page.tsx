"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Token {
  id: string;
  token: string;
  used: boolean;
  createdAt: string;
  guest: {
    id: string;
    name: string;
    createdAt: string;
  } | null;
}

export default function TokensPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [count, setCount] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchTokens = async () => {
    try {
      const response = await fetch("/api/admin/tokens");
      if (response.ok) {
        const data = await response.json();
        setTokens(data);
      }
    } catch (error) {
      console.error("Failed to fetch tokens:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const generateTokens = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/admin/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count }),
      });

      if (response.ok) {
        await fetchTokens();
      }
    } catch (error) {
      console.error("Failed to generate tokens:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteToken = async (tokenId: string) => {
    try {
      const response = await fetch("/api/admin/tokens", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenId }),
      });

      if (response.ok) {
        await fetchTokens();
      }
    } catch (error) {
      console.error("Failed to delete token:", error);
    }
  };

  const copyInviteLink = async (token: string, id: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const link = `${baseUrl}/invite/${token}`;
    await navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">Loading tokens...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Invite Tokens</h1>
        <p className="text-muted-foreground">
          Generate and manage invite links for guests
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate New Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Number of tokens</label>
              <Input
                type="number"
                min={1}
                max={50}
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                className="w-24"
              />
            </div>
            <Button onClick={generateTokens} disabled={isGenerating}>
              {isGenerating ? "Generating..." : "Generate"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Tokens ({tokens.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {tokens.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No tokens generated yet. Create some above!
            </p>
          ) : (
            <div className="space-y-3">
              {tokens.map((token) => (
                <div
                  key={token.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    token.used ? "bg-muted/50" : "bg-card"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {token.token}
                      </code>
                      {token.used ? (
                        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
                          Used
                        </span>
                      ) : (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                          Available
                        </span>
                      )}
                    </div>
                    {token.guest && (
                      <p className="text-sm text-muted-foreground">
                        Claimed by: <span className="font-medium">{token.guest.name}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyInviteLink(token.token, token.id)}
                    >
                      {copiedId === token.id ? "Copied!" : "Copy Link"}
                    </Button>
                    {!token.used && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteToken(token.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
