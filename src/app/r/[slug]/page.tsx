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
    <main className="mx-auto flex min-h-svh w-full max-w-xl flex-col justify-center px-6 py-16 sm:py-24">
      <RecommendationForm slug={slug} freelancerName={freelancer.name} platforms={platforms} />
    </main>
  );
}
