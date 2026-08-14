import type { Metadata } from "next"
import { cv, elsewhere, type CvRow } from "@/lib/data"

export const metadata: Metadata = { title: "about" }

/* Turns the substrings named in row.refs into links, leaving the rest as text.
   Longest first, so a ref that contains another still matches correctly. */
function Linkified({ row }: { row: CvRow }) {
  if (!row.refs?.length) return <>{row.what}</>

  const pattern = new RegExp(
    `(${[...row.refs]
      .sort((a, b) => b.text.length - a.text.length)
      .map((r) => r.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|")})`,
    "g",
  )

  return (
    <>
      {row.what.split(pattern).map((part, i) => {
        const ref = row.refs!.find((r) => r.text === part)
        return ref ? (
          <a
            key={i}
            href={ref.href}
            className="prose-link"
            target="_blank"
            rel="noreferrer"
          >
            {part}
          </a>
        ) : (
          part
        )
      })}
    </>
  )
}

export default function About() {
  return (
    <div className="flow-lg">
      <section>
        <h1 className="text-head mb-4">what i&apos;ve been doing</h1>
        <ul>
          {cv.map((row) => (
            <li key={row.years + row.org} className="flex gap-3">
              <span className="w-[4.5rem] shrink-0 font-mono text-meta text-muted tabular-nums leading-[1.7]">
                {row.years}
              </span>
              <span>
                <Linkified row={row} />{" "}
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
