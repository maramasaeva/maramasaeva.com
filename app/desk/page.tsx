import { deskConfigured, isDesk } from "@/lib/desk/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

/* Messaging is now the private desk entry; X public replies live at /desk/x. */
export default async function DeskPage() {
  if (await isDesk()) redirect("/desk/app")
  return <section className="flex flex-col gap-4">
    <h1 className="text-xl">your desk</h1>
    <p className="text-muted">Your private workspace, from any device. Replies in your voice stay drafts until you approve them.</p>
    {deskConfigured() ? <a href="/api/desk/google/start" className="self-start border border-faint px-3 py-2 font-sans text-meta hover:border-muted">Sign in with Google</a> : <p className="font-sans text-meta text-muted">Google sign-in is not configured yet.</p>}
  </section>
}
