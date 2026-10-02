import type { Variant, RecommendationRequest } from "@/lib/db/repository";
import { DESTINATIONS } from "./registry";

export type VariantStatus = "waiting" | "no_consent" | "ready" | "copied" | "sent" | "live";

export const STATUS_LABEL: Record<VariantStatus, string> = {
  waiting: "Waiting on client",
  no_consent: "No consent to quote",
  ready: "Written",
  copied: "Client copied it",
  sent: "Platform request sent",
  live: "Live",
};

export function variantStatus(request: Pick<RecommendationRequest, "raw_text" | "consent_public">, v: Variant): VariantStatus {
  if (v.live_at) return "live";
  if (!request.raw_text) return "waiting";
  if (DESTINATIONS[v.destination].group === "owned" && !request.consent_public) return "no_consent";
  if (v.request_sent_at) return "sent";
  if (v.copied_at) return "copied";
  return "ready";
}
