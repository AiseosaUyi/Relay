"use server";

import { redirect } from "next/navigation";
import { authConfigured, checkPassword, endSession, safeNext, startSession } from "@/lib/auth";

export type LoginState = { error: string | null };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!authConfigured()) {
    return { error: "OWNER_PASSWORD isn't set on this deployment. Add it in your environment variables." };
  }
  const attempt = formData.get("password")?.toString() ?? "";
  // Small fixed delay makes guessing slower without needing a rate-limit store.
  await new Promise((r) => setTimeout(r, 400));
  if (!(await checkPassword(attempt))) return { error: "That password isn't right." };
  await startSession();
  redirect(safeNext(formData.get("next")?.toString()));
}

export async function logoutAction() {
  await endSession();
  redirect("/login");
}
