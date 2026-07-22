import Link from "next/link";
import { cookies } from "next/headers";
import { getFreelancerBySlug } from "@/lib/db/repository";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const FREELANCER_COOKIE = "relay_freelancer_slug";

export default async function Home() {
  const cookieStore = await cookies();
  const slug = cookieStore.get(FREELANCER_COOKIE)?.value;
  const freelancer = slug ? getFreelancerBySlug(slug) : undefined;

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-xl flex-col justify-center px-6 py-16 text-center">
      <h1 className="font-heading text-4xl font-medium text-foreground sm:text-5xl">
        Write it <em className="italic">once</em>.
      </h1>
      <p className="mt-4 text-balance text-base text-muted-foreground sm:text-lg">
        Send one link. Your client writes a single recommendation, and we adapt it for
        LinkedIn, Upwork, and Contra — so they never have to write it three times.
      </p>
      <div className="mt-8 flex justify-center">
        <Button
          size="lg"
          nativeButton={false}
          render={
            <Link href={freelancer ? `/dashboard/${freelancer.slug}` : "/new"}>
              {freelancer ? "Go to your dashboard" : "Get started"}
              <ArrowRight />
            </Link>
          }
        />
      </div>
    </main>
  );
}
