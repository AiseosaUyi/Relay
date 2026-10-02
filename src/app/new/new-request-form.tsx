"use client";

import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DestinationPicker } from "@/components/destination-picker";
import type { DestinationId } from "@/lib/destinations/registry";
import { createRequestAction, type CreateRequestState } from "./actions";

export function NewRequestForm({ defaults }: { defaults: DestinationId[] }) {
  const [state, formAction, pending] = useActionState<CreateRequestState, FormData>(createRequestAction, { error: null });

  return (
    <form action={formAction} className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">Client name</span>
          <Input name="clientName" placeholder="Grace Hopper" required defaultValue={state.values?.clientName} />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">Client email (optional)</span>
          <Input name="clientEmail" type="email" placeholder="grace@company.com" defaultValue={state.values?.clientEmail} />
          <span className="block text-xs text-muted-foreground">Use the same email when you send platform requests.</span>
        </label>
      </div>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-foreground">What you worked on (optional)</span>
        <Textarea
          name="context"
          rows={2}
          placeholder="Redesigned the onboarding flow for their banking app, Jan to Apr 2026"
          defaultValue={state.values?.context}
        />
        <span className="block text-xs text-muted-foreground">Shown to the client as a reminder. The AI uses it for context only.</span>
      </label>

      <DestinationPicker
        key={state.values ? state.values.destinations.join() : "defaults"}
        selected={state.values ? state.values.destinations : defaults}
      />

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending} size="lg" className="w-full sm:w-auto">
        {pending ? "Creating…" : "Create link"}
        {!pending && <ArrowRight />}
      </Button>
    </form>
  );
}
