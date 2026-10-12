import { elsewhere } from "@/lib/data"
export default function Footer() {
  return <footer className="site-footer"><div>{elsewhere.map(link => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label} ↗</a>)}</div><a href="/messageboard">messageboard →</a></footer>
}
