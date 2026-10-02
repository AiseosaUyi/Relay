"use client";

import { useSyncExternalStore } from "react";
import { CopyButton } from "@/components/copy-button";

const noopSubscribe = () => () => {};

function listToText(items: string[]) {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** A ready-to-paste note the owner sends the client themselves. Relay never sends it. */
export function InviteMessage({
  slug,
  clientName,
  ownerName,
  labels,
}: {
  slug: string;
  clientName: string;
  ownerName: string;
  labels: string[];
}) {
  const first = clientName.split(" ")[0];
  const where = labels.length ? ` It gives you ready versions for ${listToText(labels)}, so you only write it once.` : "";
  const message = (origin: string) =>
    `Hi ${first}, would you be open to writing me a short recommendation? It takes about two minutes.${where}\n\n${origin}/r/${slug}\n\nThank you, ${ownerName.split(" ")[0]}`;

  const origin = useSyncExternalStore(noopSubscribe, () => window.location.origin, () => "");

  return (
    <div className="space-y-2">
      <p className="rounded-xl bg-background px-3.5 py-3 text-sm whitespace-pre-wrap text-foreground ring-1 ring-foreground/10">
        {message(origin)}
      </p>
      <CopyButton text={() => message(window.location.origin)} label="Copy message" variant="default" />
    </div>
  );
}
