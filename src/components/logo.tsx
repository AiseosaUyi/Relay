import Link from "next/link";
import { RelayMark } from "@/components/icons/relay-mark";
import { cn } from "@/lib/utils";

export function Logo({ href, className }: { href: string; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "group/logo inline-flex items-center gap-1.5 font-heading text-base font-bold tracking-tight text-foreground transition-colors hover:text-primary",
        className
      )}
    >
      <RelayMark className="size-5" />
      Relay
    </Link>
  );
}
