import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, Plus } from "lucide-react";
import { OwnerHeader } from "@/components/owner-header";
import { PageHeader } from "@/components/page-header";
import { RelayMark } from "@/components/icons/relay-mark";
import { StatusChip } from "@/components/status-chip";
import { CopyLinkButton } from "@/components/copy-button";
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
      <div className="page-enter mx-auto w-full max-w-3xl space-y-10 px-6 py-12">
        <PageHeader
          title="Recommendations"
          description="Every client you've asked, and where their words have landed."
        />

        {requests.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-20 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-card text-foreground ring-1 ring-foreground/10">
              <RelayMark className="size-8" />
            </span>
            <h2 className="mt-6 font-heading text-xl font-semibold tracking-[-0.03em] text-foreground">Nothing to relay yet</h2>
            <p className="mt-2 max-w-sm text-[0.9375rem] leading-relaxed text-muted-foreground">
              Create a request, send the link, and your client&apos;s words arrive ready for every place they belong.
            </p>
            <Link href="/new" className={cn(buttonVariants({ size: "lg" }), "mt-8")}>
              <Plus /> New request
            </Link>
          </div>
        ) : (
          <>
            <dl className="grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-card">
              <Stat label="Requests" value={requests.length} />
              <Stat label="Written by clients" value={written} />
              <Stat label="Live on profiles" value={live} />
            </dl>

            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {requests.map((r) => (
                <li key={r.id} className="group/row relative transition-colors hover:bg-muted/50">
                  <div className="flex items-start gap-4 px-5 py-5">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">
                      {r.client_name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1 space-y-3">
                      <div>
                        <Link
                          href={`/requests/${r.slug}`}
                          className="font-medium text-foreground after:absolute after:inset-0 after:content-['']"
                        >
                          {r.client_name}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {r.raw_text ? "Written" : "Waiting on client"}, {" "}
                          {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {r.variants.map((v) => (
                          <StatusChip key={v.id} destination={v.destination} status={variantStatus(r, v)} />
                        ))}
                      </div>
                    </div>
                    <div className="relative z-[1] flex items-center gap-1">
                      <CopyLinkButton path={`/r/${r.slug}`} size="sm" />
                      <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover/row:translate-x-0.5" />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="px-5 py-4">
      <dd className="font-heading text-3xl font-semibold tracking-[-0.04em] text-foreground tabular-nums">{value}</dd>
      <dt className="mt-0.5 text-sm text-muted-foreground">{label}</dt>
    </div>
  );
}
