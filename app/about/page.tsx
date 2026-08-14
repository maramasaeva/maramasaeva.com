import type { Metadata } from "next"
import { cv, elsewhere } from "@/lib/data"

export const metadata: Metadata = { title: "about" }

export default function About() {
  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-head mb-4">what i&apos;ve been doing</h1>
        <ul className="space-y-2">
          {cv.map((row) => (
            <li key={row.years + row.org} className="flex gap-3">
              <span className="w-[4.5rem] shrink-0 font-mono text-meta text-muted tabular-nums leading-[1.7]">
                {row.years}
              </span>
              <span>
                {row.what}{" "}
                <span className="font-mono text-meta text-muted">
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
        <h2 className="text-head mb-4">elsewhere</h2>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-meta">
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
