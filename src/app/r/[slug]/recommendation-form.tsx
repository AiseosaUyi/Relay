"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Check, Loader2, PencilLine, RefreshCw, Quote, Info } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import { PlatformIcon } from "@/components/icons/platform-icon";
import type { DestinationId } from "@/lib/destinations/registry";
import { cn } from "@/lib/utils";
import type { ClientState, ClientVariant } from "./state";
import {
  submitRecommendation,
  regenerateVersion,
  saveEdit,
  applyOriginalWords,
  setConsent,
  recordCopy,
  type ActionResult,
} from "./actions";

export type ClientDestination = {
  id: DestinationId;
  label: string;
  group: "profile" | "post" | "review";
  maxChars: number;
  target: [number, number];
  steps: string[];
  note: string | null;
};

const SECTIONS: { group: ClientDestination["group"]; title: string; blurb: string }[] = [
  { group: "profile", title: "For their profiles", blurb: "Adapted to fit each platform. Edit anything before you paste it." },
  { group: "post", title: "To post from your account", blurb: "Optional public shoutouts, if you'd like to." },
  { group: "review", title: "Review sites", blurb: "These sites don't allow pre-written reviews, so here are your own words to start from." },
];

const MIN_CHARS = 40;

export function RecommendationForm({
  slug,
  ownerName,
  clientName,
  context,
  destinations,
  initial,
}: {
  slug: string;
  ownerName: string;
  clientName: string;
  context: string | null;
  destinations: ClientDestination[];
  initial: ClientState | null;
}) {
  const [state, setState] = useState<ClientState | null>(initial);
  const [editingOriginal, setEditingOriginal] = useState(false);

  if (!state || editingOriginal) {
    return (
      <WriteView
        slug={slug}
        ownerName={ownerName}
        clientName={clientName}
        context={context}
        destinations={destinations}
        existing={state}
        onDone={(s) => {
          setState(s);
          setEditingOriginal(false);
        }}
        onCancel={state ? () => setEditingOriginal(false) : undefined}
      />
    );
  }

  return (
    <ResultsView
      slug={slug}
      ownerName={ownerName}
      destinations={destinations}
      state={state}
      setState={setState}
      onEditOriginal={() => setEditingOriginal(true)}
    />
  );
}

// ── Write ───────────────────────────────────────────────────────────────

function WriteView({
  slug,
  ownerName,
  clientName,
  context,
  destinations,
  existing,
  onDone,
  onCancel,
}: {
  slug: string;
  ownerName: string;
  clientName: string;
  context: string | null;
  destinations: ClientDestination[];
  existing: ClientState | null;
  onDone: (s: ClientState) => void;
  onCancel?: () => void;
}) {
  const [text, setText] = useState(existing?.rawText ?? "");
  const [consent, setConsentLocal] = useState(existing?.consentPublic ?? false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const first = clientName.split(" ")[0];
  const rewriteBlocked = Boolean(existing && existing.regenerationsLeft <= 0);

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await submitRecommendation(slug, text, consent);
      if (result.ok) onDone(result.state);
      else setError(result.error);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-foreground text-lg font-semibold text-background">
          {ownerName.charAt(0).toUpperCase()}
        </span>
        <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
          {existing ? "Edit what you wrote" : `Hi ${first}, write a recommendation for ${ownerName}`}
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {existing
            ? "Saving rewrites every version from your new text."
            : "About two minutes. Write it like you'd tell a friend. You write it once, and you get a version ready for each place below."}
        </p>
      </div>

      {context && !existing && (
        <div className="flex items-start gap-2.5 rounded-xl bg-wash px-3.5 py-3 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-signal" />
          <span>
            <span className="font-medium text-foreground">What you worked on together.</span> {context}
          </span>
        </div>
      )}

      <div className="rounded-2xl bg-card p-1 ring-1 ring-foreground/10 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)]">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="Your recommendation"
          placeholder={`What did ${ownerName} help you with? What was it like working together, and what changed because of it?`}
          className="min-h-48 rounded-[calc(var(--radius-2xl)-4px)] border-0 bg-transparent px-3.5 py-3 text-base focus-visible:ring-0"
          disabled={pending}
        />
        <div className="flex justify-end px-3 pb-2 text-xs text-muted-foreground">
          {text.trim().length < MIN_CHARS ? `${MIN_CHARS - text.trim().length} more characters to go` : `${text.trim().length} characters`}
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-2.5 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsentLocal(e.target.checked)}
          className="mt-0.5 size-4 accent-[var(--color-signal)]"
        />
        <span>
          {ownerName} can quote this, with my name, on their website and in proposals. <span className="text-muted-foreground/70">Optional.</span>
        </span>
      </label>

      {destinations.length > 0 && !existing && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span>You&apos;ll get versions for</span>
          {destinations.map((d) => (
            <span key={d.id} className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5">
              <PlatformIcon id={d.id} className="size-3" />
              {d.label}
            </span>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
      {rewriteBlocked && (
        <p className="text-sm text-muted-foreground">You&apos;ve used all the rewrites for this link. You can still edit each version by hand.</p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={handleSubmit}
          disabled={pending || rewriteBlocked || text.trim().length < MIN_CHARS}
          size="lg"
          className="h-11 text-base"
        >
          {pending ? (
            <>
              <Loader2 className="animate-spin" /> Getting your versions ready…
            </>
          ) : (
            <>
              {existing ? "Save and redo every version" : "Continue"}
              <ArrowRight />
            </>
          )}
        </Button>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground/80">Nothing gets posted for you. You paste each version yourself, on each platform.</p>
    </div>
  );
}

// ── Results ─────────────────────────────────────────────────────────────

function ResultsView({
  slug,
  ownerName,
  destinations,
  state,
  setState,
  onEditOriginal,
}: {
  slug: string;
  ownerName: string;
  destinations: ClientDestination[];
  state: ClientState;
  setState: (s: ClientState) => void;
  onEditOriginal: () => void;
}) {
  const [consentSaving, startConsent] = useTransition();
  const byId = new Map(state.variants.map((v) => [v.destination, v]));

  function toggleConsent(next: boolean) {
    setState({ ...state, consentPublic: next });
    startConsent(async () => {
      await setConsent(slug, next);
    });
  }

  return (
    <div className="animate-in space-y-8 fade-in-0 duration-300">
      <div className="flex flex-col items-center text-center">
        <span className="flex size-11 animate-in items-center justify-center rounded-full bg-signal/10 text-signal zoom-in-50 duration-300">
          <Check className="size-5" strokeWidth={2.5} />
        </span>
        <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Thank you. You&apos;re all set.</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Everything is saved on this link, so you can come back any time. Paste each version when that platform&apos;s request reaches you.
        </p>
      </div>

      {SECTIONS.map(({ group, title, blurb }) => {
        const items = destinations.filter((d) => d.group === group);
        if (items.length === 0) return null;
        return (
          <section key={group} className="space-y-3">
            <div>
              <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">{title}</h2>
              <p className="text-sm text-muted-foreground">{blurb}</p>
            </div>
            {items.map((d) => {
              const v = byId.get(d.id);
              if (!v) return null;
              return group === "review" ? (
                <ReviewCard key={d.id} slug={slug} destination={d} rawText={state.rawText} />
              ) : (
                <AdaptedCard
                  key={d.id}
                  slug={slug}
                  destination={d}
                  variant={v}
                  regenerationsLeft={state.regenerationsLeft}
                  onState={setState}
                />
              );
            })}
          </section>
        );
      })}

      <div className="space-y-3 border-t border-border pt-6 text-sm">
        <label className="flex cursor-pointer items-start gap-2.5 text-muted-foreground">
          <input
            type="checkbox"
            checked={state.consentPublic}
            disabled={consentSaving}
            onChange={(e) => toggleConsent(e.target.checked)}
            className="mt-0.5 size-4 accent-[var(--color-signal)]"
          />
          <span>{ownerName} can quote this, with my name, on their website and in proposals.</span>
        </label>
        <Button variant="ghost" size="sm" onClick={onEditOriginal}>
          <PencilLine /> Edit what you wrote
        </Button>
      </div>
    </div>
  );
}

function CardShell({ destination: d, children }: { destination: ClientDestination; children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/10 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)]">
      <div className="flex items-center gap-2">
        <PlatformIcon id={d.id} className="size-4 text-foreground" />
        <h3 className="font-medium text-foreground">{d.label}</h3>
      </div>
      {children}
      {d.steps.length > 0 && (
        <ol className="list-decimal space-y-1 rounded-xl bg-wash py-3 pr-3.5 pl-8 text-sm text-muted-foreground">
          {d.steps.map((s) => (
            <li key={s}>
              <Linkified text={s} />
            </li>
          ))}
        </ol>
      )}
      {d.note && <p className="text-xs text-muted-foreground/80">{d.note}</p>}
    </div>
  );
}

function AdaptedCard({
  slug,
  destination: d,
  variant,
  regenerationsLeft,
  onState,
}: {
  slug: string;
  destination: ClientDestination;
  variant: ClientVariant;
  regenerationsLeft: number;
  onState: (s: ClientState) => void;
}) {
  const [text, setText] = useState(variant.text);
  const [saved, setSaved] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [lastSaved, setLastSaved] = useState(variant.text);
  const [syncedFrom, setSyncedFrom] = useState(variant.text);

  // When the server sends a new version (regenerate, original words), take it.
  if (variant.text !== syncedFrom) {
    setSyncedFrom(variant.text);
    setText(variant.text);
    setLastSaved(variant.text);
  }

  const over = text.length > d.maxChars;

  async function persist() {
    if (text === lastSaved) return;
    setSaved("saving");
    const res = await saveEdit(slug, d.id, text);
    if (res.ok) {
      setLastSaved(text);
      setSaved("saved");
      setTimeout(() => setSaved("idle"), 1200);
    } else {
      setSaved("idle");
    }
  }

  function run(fn: () => Promise<ActionResult>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (res.ok) onState(res.state);
      else setError(res.error);
    });
  }

  return (
    <CardShell destination={d}>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={persist}
        aria-label={`${d.label} version`}
        disabled={pending}
        className="min-h-32 text-base"
      />
      <div className="flex flex-wrap items-center gap-2">
        <CopyButton
          text={() => text}
          label={`Copy for ${d.label}`}
          onCopied={() => {
            void persist();
            void recordCopy(slug, d.id);
          }}
        />
        <Button
          variant="ghost"
          size="sm"
          disabled={pending || regenerationsLeft <= 0}
          onClick={() => run(() => regenerateVersion(slug, d.id))}
          title={regenerationsLeft <= 0 ? "No new versions left, but you can still edit by hand" : undefined}
        >
          {pending ? <Loader2 className="animate-spin" /> : <RefreshCw />}
          New version{regenerationsLeft > 0 ? ` (${regenerationsLeft} left)` : ""}
        </Button>
        <Button variant="ghost" size="sm" disabled={pending} onClick={() => run(() => applyOriginalWords(slug, d.id))}>
          <Quote /> Use my exact words
        </Button>
        <span className={cn("ml-auto text-xs", over ? "text-destructive" : "text-muted-foreground")}>
          {saved === "saving" ? "Saving…" : saved === "saved" ? "Saved" : `${text.length}/${d.maxChars.toLocaleString()}`}
        </span>
      </div>
      {over && <p className="text-xs text-destructive">A bit long for {d.label}. Trim it before you paste.</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </CardShell>
  );
}

function ReviewCard({ slug, destination: d, rawText }: { slug: string; destination: ClientDestination; rawText: string }) {
  return (
    <CardShell destination={d}>
      <p className="rounded-xl bg-wash px-3.5 py-3 text-sm whitespace-pre-wrap text-foreground">{rawText}</p>
      <CopyButton text={rawText} label="Copy my words" onCopied={() => void recordCopy(slug, d.id)} />
    </CardShell>
  );
}

/** Turns bare URLs inside a step into links. */
function Linkified({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s)]+)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a key={i} href={part} target="_blank" rel="noreferrer" className="break-all text-signal underline underline-offset-2">
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}
