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

export type CreateRequestState = { error: string | null };

export async function createRequestAction(
  _prevState: CreateRequestState,
  formData: FormData
): Promise<CreateRequestState> {
  const cookieStore = await cookies();
  const existingSlug = cookieStore.get(FREELANCER_COOKIE)?.value;

  const platforms = formData.getAll("platforms") as Platform[];
  const parsed = formSchema.safeParse({
    freelancerName: formData.get("freelancerName")?.toString() || undefined,
    clientName: formData.get("clientName")?.toString() ?? "",
    clientEmail: formData.get("clientEmail")?.toString() ?? "",
    platforms,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  let freelancer = existingSlug ? getFreelancerBySlug(existingSlug) : undefined;

  if (!freelancer) {
    if (!parsed.data.freelancerName) {
      return { error: "Your name is required." };
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
