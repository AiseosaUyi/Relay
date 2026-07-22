"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PLATFORM_LIST } from "@/lib/adaptation/platforms";
import { createRequestAction, type CreateRequestState } from "./actions";

const initialState: CreateRequestState = { error: null };

export function NewRequestForm({
  freelancerName,
}: {
  freelancerName: string | null;
}) {
  const [state, formAction, pending] = useActionState(createRequestAction, initialState);

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="font-heading text-xl">
          {freelancerName ? `New request` : "Set up your recommendation page"}
        </CardTitle>
        <CardDescription>
          {freelancerName
            ? `Add a client for ${freelancerName}, pick which platforms apply, and get a link to send them.`
            : "Tell us your name, add your first client, and we'll generate a link you can send them."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {!freelancerName && (
            <Field label="Your name">
              <Input name="freelancerName" placeholder="Ada Lovelace" required />
            </Field>
          )}
          <Field label="Client name">
            <Input name="clientName" placeholder="Grace Hopper" required />
          </Field>
          <Field label="Client email (optional)">
            <Input name="clientEmail" type="email" placeholder="grace@example.com" />
          </Field>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-foreground">
              Which platforms does this client need to appear on?
            </legend>
            <div className="flex flex-wrap gap-2">
              {PLATFORM_LIST.map((platform) => (
                <label
                  key={platform.id}
                  className="group/chip inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-wash px-3 py-1 text-sm font-medium text-foreground transition-colors has-checked:border-transparent has-checked:bg-primary/15 has-checked:text-primary"
                >
                  <input
                    type="checkbox"
                    name="platforms"
                    value={platform.id}
                    defaultChecked
                    className="sr-only"
                  />
                  <span className="flex size-5 items-center justify-center rounded-full bg-surface text-[10px] font-semibold">
                    {platform.monogram}
                  </span>
                  {platform.label}
                </label>
              ))}
            </div>
          </fieldset>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" disabled={pending} className="w-full" size="lg">
            {pending ? "Creating…" : "Create request link"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}
