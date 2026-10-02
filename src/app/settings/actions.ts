"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireOwner } from "@/lib/auth";
import { saveSettings } from "@/lib/db/repository";
import { isDestinationId, LINK_KEYS, type OwnerLinks } from "@/lib/destinations/registry";

export type SettingsState = { error: string | null; saved?: boolean };

const schema = z.object({
  ownerName: z.string().trim().min(1, "Your name is required.").max(120),
  ownerRole: z.string().trim().max(160),
});

export async function saveSettingsAction(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  await requireOwner("/settings");
  const parsed = schema.safeParse({
    ownerName: formData.get("ownerName")?.toString() ?? "",
    ownerRole: formData.get("ownerRole")?.toString() ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form." };

  const links: OwnerLinks = {};
  for (const key of LINK_KEYS) {
    const value = formData.get(`link_${key}`)?.toString().trim();
    if (!value) continue;
    if (key !== "x" && !/^https?:\/\//i.test(value)) {
      return { error: `${key} link should start with https://` };
    }
    links[key] = value.slice(0, 500);
  }

  const destinations = formData.getAll("destinations").map(String).filter(isDestinationId);

  await saveSettings({
    owner_name: parsed.data.ownerName,
    owner_role: parsed.data.ownerRole || null,
    links,
    default_destinations: destinations,
  });
  revalidatePath("/", "layout");

  if (formData.get("welcome") === "1") redirect("/new");
  return { error: null, saved: true };
}
