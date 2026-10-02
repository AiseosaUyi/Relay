import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRequestBySlug, getSettings } from "@/lib/db/repository";
import { DESTINATIONS, isClientFacing } from "@/lib/destinations/registry";
import { toClientState } from "./state";
import { RecommendationForm, type ClientDestination } from "./recommendation-form";

// Client links are private. Keep them out of search engines.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function RecommendationPage(props: PageProps<"/r/[slug]">) {
  const { slug } = await props.params;
  const [request, settings] = await Promise.all([getRequestBySlug(slug), getSettings()]);
  if (!request) notFound();

  const ownerName = settings?.owner_name ?? "your freelancer";
  const destinations: ClientDestination[] = request.destinations
    .map((id) => DESTINATIONS[id])
    .filter((d) => isClientFacing(d.group))
    .map((d) => ({
      id: d.id,
      label: d.label,
      group: d.group as ClientDestination["group"],
      maxChars: d.maxChars,
      target: d.target,
      steps: d.clientSteps({ ownerName, link: d.link ? settings?.links[d.link] : undefined }),
      note: d.note ?? null,
    }));

  return (
    <main className="relative flex min-h-svh w-full flex-col items-center overflow-hidden px-6 py-16 sm:py-24">
      <div className="relative w-full max-w-xl">
        <RecommendationForm
          slug={slug}
          ownerName={ownerName}
          clientName={request.client_name}
          context={request.context}
          destinations={destinations}
          initial={request.raw_text ? toClientState(request) : null}
        />
      </div>
    </main>
  );
}
