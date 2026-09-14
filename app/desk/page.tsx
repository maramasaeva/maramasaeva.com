import { deskConfigured, isDesk } from "@/lib/desk/auth"
import Desk from "@/components/Desk"
import DeskLogin from "@/components/DeskLogin"

export const dynamic = "force-dynamic"

/* /desk: mara's private reply desk. Not linked from anywhere, noindex, and
   the page renders the login form to anyone without the cookie. */
export default async function DeskPage() {
  if (!deskConfigured()) return <p className="text-muted">nothing here.</p>
  return (await isDesk()) ? <Desk /> : <DeskLogin />
}
