import { FaLinkedinIn } from "react-icons/fa6";
import { SiUpwork } from "react-icons/si";
import type { IconType } from "react-icons";
import { PLATFORMS, type Platform } from "@/lib/adaptation/platforms";
import { cn } from "@/lib/utils";

type PlatformIconEntry = { kind: "mark"; Icon: IconType } | { kind: "wordmark" };

/**
 * One lookup, reused everywhere a platform needs a visual mark. Real,
 * license-clear brand marks (react-icons/simple-icons) where verified,
 * rendered in `currentColor` — like every other icon in this app, color
 * comes from the parent's text-color class (state-driven: muted at rest,
 * primary/foreground when selected or active), not a hardcoded brand hex.
 * `contra` currently has no confirmed source mark, so it degrades to
 * `PLATFORMS.contra.monogram` as a quiet wordmark badge rather than a
 * guessed logo. Swap its entry to `{ kind: "mark", Icon }` the moment an
 * accurate one is sourced; every call site picks it up for free.
 */
const PLATFORM_ICONS: Record<Platform, PlatformIconEntry> = {
  linkedin: { kind: "mark", Icon: FaLinkedinIn },
  upwork: { kind: "mark", Icon: SiUpwork },
  contra: { kind: "wordmark" },
};

export function PlatformIcon({ id, className }: { id: Platform; className?: string }) {
  const entry = PLATFORM_ICONS[id];

  if (entry.kind === "wordmark") {
    return (
      <span
        aria-hidden
        className={cn(
          "inline-flex items-center justify-center rounded-[5px] border border-current/25 bg-current/10 text-[9px] font-semibold tracking-tight",
          className
        )}
      >
        {PLATFORMS[id].monogram}
      </span>
    );
  }

  return <entry.Icon aria-hidden className={className} />;
}
