import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** Shared page heading: optional back link, title, description and a right-aligned action slot. */
export function PageHeader({
  title,
  description,
  back,
  actions,
  children,
}: {
  title: string;
  description?: string;
  back?: { href: string; label: string };
  actions?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="space-y-5">
      {back && (
        <Link
          href={back.href}
          className="-ml-1 inline-flex items-center gap-1.5 rounded-full px-1 py-0.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> {back.label}
        </Link>
      )}
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <h1 className="font-heading text-[1.75rem] leading-[1.1] font-semibold tracking-[-0.035em] text-balance text-foreground sm:text-[2rem]">
            {title}
          </h1>
          {description && <p className="max-w-[64ch] text-[0.9375rem] leading-relaxed text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {children}
    </header>
  );
}
