"use client";

import { useState } from "react";
import { Copy, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/utils";

export function CopyButton({
  text,
  label = "Copy",
  onCopied,
  variant = "outline",
  size = "default",
}: {
  text: string | (() => string);
  label?: string;
  onCopied?: () => void;
  variant?: "outline" | "default" | "ghost" | "secondary";
  size?: "default" | "sm";
}) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function handleCopy() {
    const ok = await copyToClipboard(typeof text === "function" ? text() : text);
    setStatus(ok ? "copied" : "error");
    if (ok) onCopied?.();
    setTimeout(() => setStatus("idle"), 1500);
  }

  return (
    <Button type="button" variant={variant} size={size} onClick={handleCopy}>
      {status === "copied" && <Check className="text-signal" />}
      {status === "error" && <X className="text-destructive" />}
      {status === "idle" && <Copy />}
      {status === "copied" ? "Copied" : status === "error" ? "Couldn't copy" : label}
    </Button>
  );
}

/** Copies an absolute URL built from the current origin. */
export function CopyLinkButton({ path, label = "Copy link", size = "default" }: { path: string; label?: string; size?: "default" | "sm" }) {
  return <CopyButton text={() => `${window.location.origin}${path}`} label={label} size={size} />;
}
