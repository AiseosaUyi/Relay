"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check } from "lucide-react";

export function CreatedBanner({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const path = `/r/${slug}`;

  async function handleCopy() {
    const url = `${window.location.origin}${path}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Card className="mb-6 animate-in border-primary/30 bg-primary/5 fade-in-0 slide-in-from-top-2 duration-300">
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Request created — send this link</p>
          <p className="truncate text-sm text-muted-foreground">{path}</p>
        </div>
        <Button variant="outline" onClick={handleCopy}>
          {copied ? <Check className="text-primary" /> : <Copy />}
          {copied ? "Copied" : "Copy link"}
        </Button>
      </CardContent>
    </Card>
  );
}
