import { deskConfigured, isDesk } from "@/lib/desk/auth"
import { redirect } from "next/navigation"
import ThemeToggle from "@/components/ThemeToggle"
export const dynamic = "force-dynamic"
export default async function DeskPage() {
  if (await isDesk()) redirect("/desk/app")
  return <main className="desk-login"><header><a href="/">mara messier masaeva ↗</a><ThemeToggle /></header><section><p className="eyebrow">private dashboard</p><h1>mara’s <em>desk.</em></h1><p>messages and editable drafts. nothing sends until you approve it.</p><div className="login-card"><span className="eyebrow">owner access only</span>{deskConfigured() ? <><a href="/api/desk/google/start" className="desk-button primary"><span aria-hidden>g</span> sign in with google →</a><p>use your authorised google account. every reply stays a draft until you approve it.</p></> : <><h2>not connected yet.</h2><p>google sign-in is not configured. your private workspace stays closed until owner access is ready.</p></>}</div><div className="login-modules"><span>messages</span><span>calendar · later</span><span>notes & tasks · later</span><span>images · later</span></div></section><footer>nothing sends automatically.</footer></main>
}
