"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createFreelancer, getFreelancerBySlug, createRequest } from "@/lib/db/repository";
import type { Platform } from "@/lib/adaptation/platforms";

const FREELANCER_COOKIE = "relay_freelancer_slug";

const formSchema = z.object({
  freelancerName: z.string().trim().min(1).max(120).optional(),
  clientName: z.string().trim().min(1, "Client name is required.").max(120),
  clientEmail: z.string().trim().email().optional().or(z.literal("")),
  platforms: z
    .array(z.enum(["linkedin", "upwork", "contra"]))
    .min(1, "Pick at least one platform."),
});

export type CreateRequestState = {
  error: string | null;
  // Echoed back on failure so the form can repopulate instead of the
  // client re-typing everything — a failed submit re-renders this page
  // from the server, which resets any uncontrolled input to its default.
  values?: {
    freelancerName: string;
    clientName: string;
    clientEmail: string;
    platforms: Platform[];
  };
};

export async function createRequestAction(
  _prevState: CreateRequestState,
  formData: FormData
): Promise<CreateRequestState> {
  const cookieStore = await cookies();
  const existingSlug = cookieStore.get(FREELANCER_COOKIE)?.value;

  const freelancerNameRaw = formData.get("freelancerName")?.toString() ?? "";
  const clientNameRaw = formData.get("clientName")?.toString() ?? "";
  const clientEmailRaw = formData.get("clientEmail")?.toString() ?? "";
  const platforms = formData.getAll("platforms") as Platform[];
  const values = {
    freelancerName: freelancerNameRaw,
    clientName: clientNameRaw,
    clientEmail: clientEmailRaw,
    platforms,
  };

  const parsed = formSchema.safeParse({
    freelancerName: freelancerNameRaw || undefined,
    clientName: clientNameRaw,
    clientEmail: clientEmailRaw,
    platforms,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form.", values };
  }

  let freelancer = existingSlug ? getFreelancerBySlug(existingSlug) : undefined;

  if (!freelancer) {
    if (!parsed.data.freelancerName) {
      return { error: "Your name is required.", values };
    }
    freelancer = createFreelancer(parsed.data.freelancerName);
    cookieStore.set(FREELANCER_COOKIE, freelancer.slug, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  const request = createRequest({
    freelancerId: freelancer.id,
    clientName: parsed.data.clientName,
    clientEmail: parsed.data.clientEmail || null,
    platforms: parsed.data.platforms as Platform[],
  });

  redirect(`/dashboard/${freelancer.slug}?created=${request.slug}`);
}
