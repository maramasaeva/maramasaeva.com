import Link from "next/link"
import { redirect } from "next/navigation"
import { isDesk } from "@/lib/desk/auth"
import Desk from "@/components/Desk"

export const dynamic = "force-dynamic"
export default async function XDeskPage() {
  if (!(await isDesk())) redirect("/desk")
  return <><Link href="/desk" className="mb-4 inline-block font-sans text-meta text-muted hover:text-fg">← your desk</Link><Desk /></>
}
