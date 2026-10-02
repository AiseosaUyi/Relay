"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { saveSettingsAction, type SettingsState } from "./actions";

export function SettingsForm({
  welcome,
  children,
}: {
  welcome: boolean;
  children: React.ReactNode;
}) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(saveSettingsAction, { error: null });
  return (
    <form action={action} className="space-y-8">
      {welcome && <input type="hidden" name="welcome" value="1" />}
      {children}
      <div className="sticky bottom-0 -mx-6 flex items-center gap-3 border-t border-border bg-background/90 px-6 py-4 backdrop-blur-sm">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Saving…" : welcome ? "Save and create a request" : "Save settings"}
        </Button>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        {state.saved && !state.error && (
          <p className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <Check className="size-4 text-primary" /> Saved
          </p>
        )}
      </div>
    </form>
  );
}

export function TextField({
  name,
  label,
  defaultValue,
  placeholder,
  help,
  required,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  placeholder?: string;
  help?: string;
  required?: boolean;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <Input name={name} defaultValue={defaultValue ?? ""} placeholder={placeholder} required={required} />
      {help && <span className="block text-xs text-muted-foreground">{help}</span>}
    </label>
  );
}
