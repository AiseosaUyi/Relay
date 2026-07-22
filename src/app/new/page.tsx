import { cookies } from "next/headers";
import { getFreelancerBySlug } from "@/lib/db/repository";
import { NewRequestForm } from "./new-request-form";

const FREELANCER_COOKIE = "relay_freelancer_slug";

export default async function NewRequestPage() {
  const cookieStore = await cookies();
  const slug = cookieStore.get(FREELANCER_COOKIE)?.value;
  const freelancer = slug ? getFreelancerBySlug(slug) : undefined;

  return (
    <main className="flex min-h-svh w-full items-center justify-center px-6 py-16">
      <NewRequestForm freelancerName={freelancer?.name ?? null} />
    </main>
  );
}
