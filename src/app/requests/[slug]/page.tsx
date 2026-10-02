import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Send, CircleCheck, Undo2, Trash2, Lock, Sparkles } from "lucide-react";
import { OwnerHeader } from "@/components/owner-header";
import { StatusChip } from "@/components/status-chip";
import { PlatformIcon } from "@/components/icons/platform-icon";
import { CopyButton, CopyLinkButton } from "@/components/copy-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireOwner } from "@/lib/auth";
import { getRequestBySlug, getSettings, type RequestWithVariants, type Variant } from "@/lib/db/repository";
import { DESTINATIONS, GROUP_META, GROUP_ORDER, type DestinationGroup } from "@/lib/destinations/registry";
import { variantStatus, STATUS_LABEL } from "@/lib/destinations/status";
import { cn } from "@/lib/utils";
import { deleteRequestAction, setLiveAction, toggleSentAction } from "./actions";
import { InviteMessage } from "./invite-message";

export default async function RequestPage(props: PageProps<"/requests/[slug]">) {
  const { slug } = await props.params;
  await requireOwner(`/requests/${slug}`);
  const searchParams = await props.searchParams;
  const [request, settings] = await Promise.all([getRequestBySlug(slug), getSettings()]);
  if (!request) notFound();
  const ownerName = settings?.owner_name ?? "me";

  const clientFacing = request.variants.filter((v) => DESTINATIONS[v.destination].group !== "owned");

  return (
    <main className="min-h-svh w-full">
      <OwnerHeader />
      <div className="mx-auto w-full max-w-3xl space-y-8 px-6 py-8">
        <section>
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            Recommendations
          </Link>
          <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight text-foreground">{request.client_name}</h1>
          <p className="text-sm text-muted-foreground">
            {request.client_email ? `${request.client_email} · ` : ""}
            Created {new Date(request.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {request.variants.map((v) => (
              <StatusChip key={v.id} destination={v.destination} status={variantStatus(request, v)} />
            ))}
          </div>
        </section>

        {!request.raw_text && (
          <Card className={cn(searchParams.created && "border-primary/30 bg-primary/5")}>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium text-foreground">
                  {searchParams.created ? "Link ready. Send it to your client." : "Waiting on your client."}
                </p>
                <p className="text-sm text-muted-foreground">
                  Send it however you normally talk to them. Here&apos;s a message you can paste.
                </p>
              </div>
              <InviteMessage
                slug={request.slug}
                clientName={request.client_name}
                ownerName={ownerName}
                labels={clientFacing.map((v) => DESTINATIONS[v.destination].label)}
              />
              <div className="flex flex-wrap gap-2">
                <CopyLinkButton path={`/r/${request.slug}`} label="Copy link only" />
                <Link href={`/r/${request.slug}`} target="_blank" className={buttonVariants({ variant: "ghost" })}>
                  <ExternalLink /> Preview client page
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {request.raw_text && (
          <section className="space-y-2">
            <h2 className="font-heading text-lg font-bold tracking-tight">What {request.client_name} wrote</h2>
            <blockquote className="rounded-2xl bg-card p-4 text-sm whitespace-pre-wrap text-foreground ring-1 ring-foreground/10">
              {request.raw_text}
            </blockquote>
            <p className="text-xs text-muted-foreground">
              {request.consent_public
                ? `Agreed you can quote this on your site and in proposals${request.consent_at ? `, ${new Date(request.consent_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : ""}.`
                : "Didn't agree to be quoted on your site or in proposals."}{" "}
              <Link href={`/r/${request.slug}`} target="_blank" className="underline underline-offset-2">
                Open client page
              </Link>
            </p>
          </section>
        )}

        {GROUP_ORDER.map((group) => {
          const items = request.variants.filter((v) => DESTINATIONS[v.destination].group === group);
          if (items.length === 0) return null;
          return (
            <section key={group} className="space-y-3">
              <div>
                <h2 className="font-heading text-lg font-bold tracking-tight">{GROUP_META[group].title}</h2>
                <p className="text-sm text-muted-foreground">{GROUP_META[group].description}</p>
              </div>
              <ul className="space-y-3">
                {items.map((v) => (
                  <li key={v.id}>
                    <DestinationRow request={request} variant={v} group={group} ownerName={ownerName} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        <details className="rounded-xl border border-border p-4 text-sm">
          <summary className="cursor-pointer text-muted-foreground">Delete this request</summary>
          <form action={deleteRequestAction} className="mt-3 flex items-center gap-3">
            <input type="hidden" name="slug" value={request.slug} />
            <p className="flex-1 text-muted-foreground">The client link stops working and everything they wrote is removed.</p>
            <Button type="submit" variant="destructive">
              <Trash2 /> Delete
            </Button>
          </form>
        </details>
      </div>
    </main>
  );
}

function DestinationRow({
  request,
  variant: v,
  group,
  ownerName,
}: {
  request: RequestWithVariants;
  variant: Variant;
  group: DestinationGroup;
  ownerName: string;
}) {
  const d = DESTINATIONS[v.destination];
  const status = variantStatus(request, v);
  const ownerSteps = d.ownerSteps?.({ ownerName });

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <PlatformIcon id={d.id} className="size-4 text-foreground" />
          <span className="font-medium text-foreground">{d.label}</span>
          {!d.verified && <span className="text-xs text-muted-foreground">limits unconfirmed</span>}
          <span className="ml-auto text-xs text-muted-foreground">{STATUS_LABEL[status]}</span>
        </div>

        {status === "no_consent" ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="size-4" /> Not generated, the client didn&apos;t agree to be quoted.
          </p>
        ) : v.text ? (
          <div className="space-y-2">
            <p className="line-clamp-4 rounded-xl bg-wash px-3.5 py-3 text-sm whitespace-pre-wrap text-foreground">{v.text}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <CopyButton text={v.text} size="sm" />
              <span>{v.text.length} chars</span>
              {v.edited && <span>· edited by client</span>}
              {v.generated_by === "fallback" && <span>· trimmed, not AI adapted</span>}
              {v.generated_by === "ai" && !v.edited && (
                <span className="inline-flex items-center gap-1">
                  · <Sparkles className="size-3" /> AI adapted
                </span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Not written yet.</p>
        )}

        {group !== "owned" && ownerSteps && ownerSteps.length > 0 && !v.live_at && (
          <div className="rounded-xl border border-dashed border-border px-3.5 py-3 text-sm">
            <p className="mb-1 font-medium text-foreground">Your part on {d.label}</p>
            <ol className="list-decimal space-y-0.5 pl-5 text-muted-foreground">
              {ownerSteps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </div>
        )}

        {group !== "owned" && (
          <div className="flex flex-wrap items-center gap-2">
            {ownerSteps && !v.live_at && (
              <form action={toggleSentAction}>
                <input type="hidden" name="slug" value={request.slug} />
                <input type="hidden" name="destination" value={d.id} />
                <Button type="submit" size="sm" variant={v.request_sent_at ? "secondary" : "outline"}>
                  {v.request_sent_at ? <Undo2 /> : <Send />}
                  {v.request_sent_at ? "Undo request sent" : `I sent the ${d.label} request`}
                </Button>
              </form>
            )}
            {v.live_at ? (
              <form action={setLiveAction} className="flex items-center gap-2">
                <input type="hidden" name="slug" value={request.slug} />
                <input type="hidden" name="destination" value={d.id} />
                <input type="hidden" name="live" value="0" />
                {v.live_url && (
                  <a href={v.live_url} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                    <ExternalLink /> View
                  </a>
                )}
                <Button type="submit" size="sm" variant="ghost">
                  <Undo2 /> Not live
                </Button>
              </form>
            ) : (
              <form action={setLiveAction} className="flex flex-1 items-center gap-2">
                <input type="hidden" name="slug" value={request.slug} />
                <input type="hidden" name="destination" value={d.id} />
                <input type="hidden" name="live" value="1" />
                <Input name="url" type="url" placeholder="Link to it (optional)" className="h-7 max-w-56 text-xs" />
                <Button type="submit" size="sm">
                  <CircleCheck /> Mark live
                </Button>
              </form>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
