import Link from "next/link";
import { cookies } from "next/headers";
import { getFreelancerBySlug } from "@/lib/db/repository";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Copy } from "lucide-react";
import { PLATFORM_LIST } from "@/lib/adaptation/platforms";

const FREELANCER_COOKIE = "relay_freelancer_slug";

export default async function Home() {
  const cookieStore = await cookies();
  const slug = cookieStore.get(FREELANCER_COOKIE)?.value;
  const freelancer = slug ? getFreelancerBySlug(slug) : undefined;

  return (
    <main className="relative flex min-h-svh w-full flex-col items-center overflow-hidden px-6 py-20 sm:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-12rem] left-1/2 h-[36rem] w-[64rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px] dark:bg-primary/25"
      />

      <div className="relative flex w-full max-w-xl flex-col items-center text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-wash px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          Built for freelancers &amp; designers
        </span>

        <h1 className="mt-5 font-heading text-5xl font-bold tracking-tight text-balance text-foreground sm:text-6xl">
          Write it <span className="text-primary">once</span>.
        </h1>
        <p className="mt-5 max-w-md text-balance text-base text-muted-foreground sm:text-lg">
          Send one link. Your client writes a single recommendation, and we adapt it for
          LinkedIn, Upwork, and Contra — so they never have to write it three times.
        </p>

        <div className="mt-9 flex justify-center">
          <Button
            size="lg"
            nativeButton={false}
            className="h-11 px-6 text-base shadow-[0_8px_24px_-8px_var(--color-brand)]"
            render={
              <Link href={freelancer ? `/dashboard/${freelancer.slug}` : "/new"}>
                {freelancer ? "Go to your dashboard" : "Get started"}
                <ArrowRight />
              </Link>
            }
          />
        </div>
      </div>

      <div
        aria-hidden
        className="relative mt-16 w-full max-w-lg rounded-2xl bg-card p-5 text-left ring-1 ring-foreground/10 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_48px_-16px_rgba(0,0,0,0.18)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_24px_48px_-16px_rgba(0,0,0,0.7)]"
      >
        <div className="flex items-center gap-1.5">
          {PLATFORM_LIST.map((platform, i) => (
            <span
              key={platform.id}
              className={
                i === 0
                  ? "flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
                  : "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground"
              }
            >
              <span className="flex size-4 items-center justify-center rounded-full bg-wash text-[9px] font-semibold">
                {platform.monogram}
              </span>
              {platform.label}
            </span>
          ))}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-foreground">
          &ldquo;Amara led our brand refresh end to end and shipped a design system we still use
          today. Sharp instincts, fast turnaround, and great to work with.&rdquo;
        </p>
        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground">
          <Copy className="size-3.5" />
          Copy for LinkedIn
        </span>
      </div>
    </main>
  );
}
