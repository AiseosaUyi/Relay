"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PLATFORM_LIST } from "@/lib/adaptation/platforms";
import { createRequestAction, type CreateRequestState } from "./actions";
import { User, AtSign, Mail, ArrowRight } from "lucide-react";
import { PlatformIcon } from "@/components/icons/platform-icon";

const initialState: CreateRequestState = { error: null };

export function NewRequestForm({
  freelancerName,
}: {
  freelancerName: string | null;
}) {
  const [state, formAction, pending] = useActionState(createRequestAction, initialState);

  return (
    <Card className="mx-auto w-full max-w-md [--card-spacing:--spacing(6)]">
      <CardHeader>
        <CardTitle className="font-heading text-2xl tracking-tight">
          {freelancerName ? `New request` : "Set up your recommendation page"}
        </CardTitle>
        <CardDescription>
          {freelancerName
            ? `Add a client for ${freelancerName}, pick which platforms apply, and get a link to send them.`
            : "Tell us your name, add your first client, and we'll generate a link you can send them."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          {!freelancerName && (
            <Field label="Your name" icon={User}>
              <Input name="freelancerName" placeholder="Ada Lovelace" required className="pl-9" />
            </Field>
          )}
          <Field label="Client name" icon={AtSign}>
            <Input name="clientName" placeholder="Grace Hopper" required className="pl-9" />
          </Field>
          <Field label="Client email (optional)" icon={Mail}>
            <Input
              name="clientEmail"
              type="email"
              placeholder="grace@example.com"
              className="pl-9"
            />
          </Field>
          <fieldset className="space-y-2 pt-1">
            <legend className="text-sm font-medium text-foreground">
              Which platforms does this client need to appear on?
            </legend>
            <div className="flex flex-wrap gap-2">
              {PLATFORM_LIST.map((platform) => (
                <label
                  key={platform.id}
                  className="group/chip inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-wash px-3 py-1.5 text-sm font-medium text-foreground transition-colors has-checked:border-primary/30 has-checked:bg-primary/10 has-checked:text-primary"
                >
                  <input
                    type="checkbox"
                    name="platforms"
                    value={platform.id}
                    defaultChecked
                    className="sr-only"
                  />
                  <PlatformIcon id={platform.id} className="size-4" />
                  {platform.label}
                </label>
              ))}
            </div>
          </fieldset>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" disabled={pending} className="w-full" size="lg">
            {pending ? "Creating…" : "Create request link"}
            {!pending && <ArrowRight />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className="relative flex items-center">
        <Icon className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
        {children}
      </span>
    </label>
  );
}
