"use client";

import { useState, useTransition } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Copy, Check, Loader2, Sparkles, Bell } from "lucide-react";
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

  const initial = freelancerName.charAt(0).toUpperCase();

  if (variants) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
            <Check className="size-5" strokeWidth={2.5} />
          </span>
          <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            You&apos;re all set.
          </h1>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            {`Here's your recommendation, adapted for each place ${freelancerName} needs it. Copy each one now — you'll paste it in when the actual request arrives.`}
          </p>
        </div>

        <Tabs defaultValue={variants[0]?.platform} className="w-full">
          <TabsList className="w-full">
            {variants.map((v) => (
              <TabsTrigger key={v.platform} value={v.platform} className="flex-1 gap-1.5">
                <span className="flex size-5 items-center justify-center rounded-full bg-wash text-[10px] font-semibold text-foreground">
                  {PLATFORMS[v.platform].monogram}
                </span>
                {PLATFORMS[v.platform].label}
              </TabsTrigger>
            ))}
          </TabsList>
          {variants.map((v) => (
            <TabsContent key={v.platform} value={v.platform} className="mt-4 space-y-3">
              <div className="rounded-2xl bg-card p-4 text-base whitespace-pre-wrap text-foreground ring-1 ring-foreground/10 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-12px_rgba(0,0,0,0.6)]">
                {v.text}
              </div>

              <div className="flex items-center gap-3">
                <CopyButton
                  slug={slug}
                  platform={v.platform}
                  text={v.text}
                  label={`Copy for ${PLATFORMS[v.platform].label}`}
                />
                <span className="text-xs text-muted-foreground">
                  {v.text.length}/{PLATFORMS[v.platform].charLimit} chars
                </span>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl bg-wash px-3.5 py-3 text-sm text-muted-foreground">
                <Bell className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{PLATFORMS[v.platform].instruction(freelancerName)}</span>
              </div>

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
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-wash text-lg font-semibold text-foreground">
          {initial}
        </span>
        <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl">
          Write a recommendation for {freelancerName}
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Takes about 2 minutes — write it like you&apos;re telling a friend. We&apos;ll adapt it
          for everywhere {freelancerName} needs it, so you only write it once.
        </p>
      </div>

      <div className="rounded-2xl bg-card p-1 ring-1 ring-foreground/10 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-12px_rgba(0,0,0,0.6)]">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`What was it like working with ${freelancerName}? What did they help you with, and what stood out?`}
          className="min-h-48 rounded-[calc(var(--radius-2xl)-4px)] border-0 bg-transparent px-3.5 py-3 text-base focus-visible:ring-0"
          disabled={pending}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        onClick={handleSubmit}
        disabled={pending || text.trim().length < 20}
        size="lg"
        className="h-11 w-full text-base sm:w-auto"
      >
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
