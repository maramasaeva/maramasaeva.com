import type { Metadata } from "next"
import Link from "next/link"
import { selected } from "@/lib/data"

export const metadata: Metadata = { title: "work" }

export default function Work() {
  return (
    <ul className="grid gap-x-10 gap-y-[var(--gap)] sm:grid-cols-2">
      {selected.map((item) => (
        <li key={item.title}>
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-head">
              {item.href ? (
                item.href.startsWith("/") ? (
                  <Link href={item.href} className="prose-link">
                    {item.title}
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    className="prose-link"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {item.title}
                  </a>
                )
              ) : (
                item.title
              )}
            </h2>
            <span className="shrink-0 font-mono text-meta text-muted tabular-nums">
              {item.year}
              {item.note && <span className="ml-2">{item.note}</span>}
            </span>
          </div>
          <p className="text-muted">{item.blurb}</p>
          {item.alt && (
            <p className="font-mono text-meta">
              <a
                href={item.alt.href}
                className="prose-link"
                target="_blank"
                rel="noreferrer"
              >
                {item.alt.label}
              </a>
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}
