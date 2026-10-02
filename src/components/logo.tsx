import Link from "next/link";
import { RelayMark } from "@/components/icons/relay-mark";
import { cn } from "@/lib/utils";

export function Logo({ href, className }: { href: string; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 font-heading text-[1.15rem] leading-none font-semibold tracking-[-0.04em] text-foreground",
        className
      )}
    >
      <RelayMark className="size-6" />
      relay
    </Link>
  );
}
