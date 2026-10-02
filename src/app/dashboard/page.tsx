import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, Plus } from "lucide-react";
import { OwnerHeader } from "@/components/owner-header";
import { StatusChip } from "@/components/status-chip";
import { CopyLinkButton } from "@/components/copy-button";
import { RelayFlowIllustration } from "@/components/illustrations/relay-flow";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { requireOwner } from "@/lib/auth";
import { getSettings, listRequests } from "@/lib/db/repository";
import { variantStatus } from "@/lib/destinations/status";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  await requireOwner("/dashboard");
  const settings = await getSettings();
  if (!settings) redirect("/settings?welcome=1");

  const requests = await listRequests();
  const written = requests.filter((r) => r.raw_text).length;
  const live = requests.reduce((n, r) => n + r.variants.filter((v) => v.live_at).length, 0);

  return (
    <main className="min-h-svh w-full">
      <OwnerHeader />
      <div className="mx-auto w-full max-w-3xl px-6 py-8">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">Recommendations</h1>

        {requests.length > 0 && (
          <div className="mt-5 grid grid-cols-3 gap-3">
            <Stat label="Requests" value={requests.length} />
            <Stat label="Written by clients" value={written} />
            <Stat label="Live on profiles" value={live} />
          </div>
        )}

        {requests.length === 0 ? (
          <Card className="mt-6">
            <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
              <RelayFlowIllustration className="mb-1 h-28 w-auto" />
              <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground">No requests yet</h2>
              <p className="text-sm text-muted-foreground">Create one and send the link to a client.</p>
              <Link href="/new" className={cn(buttonVariants(), "mt-1")}>
                <Plus /> New request
              </Link>
            </CardContent>
          </Card>
        ) : (
          <ul className="mt-6 space-y-3">
            {requests.map((r) => (
              <li key={r.id}>
                <Card className="transition-shadow hover:ring-foreground/20">
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-wash text-sm font-semibold text-foreground">
                        {r.client_name.charAt(0).toUpperCase()}
                      </span>
                      <Link href={`/requests/${r.slug}`} className="min-w-0 flex-1 group/link">
                        <p className="truncate font-medium text-foreground group-hover/link:text-signal">{r.client_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.raw_text ? "Written" : "Waiting on client"} ·{" "}
                          {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </Link>
                      <CopyLinkButton path={`/r/${r.slug}`} size="sm" />
                      <Link href={`/requests/${r.slug}`} aria-label={`Open ${r.client_name}`} className={buttonVariants({ variant: "ghost", size: "icon" })}>
                        <ChevronRight />
                      </Link>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {r.variants.map((v) => (
                        <StatusChip key={v.id} destination={v.destination} status={variantStatus(r, v)} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <div className="font-heading text-2xl font-semibold tracking-tight text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
