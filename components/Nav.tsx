import Link from "next/link"
import ThemeToggle from "@/components/ThemeToggle"

const items = [
  { href: "/", label: "mara messier masaeva" },
  { href: "/about", label: "about" },
  { href: "/work", label: "work" },
  { href: "/portfolio", label: "portfolio" },
  { href: "/writing", label: "writing" },
  { href: "/questions", label: "questions" },
  { href: "/messageboard", label: "messageboard" },
]

export default function Nav() {
  const [home, ...rest] = items

  return (
    <header className="font-sans text-meta">
      <nav className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <Link href={home.href} className="text-fg hover:underline">
          {home.label}
        </Link>
        <span className="flex gap-x-4 text-muted">
          {rest.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-fg">
              {item.label}
            </Link>
          ))}
        </span>
        <ThemeToggle />
      </nav>
    </header>
  )
}
