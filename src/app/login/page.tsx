import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { isOwner, safeNext } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const next = safeNext(typeof searchParams.next === "string" ? searchParams.next : undefined);
  if (await isOwner()) redirect(next);

  return (
    <main className="flex min-h-svh w-full flex-col items-center px-6 py-10">
      <header className="w-full max-w-3xl">
        <Logo href="/login" />
      </header>
      <div className="page-enter flex w-full flex-1 items-center justify-center pb-16">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <h1 className="font-heading text-[2rem] leading-[1.1] font-semibold tracking-[-0.04em] text-foreground">Welcome back</h1>
            <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
              Relay is private. Enter your password to see your requests.
            </p>
          </div>
          <LoginForm next={next} />
        </div>
      </div>
    </main>
  );
}
