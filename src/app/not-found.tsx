import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { RelayMark } from "@/components/icons/relay-mark";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="flex min-h-svh w-full flex-col items-center px-6 py-10">
      <header className="w-full max-w-3xl">
        <Logo href="/" />
      </header>

      <div className="page-enter flex w-full flex-1 flex-col items-center justify-center pb-16 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-card text-foreground ring-1 ring-foreground/10">
          <RelayMark className="size-9" />
        </span>
        <h1 className="mt-8 font-heading text-[2rem] leading-[1.1] font-semibold tracking-[-0.04em] text-balance text-foreground sm:text-[2.5rem]">
          Nothing to relay here.
        </h1>
        <p className="mt-3 max-w-sm text-[0.9375rem] leading-relaxed text-muted-foreground">
          The link you followed doesn&apos;t lead anywhere. If someone sent it to you, ask them for a fresh one.
        </p>
        <Link href="/" className={cn(buttonVariants({ size: "lg" }), "mt-8")}>
          Back home
          <ArrowRight />
        </Link>
      </div>
    </main>
  );
}
