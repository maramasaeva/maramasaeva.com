import type { Metadata } from "next"
import Link from "next/link"
import Linkified from "@/components/Linkified"
import { cv, elsewhere, repos } from "@/lib/data"

export const metadata: Metadata = { title: "work" }

/* Opens in the same tab for pages on this site, a new one for everything else. */
function Out({ href, children }: { href: string; children: React.ReactNode }) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className="prose-link">
        {children}
      </Link>
    )
  }
  return (
    <a href={href} className="prose-link" target="_blank" rel="noreferrer">
      {children}
    </a>
  )
}

/* What used to be /about (the timeline) and /work (the code) on one page:
   the timeline first, then the repositories, each a link and one sentence. */
export default function Work() {
  return (
    <div className="flow-lg">
      <section>
        <h1 className="text-head mb-4">what i&apos;ve been doing</h1>
        <ul>
          {cv.map((row) => (
            <li key={row.years + row.org} className="flex gap-3">
              <span className="w-[4.5rem] shrink-0 font-sans text-meta text-muted tabular-nums leading-[1.7]">
                {row.years}
              </span>
              <span>
                <Linkified text={row.what} refs={row.refs} />{" "}
                <span className="font-sans text-meta text-muted">
                  ·{" "}
                  {row.href ? (
                    <a
                      href={row.href}
                      className="hover:text-fg hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {row.org}
                    </a>
                  ) : (
                    row.org
                  )}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-head mb-4">repositories</h2>
        <ul className="flow">
          {repos.map((repo) => (
            <li key={repo.title} className="flex gap-3">
              <span className="w-[4.5rem] shrink-0 font-sans text-meta text-muted tabular-nums leading-[1.7]">
                {repo.year}
              </span>
              <span>
                {repo.href ? <Out href={repo.href}>{repo.title}</Out> : repo.title}
                {repo.note && (
                  <span className="font-sans text-meta text-muted"> · {repo.note}</span>
                )}
                <span className="block text-muted">{repo.what}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-head mb-4">elsewhere</h2>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 font-sans text-meta">
          {elsewhere.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-muted hover:text-fg"
                target="_blank"
                rel="noreferrer"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
