import type { Metadata } from "next"
import Prikbord from "@/components/Prikbord"
import { configured, listMessages } from "@/lib/prikbord"
import PageHeading from "@/components/PageHeading"

export const metadata: Metadata = { title: "messageboard" }
export const dynamic = "force-dynamic"

/* The board itself lives in components/Prikbord.tsx. The messages are read
   here, on the server, so they are in the html on first paint instead of
   popping in after a client fetch. */
export default async function Messageboard() {
  const initial = await listMessages().catch((err: unknown) => {
    console.warn("[prikbord]", err instanceof Error ? err.message : err)
    return null
  })
  return (
    <div className="messageboard-page">
      <PageHeading title="messageboard"><p>leave me a message.</p></PageHeading>
      <Prikbord initial={initial} enabled={configured()} />
    </div>
  )
}
