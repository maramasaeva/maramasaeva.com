import type { Metadata } from "next"
import ThinkEssay from "./ThinkEssay"

export const metadata: Metadata = {
  title: "i work in ai, that's why i'm saying this",
  description:
    "on cognitive offloading, what deep reading costs when we automate it, and why children need to develop a capacity before they depend on a system that has it for them.",
}

export default function ThinkPage() {
  return <ThinkEssay />
}
