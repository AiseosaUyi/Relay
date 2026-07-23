"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CircleCheck, Clock, Circle, Copy, Check } from "lucide-react";
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
    <Card className="transition-shadow hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-12px_rgba(0,0,0,0.16)]">
      <CardHeader className="flex-row items-center gap-3 space-y-0">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-wash text-sm font-semibold text-foreground">
          {clientName.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <CardTitle>{clientName}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {new Date(createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <button
          type="button"
          onClick={handleCopy}
          className="flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2 text-left transition-colors hover:bg-wash"
        >
          <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
            /r/{slug}
          </span>
          {copied ? (
            <Check className="size-3.5 shrink-0 text-primary" />
          ) : (
            <Copy className="size-3.5 shrink-0 text-muted-foreground" />
          )}
        </button>

        <div className="flex flex-wrap gap-2">
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
        </div>
      </CardContent>
    </Card>
  );
}
