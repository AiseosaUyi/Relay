import { notFound } from "next/navigation";
import { getRequestBySlug, getFreelancerById } from "@/lib/db/repository";
import type { Platform } from "@/lib/adaptation/platforms";
import { RecommendationForm } from "./recommendation-form";

export default async function RecommendationPage(props: PageProps<"/r/[slug]">) {
  const { slug } = await props.params;
  const request = getRequestBySlug(slug);
  if (!request) notFound();

  const freelancer = getFreelancerById(request.freelancer_id);
  if (!freelancer) notFound();

  const platforms = JSON.parse(request.platforms) as Platform[];

  return (
    <main className="relative flex min-h-svh w-full flex-col items-center overflow-hidden px-6 py-16 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-14rem] left-1/2 h-[32rem] w-[56rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[110px] dark:bg-primary/15"
      />
      <div className="relative w-full max-w-xl">
        <RecommendationForm slug={slug} freelancerName={freelancer.name} platforms={platforms} />
      </div>
    </main>
  );
}
