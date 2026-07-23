import Link from "next/link";
import { notFound } from "next/navigation";
import { getFreelancerBySlug, listRequestsForFreelancer } from "@/lib/db/repository";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import type { Platform } from "@/lib/adaptation/platforms";
import { CreatedBanner } from "./created-banner";
import { RequestCard } from "./request-card";

export default async function DashboardPage(props: PageProps<"/dashboard/[slug]">) {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  const freelancer = getFreelancerBySlug(slug);
  if (!freelancer) notFound();

  const requests = listRequestsForFreelancer(freelancer.id);
  const createdSlug =
    typeof searchParams.created === "string" ? searchParams.created : undefined;

  const totalPlatformSlots = requests.reduce(
    (sum, r) => sum + (JSON.parse(r.platforms) as Platform[]).length,
    0
  );
  const writtenSlots = requests.reduce(
    (sum, r) => sum + r.variants.filter((v) => v.text).length,
    0
  );

  return (
    <main className="min-h-svh w-full">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-heading text-sm font-semibold tracking-tight">
            Relay
          </Link>
          <Button
            nativeButton={false}
            render={
              <Link href="/new">
                <Plus /> New request
              </Link>
            }
          />
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl px-6 py-8">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
          {freelancer.name}&apos;s requests
        </h1>

        {requests.length > 0 && (
          <div className="mt-5 grid grid-cols-3 gap-3">
            <Stat label="Requests" value={requests.length} />
            <Stat label="Adapted" value={writtenSlots} />
            <Stat label="Total platforms" value={totalPlatformSlots} />
          </div>
        )}

        {createdSlug && (
          <div className="mt-6">
            <CreatedBanner slug={createdSlug} />
          </div>
        )}

        {requests.length === 0 ? (
          <Card className="mt-6">
            <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
              <h2 className="font-heading text-xl font-bold tracking-tight text-foreground">
                No requests yet
              </h2>
              <p className="text-sm text-muted-foreground">
                Create your first request and get a link to send a client.
              </p>
              <Button
                nativeButton={false}
                className="mt-1"
                render={
                  <Link href="/new">
                    <Plus /> New request
                  </Link>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <ul className="mt-6 space-y-3">
            {requests.map((request) => {
              const platforms = JSON.parse(request.platforms) as Platform[];
              return (
                <li key={request.id}>
                  <RequestCard
                    clientName={request.client_name}
                    createdAt={request.created_at}
                    slug={request.slug}
                    platforms={platforms}
                    variants={request.variants}
                    hasRawText={Boolean(request.raw_text)}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-wash px-4 py-3">
      <div className="font-heading text-2xl font-bold tracking-tight text-foreground">
        {value}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
