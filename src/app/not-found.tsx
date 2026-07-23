import { cookies } from "next/headers";
import Link from "next/link";
import { getFreelancerBySlug } from "@/lib/db/repository";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const FREELANCER_COOKIE = "relay_freelancer_slug";

export default async function NotFound() {
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

      <div className="relative flex flex-1 w-full flex-col items-center justify-center text-center">
        <span className="font-heading text-sm font-semibold tracking-tight text-primary">
          404
        </span>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl">
          Nothing to relay here.
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          The link you followed doesn&apos;t lead anywhere. Double-check it, or head back.
        </p>
        <Link
          href={freelancer ? `/dashboard/${freelancer.slug}` : "/"}
          className={cn(buttonVariants({ size: "lg" }), "mt-6")}
        >
          {freelancer ? "Go to your dashboard" : "Back home"}
          <ArrowRight />
        </Link>
      </div>
    </main>
  );
}
