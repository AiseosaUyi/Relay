import Link from "next/link";
import { cookies } from "next/headers";
import { getFreelancerBySlug } from "@/lib/db/repository";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight, Copy } from "lucide-react";
import { PLATFORM_LIST } from "@/lib/adaptation/platforms";
import { cn } from "@/lib/utils";
import { PlatformIcon } from "@/components/icons/platform-icon";
import { Logo } from "@/components/logo";

const FREELANCER_COOKIE = "relay_freelancer_slug";

export default async function Home() {
  const cookieStore = await cookies();
  const slug = cookieStore.get(FREELANCER_COOKIE)?.value;
  const freelancer = slug ? getFreelancerBySlug(slug) : undefined;

  return (
    <main className="relative flex min-h-svh w-full flex-col items-center overflow-hidden px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-12rem] left-1/2 h-[36rem] w-[64rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]"
      />

      <header className="relative z-10 w-full max-w-2xl pt-8 sm:pt-10">
        <Logo href={freelancer ? `/dashboard/${freelancer.slug}` : "/"} />
      </header>

      <div className="relative flex w-full flex-1 flex-col items-center justify-center py-12">
        <div className="flex w-full max-w-xl animate-in flex-col items-center text-center fade-in-0 duration-500">
          <h1 className="font-heading text-5xl font-bold tracking-tight text-balance text-foreground sm:text-6xl">
            Write it <span className="text-primary">once</span>.
          </h1>
          <p className="mt-5 min-w-0 text-balance text-base text-muted-foreground sm:min-w-[560px] sm:text-lg">
            Send one link. Your client writes a single recommendation, and we instantly adapt
            it for LinkedIn, Upwork, and Contra, ready to paste. They never have to write it
            three times.
          </p>

          <div className="mt-9 flex justify-center">
            <Link
              href={freelancer ? `/dashboard/${freelancer.slug}` : "/new"}
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 px-6 text-base shadow-[0_8px_24px_-8px_var(--color-brand)]"
              )}
            >
              {freelancer ? "Go to your dashboard" : "Get started"}
              <ArrowRight />
            </Link>
          </div>
        </div>

        <div
          aria-hidden
          className="relative mt-16 w-full max-w-lg rounded-2xl bg-card p-5 text-left ring-1 ring-foreground/10 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_48px_-16px_rgba(0,0,0,0.18)]"
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
                <PlatformIcon id={platform.id} className="size-3.5" />
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
      </div>

      <footer className="relative z-10 w-full max-w-2xl border-t border-border py-6 text-center text-xs text-muted-foreground">
        © 2026 Relay — write it once.
      </footer>
    </main>
  );
}
