import type { Metadata } from "next"
import Prikbord from "@/components/Prikbord"

export const metadata: Metadata = { title: "messageboard" }

/* The board itself lives in components/Prikbord.tsx. */
export default function Messageboard() {
  return (
    <div className="max-w-[34rem]">
      <Prikbord />
    </div>
  )
}
