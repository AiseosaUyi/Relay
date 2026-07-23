"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check, X } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function CreatedBanner({ slug }: { slug: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const path = `/r/${slug}`;

  async function handleCopy() {
    const url = `${window.location.origin}${path}`;
    const ok = await copyToClipboard(url);
    setStatus(ok ? "copied" : "error");
    setTimeout(() => setStatus("idle"), 1500);
  }

  return (
    <Card className="mb-6 animate-in border-primary/30 bg-primary/5 fade-in-0 slide-in-from-top-2 duration-300">
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Request created — send this link</p>
          <p className="truncate text-sm text-muted-foreground">{path}</p>
        </div>
        <Button variant="outline" onClick={handleCopy}>
          {status === "copied" && <Check className="text-primary" />}
          {status === "error" && <X className="text-destructive" />}
          {status === "idle" && <Copy />}
          {status === "copied" ? "Copied" : status === "error" ? "Couldn't copy" : "Copy link"}
        </Button>
      </CardContent>
    </Card>
  );
}
