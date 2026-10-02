"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireOwner } from "@/lib/auth";
import { createRequest } from "@/lib/db/repository";
import { isDestinationId, type DestinationId } from "@/lib/destinations/registry";

const formSchema = z.object({
  clientName: z.string().trim().min(1, "Client name is required.").max(120),
  clientEmail: z.union([z.literal(""), z.string().trim().email("That email doesn't look right.")]),
  context: z.string().trim().max(500, "Keep the context under 500 characters."),
});

export type CreateRequestState = {
  error: string | null;
  // Echoed back so a failed submit doesn't wipe the form.
  values?: { clientName: string; clientEmail: string; context: string; destinations: DestinationId[] };
};

export async function createRequestAction(
  _prev: CreateRequestState,
  formData: FormData
): Promise<CreateRequestState> {
  await requireOwner("/new");

  const values = {
    clientName: formData.get("clientName")?.toString() ?? "",
    clientEmail: formData.get("clientEmail")?.toString() ?? "",
    context: formData.get("context")?.toString() ?? "",
    destinations: formData.getAll("destinations").map(String).filter(isDestinationId),
  };

  const parsed = formSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form.", values };
  if (values.destinations.length === 0) return { error: "Pick at least one destination.", values };

  const request = await createRequest({
    clientName: parsed.data.clientName,
    clientEmail: parsed.data.clientEmail || null,
    context: parsed.data.context || null,
    destinations: values.destinations,
  });

  redirect(`/requests/${request.slug}?created=1`);
}
