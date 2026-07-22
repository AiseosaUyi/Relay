"use client";

import { useState, useTransition } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Copy, Check, Loader2, Sparkles } from "lucide-react";
import { PLATFORMS, type Platform } from "@/lib/adaptation/platforms";
import { submitRecommendation, recordCopy, type SubmitResult } from "./actions";

type Variant = { platform: Platform; text: string; generatedBy: "ai" | "fallback" };

export function RecommendationForm({
  slug,
  freelancerName,
  platforms,
}: {
  slug: string;
  freelancerName: string;
  platforms: Platform[];
}) {
  const [text, setText] = useState("");
  const [variants, setVariants] = useState<Variant[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result: SubmitResult = await submitRecommendation(slug, text);
      if (result.ok) {
        setVariants(result.variants);
      } else {
        setError(result.error);
      }
    });
  }

  if (variants) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="font-heading text-2xl font-medium text-foreground sm:text-3xl">
            You&apos;re all set.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {`Here's your recommendation, adapted for each place ${freelancerName} needs it. Copy each one now — you'll paste it in when the actual request arrives.`}
          </p>
        </div>
        <Tabs defaultValue={variants[0]?.platform} className="w-full">
          <TabsList className="w-full sm:w-auto">
            {variants.map((v) => (
              <TabsTrigger key={v.platform} value={v.platform} className="gap-1.5">
                <span className="flex size-5 items-center justify-center rounded-full bg-wash text-[10px] font-semibold text-foreground">
                  {PLATFORMS[v.platform].monogram}
                </span>
                {PLATFORMS[v.platform].label}
              </TabsTrigger>
            ))}
          </TabsList>
          {variants.map((v) => (
            <TabsContent key={v.platform} value={v.platform} className="mt-3 space-y-3">
              <Card>
                <CardContent className="whitespace-pre-wrap text-base text-foreground">
                  {v.text}
                </CardContent>
              </Card>
              <CopyButton
                slug={slug}
                platform={v.platform}
                text={v.text}
                label={`Copy for ${PLATFORMS[v.platform].label}`}
              />
              <p className="text-sm text-muted-foreground">
                {PLATFORMS[v.platform].instruction(freelancerName)}
              </p>
              {v.generatedBy === "fallback" && (
                <p className="text-xs text-muted-foreground/70">
                  Adapted with simple formatting — AI adaptation isn&apos;t configured on this
                  deployment yet.
                </p>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-medium text-foreground sm:text-3xl">
          Write a recommendation for {freelancerName}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Takes about 2 minutes — write it like you&apos;re telling a friend. We&apos;ll adapt it
          for everywhere {freelancerName} needs it, so you only write it once.
        </p>
      </div>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`What was it like working with ${freelancerName}? What did they help you with, and what stood out?`}
        className="min-h-48 rounded-2xl bg-surface px-4 py-3 text-base ring-1 ring-border"
        disabled={pending}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex items-center gap-3">
        <Button onClick={handleSubmit} disabled={pending || text.trim().length < 20} size="lg">
          {pending ? (
            <>
              <Loader2 className="animate-spin" /> Adapting…
            </>
          ) : (
            <>
              <Sparkles /> Adapt for {platforms.length} platform{platforms.length === 1 ? "" : "s"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function CopyButton({
  slug,
  platform,
  text,
  label,
}: {
  slug: string;
  platform: Platform;
  text: string;
  label: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    recordCopy(slug, platform);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Button variant="outline" onClick={handleCopy}>
      {copied ? <Check className="text-primary" /> : <Copy />}
      {copied ? "Copied" : label}
    </Button>
  );
}
