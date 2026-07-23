import { cookies } from "next/headers";
import { getFreelancerBySlug } from "@/lib/db/repository";
import { NewRequestForm } from "./new-request-form";
import { Logo } from "@/components/logo";

const FREELANCER_COOKIE = "relay_freelancer_slug";

export default async function NewRequestPage() {
  const cookieStore = await cookies();
  const slug = cookieStore.get(FREELANCER_COOKIE)?.value;
  const freelancer = slug ? getFreelancerBySlug(slug) : undefined;

  return (
    <main className="relative flex min-h-svh w-full flex-col items-center overflow-hidden px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-14rem] left-1/2 h-[32rem] w-[56rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[110px]"
      />

      <header className="relative z-10 w-full max-w-2xl">
        <Logo href={freelancer ? `/dashboard/${freelancer.slug}` : "/"} />
      </header>

      <div className="relative flex flex-1 w-full items-center justify-center">
        <NewRequestForm freelancerName={freelancer?.name ?? null} />
      </div>
    </main>
  );
}
