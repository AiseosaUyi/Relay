import { redirect } from "next/navigation";
import { OwnerHeader } from "@/components/owner-header";
import { PageHeader } from "@/components/page-header";
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
      <div className="page-enter mx-auto w-full max-w-3xl px-6 py-12">
        <PageHeader
          back={{ href: "/dashboard", label: "Recommendations" }}
          title="New request"
          description="Pick where this client's recommendation should end up. You'll get one link to send them."
        />
        <div className="mt-10">
          <NewRequestForm
            defaults={settings.default_destinations.length ? settings.default_destinations : DEFAULT_DESTINATIONS}
          />
        </div>
      </div>
    </main>
  );
}
