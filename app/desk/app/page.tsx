import { isDesk } from "@/lib/desk/auth"
import { redirect } from "next/navigation"
import DeskWorkspace from "@/components/DeskWorkspace"
export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export default async function DeskApp() {
  if (!(await isDesk())) redirect("/desk")
  return <DeskWorkspace />
}
