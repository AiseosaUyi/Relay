import Link from "next/link";
import { notFound } from "next/navigation";
import { getFreelancerBySlug, listRequestsForFreelancer } from "@/lib/db/repository";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, CircleCheck, Clock, Circle } from "lucide-react";
import { PLATFORMS, type Platform } from "@/lib/adaptation/platforms";
import { CreatedBanner } from "./created-banner";

export default async function DashboardPage(props: PageProps<"/dashboard/[slug]">) {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  const freelancer = getFreelancerBySlug(slug);
  if (!freelancer) notFound();

  const requests = listRequestsForFreelancer(freelancer.id);
  const createdSlug =
    typeof searchParams.created === "string" ? searchParams.created : undefined;

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12 sm:py-16">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-medium text-foreground">
          {freelancer.name}&apos;s requests
        </h1>
        <Button
          nativeButton={false}
          render={
            <Link href="/new">
              <Plus /> New request
            </Link>
          }
        />
      </div>

      {createdSlug && <CreatedBanner slug={createdSlug} />}

      {requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <h2 className="font-heading text-xl font-medium text-foreground">
              No requests yet
            </h2>
            <p className="text-sm text-muted-foreground">
              Create your first request and get a link to send a client.
            </p>
            <Button
              nativeButton={false}
              render={
                <Link href="/new">
                  <Plus /> New request
                </Link>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {requests.map((request) => {
            const platforms = JSON.parse(request.platforms) as Platform[];
            return (
              <li key={request.id}>
                <Card>
                  <CardHeader>
                    <CardTitle>{request.client_name}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {new Date(request.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {platforms.map((platform) => {
                      const variant = request.variants.find((v) => v.platform === platform);
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
                    {!request.raw_text && (
                      <Badge variant="ghost" className="text-muted-foreground">
                        <Circle data-icon="inline-start" />
                        Waiting on client
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
