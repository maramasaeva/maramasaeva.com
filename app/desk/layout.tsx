import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "desk",
  robots: { index: false, follow: false, nocache: true },
}

export default function DeskLayout({ children }: { children: React.ReactNode }) {
  return children
}
