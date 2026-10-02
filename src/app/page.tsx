import { redirect } from "next/navigation";

// Relay is a personal tool. Home is the dashboard, which asks for the
// password when needed. Clients only ever see /r/[slug].
export default function Home() {
  redirect("/dashboard");
}
