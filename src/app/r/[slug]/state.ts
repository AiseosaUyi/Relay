import "server-only";
import { MAX_REGENERATIONS, type RequestWithVariants } from "@/lib/db/repository";
import { DESTINATIONS } from "@/lib/destinations/registry";

export type ClientVariant = {
  destination: string;
  text: string;
  generatedBy: "ai" | "fallback" | "original" | null;
  edited: boolean;
};

export type ClientState = {
  rawText: string;
  consentPublic: boolean;
  regenerationsLeft: number;
  variants: ClientVariant[];
};

export function toClientState(request: RequestWithVariants): ClientState {
  return {
    rawText: request.raw_text ?? "",
    consentPublic: request.consent_public,
    regenerationsLeft: Math.max(0, MAX_REGENERATIONS - request.regen_count),
    variants: request.variants
      .filter((v) => DESTINATIONS[v.destination].group !== "owned")
      .map((v) => ({
        destination: v.destination,
        text: v.text ?? "",
        generatedBy: v.generated_by,
        edited: v.edited,
      })),
  };
}

