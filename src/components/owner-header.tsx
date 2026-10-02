import Link from "next/link";
import { Plus, Settings, LogOut } from "lucide-react";
import { Logo } from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/login/actions";
import { authConfigured } from "@/lib/auth";

export function OwnerHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between gap-2 px-6">
        <Logo href="/dashboard" />
        <nav className="flex items-center gap-1">
          <Link href="/settings" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            <Settings /> <span className="hidden sm:inline">Settings</span>
          </Link>
          {authConfigured() && (
            <form action={logoutAction}>
              <button type="submit" className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))} aria-label="Log out">
                <LogOut />
              </button>
            </form>
          )}
          <Link href="/new" className={cn(buttonVariants({ size: "sm" }), "ml-1")}>
            <Plus /> New request
          </Link>
        </nav>
      </div>
    </header>
  );
}
