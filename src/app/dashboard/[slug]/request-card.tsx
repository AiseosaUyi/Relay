"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CircleCheck, Clock, Circle, Link2, Check } from "lucide-react";
import { PLATFORMS, type Platform } from "@/lib/adaptation/platforms";

export function RequestCard({
  clientName,
  createdAt,
  slug,
  platforms,
  variants,
  hasRawText,
}: {
  clientName: string;
  createdAt: string;
  slug: string;
  platforms: Platform[];
  variants: { platform: Platform; text: string | null }[];
  hasRawText: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(`${window.location.origin}/r/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Card className="transition-shadow hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-12px_rgba(0,0,0,0.16)] dark:hover:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_16px_32px_-12px_rgba(0,0,0,0.7)]">
      <CardHeader className="flex-row items-center gap-3 space-y-0">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-wash text-sm font-semibold text-foreground">
          {clientName.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <CardTitle>{clientName}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {new Date(createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={handleCopy} title="Copy request link">
          {copied ? <Check className="text-primary" /> : <Link2 />}
        </Button>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {platforms.map((platform) => {
          const variant = variants.find((v) => v.platform === platform);
          const written = Boolean(variant?.text);
          return (
            <Badge
              key={platform}
              variant={written ? "default" : "outline"}
              className={written ? "bg-primary/15 text-primary" : undefined}
            >
              {written ? (
                <CircleCheck data-icon="inline-start" />
              ) : (
                <Clock data-icon="inline-start" />
              )}
              {PLATFORMS[platform].label}
            </Badge>
          );
        })}
        {!hasRawText && (
          <Badge variant="ghost" className="text-muted-foreground">
            <Circle data-icon="inline-start" />
            Waiting on client
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
