import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function copyWithExecCommand(text: string): boolean {
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

/**
 * navigator.clipboard.writeText can reject (denied permission, insecure
 * context, older Safari) OR just hang indefinitely without ever settling
 * (observed under automated/CDP-driven clicks, where the browser appears to
 * wait on a permission decision nothing can supply) — so a plain try/catch
 * isn't enough. Race it against a short timeout and fall back to the legacy
 * execCommand path (synchronous, not subject to the same hang) either way,
 * so copy buttons never wait forever and always reflect what happened.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    const succeeded = await Promise.race([
      navigator.clipboard.writeText(text).then(
        () => true,
        () => false
      ),
      new Promise<false>((resolve) => setTimeout(() => resolve(false), 800)),
    ]);
    if (succeeded) return true;
  }
  return copyWithExecCommand(text);
}
