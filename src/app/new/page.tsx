import { redirect } from "next/navigation";
import { OwnerHeader } from "@/components/owner-header";
import { requireOwner } from "@/lib/auth";
import { getSettings } from "@/lib/db/repository";
import { DEFAULT_DESTINATIONS } from "@/lib/destinations/registry";
import { NewRequestForm } from "./new-request-form";

export default async function NewRequestPage() {
  await requireOwner("/new");
  const settings = await getSettings();
  if (!settings) redirect("/settings?welcome=1");

  return (
    <main className="min-h-svh w-full">
      <OwnerHeader />
      <div className="mx-auto w-full max-w-3xl px-6 py-8">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">New request</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick where this client&apos;s recommendation should end up. You&apos;ll get one link to send them.
        </p>
        <div className="mt-8">
          <NewRequestForm
            defaults={settings.default_destinations.length ? settings.default_destinations : DEFAULT_DESTINATIONS}
          />
        </div>
      </div>
    </main>
  );
}
