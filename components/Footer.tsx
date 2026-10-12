import { elsewhere } from "@/lib/data"
export default function Footer() {
  return <footer className="site-footer"><p>find me if you want me.</p><div>{elsewhere.map(link => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label} ↗</a>)}</div><a href="/messageboard">or leave a note →</a></footer>
}
