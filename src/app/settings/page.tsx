import { OwnerHeader } from "@/components/owner-header";
import { DestinationPicker } from "@/components/destination-picker";
import { requireOwner } from "@/lib/auth";
import { getSettings } from "@/lib/db/repository";
import { DEFAULT_DESTINATIONS, LINK_FIELDS, LINK_KEYS } from "@/lib/destinations/registry";
import { SettingsForm, TextField } from "./settings-form";

export default async function SettingsPage(props: PageProps<"/settings">) {
  await requireOwner("/settings");
  const searchParams = await props.searchParams;
  const settings = await getSettings();
  const welcome = !settings || searchParams.welcome === "1";

  return (
    <main className="min-h-svh w-full">
      <OwnerHeader />
      <div className="mx-auto w-full max-w-3xl px-6 py-8">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          {welcome ? "Set up Relay" : "Settings"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {welcome
            ? "Add your name and the profile links clients need. You only do this once."
            : "Your name, profile links and the destinations new requests start with."}
        </p>

        <div className="mt-8">
          <SettingsForm welcome={welcome}>
            <section className="space-y-4">
              <h2 className="font-heading text-lg font-semibold tracking-tight">You</h2>
              <TextField name="ownerName" label="Your name, as clients know you" defaultValue={settings?.owner_name} placeholder="Aise Idahor" required />
              <TextField
                name="ownerRole"
                label="What you do"
                defaultValue={settings?.owner_role}
                placeholder="Senior Product Designer & Design Engineer"
                help="Gives the AI context. It never adds this to a client's words unless they said it."
              />
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="font-heading text-lg font-semibold tracking-tight">Profile and review links</h2>
                <p className="text-sm text-muted-foreground">Fill in only the ones you use. Clients see these in their instructions.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {LINK_KEYS.map((key) => (
                  <TextField
                    key={key}
                    name={`link_${key}`}
                    label={LINK_FIELDS[key].label}
                    placeholder={LINK_FIELDS[key].placeholder}
                    help={LINK_FIELDS[key].help}
                    defaultValue={settings?.links[key]}
                  />
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="font-heading text-lg font-semibold tracking-tight">Default destinations</h2>
                <p className="text-sm text-muted-foreground">Pre-selected on every new request. You can change them per client.</p>
              </div>
              <DestinationPicker selected={settings?.default_destinations ?? DEFAULT_DESTINATIONS} />
            </section>
          </SettingsForm>
        </div>
      </div>
    </main>
  );
}
