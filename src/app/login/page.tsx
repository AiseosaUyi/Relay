import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { isOwner, safeNext } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const next = safeNext(typeof searchParams.next === "string" ? searchParams.next : undefined);
  if (await isOwner()) redirect(next);

  return (
    <main className="flex min-h-svh w-full flex-col items-center px-6 py-16">
      <header className="w-full max-w-md">
        <Logo href="/login" />
      </header>
      <div className="flex w-full flex-1 items-center justify-center">
        <Card className="w-full max-w-sm [--card-spacing:--spacing(6)]">
          <CardHeader>
            <CardTitle className="font-heading text-2xl tracking-tight">Welcome back</CardTitle>
            <CardDescription>Relay is private. Enter your password to see your requests.</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm next={next} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
