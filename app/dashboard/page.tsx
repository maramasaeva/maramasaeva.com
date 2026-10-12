import { notFound, redirect } from "next/navigation"
import { isDesk } from "@/lib/desk/auth"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  if (!(await isDesk())) notFound()
  redirect("/desk")
}
