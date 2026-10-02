import Link from "next/link";
import { Plus, Settings, LogOut } from "lucide-react";
import { Logo } from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/login/actions";
import { authConfigured } from "@/lib/auth";

export function OwnerHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-2 px-6 py-4">
        <Logo href="/dashboard" />
        <nav className="flex items-center gap-1.5">
          <Link href="/settings" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            <Settings /> <span className="hidden sm:inline">Settings</span>
          </Link>
          {authConfigured() && (
            <form action={logoutAction}>
              <button type="submit" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))} aria-label="Log out">
                <LogOut />
              </button>
            </form>
          )}
          <Link href="/new" className={buttonVariants({ size: "sm" })}>
            <Plus /> New request
          </Link>
        </nav>
      </div>
    </header>
  );
}
