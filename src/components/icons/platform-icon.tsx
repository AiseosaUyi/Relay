import { FaLinkedinIn } from "react-icons/fa6";
import { SiFacebook, SiFiverr, SiGoogle, SiMalt, SiThumbtack, SiTrustpilot, SiX } from "react-icons/si";
import type { IconType } from "react-icons";
import { DESTINATIONS, type DestinationId } from "@/lib/destinations/registry";
import { cn } from "@/lib/utils";

/**
 * One lookup for every destination's mark. Real brand marks from
 * react-icons/simple-icons where one exists, rendered in currentColor so the
 * parent's text color drives state. Anything without a verified mark falls
 * back to a quiet monogram badge instead of a hand-drawn logo.
 */
const MARKS: Partial<Record<DestinationId, IconType>> = {
  linkedin: FaLinkedinIn,
  linkedin_services: FaLinkedinIn,
  linkedin_post: FaLinkedinIn,
  malt: SiMalt,
  fiverr_pro: SiFiverr,
  x_post: SiX,
  google: SiGoogle,
  trustpilot: SiTrustpilot,
  thumbtack: SiThumbtack,
  facebook: SiFacebook,
};

export function PlatformIcon({ id, className }: { id: DestinationId; className?: string }) {
  const Icon = MARKS[id];
  if (Icon) return <Icon aria-hidden className={className} />;
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex items-center justify-center rounded-[5px] border border-current/25 bg-current/10 text-[8px] font-semibold tracking-tight",
        className
      )}
    >
      {DESTINATIONS[id].monogram}
    </span>
  );
}
