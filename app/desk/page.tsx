import { isDesk } from "@/lib/desk/auth"
import { notFound, redirect } from "next/navigation"

export const dynamic = "force-dynamic"

/* Messaging is now the private desk entry; X public replies live at /desk/x. */
export default async function DeskPage() {
  if (!(await isDesk())) notFound()
  redirect("/desk/app")
}
