"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { deleteRequest, getRequestBySlug, setLive, setRequestSent } from "@/lib/db/repository";
import { isDestinationId } from "@/lib/destinations/registry";

async function load(formData: FormData) {
  const slug = formData.get("slug")?.toString() ?? "";
  await requireOwner(`/requests/${slug}`);
  const request = await getRequestBySlug(slug);
  const destination = formData.get("destination")?.toString() ?? "";
  if (!request) throw new Error("Request not found");
  return { request, slug, destination: isDestinationId(destination) ? destination : null };
}

export async function toggleSentAction(formData: FormData) {
  const { request, slug, destination } = await load(formData);
  if (!destination) return;
  const v = request.variants.find((x) => x.destination === destination);
  await setRequestSent(request.id, destination, !v?.request_sent_at);
  revalidatePath(`/requests/${slug}`);
}

export async function setLiveAction(formData: FormData) {
  const { request, slug, destination } = await load(formData);
  if (!destination) return;
  const live = formData.get("live") === "1";
  const rawUrl = formData.get("url")?.toString().trim() ?? "";
  const url = /^https?:\/\//i.test(rawUrl) ? rawUrl.slice(0, 500) : null;
  await setLive(request.id, destination, live, url);
  revalidatePath(`/requests/${slug}`);
}

export async function deleteRequestAction(formData: FormData) {
  const { request } = await load(formData);
  await deleteRequest(request.id);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
