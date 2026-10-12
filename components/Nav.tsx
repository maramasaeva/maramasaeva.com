"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import ThemeToggle from "./ThemeToggle"
const items = ["work", "creative", "services", "writing", "questions", "messageboard", "observatory"]
export default function Nav() {
  const path = usePathname()
  return <header className="site-header"><Link href="/" className="site-name">mara messier masaeva<span>software / sound / ai safety</span></Link><nav aria-label="main navigation">{items.map(name => <a key={name} href={`/${name}`} aria-current={path.startsWith(`/${name}`) ? "page" : undefined}>{name}</a>)}</nav><div className="nav-tools"><ThemeToggle /><Link href="/desk" className="desk-link">desk ↗</Link></div></header>
}
