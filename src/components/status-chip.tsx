import { CircleCheck, Clock, Copy, Send, Sparkles, Ban } from "lucide-react";
import { PlatformIcon } from "@/components/icons/platform-icon";
import { DESTINATIONS, type DestinationId } from "@/lib/destinations/registry";
import { STATUS_LABEL, type VariantStatus } from "@/lib/destinations/status";
import { cn } from "@/lib/utils";

const STYLE: Record<VariantStatus, string> = {
  waiting: "border-border text-muted-foreground",
  no_consent: "border-border text-muted-foreground/70 line-through",
  ready: "border-primary/20 bg-primary/5 text-foreground",
  copied: "border-primary/25 bg-primary/10 text-foreground",
  sent: "border-primary/30 bg-primary/10 text-primary",
  live: "border-transparent bg-primary text-primary-foreground",
};

const ICON: Record<VariantStatus, React.ComponentType<{ className?: string }>> = {
  waiting: Clock,
  no_consent: Ban,
  ready: Sparkles,
  copied: Copy,
  sent: Send,
  live: CircleCheck,
};

export function StatusChip({ destination, status }: { destination: DestinationId; status: VariantStatus }) {
  const Icon = ICON[status];
  return (
    <span
      title={STATUS_LABEL[status]}
      className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium", STYLE[status])}
    >
      <PlatformIcon id={destination} className="size-3.5" />
      {DESTINATIONS[destination].label}
      <Icon className="size-3 opacity-70" />
      <span className="sr-only">{STATUS_LABEL[status]}</span>
    </span>
  );
}
