import type { Metadata } from "next"
import { selected } from "@/lib/data"

export const metadata: Metadata = { title: "work" }

export default function Work() {
  return (
    <ul className="space-y-9">
      {selected.map((item) => (
        <li key={item.title}>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-head">
              {item.href ? (
                <a
                  href={item.href}
                  className="prose-link"
                  target="_blank"
                  rel="noreferrer"
                >
                  {item.title}
                </a>
              ) : (
                item.title
              )}
            </h2>
            <span className="shrink-0 font-mono text-meta text-muted tabular-nums">
              {item.year}
            </span>
          </div>
          <p className="mt-1 text-muted">{item.blurb}</p>
          {item.note && (
            <p className="mt-1 font-mono text-meta text-muted">{item.note}</p>
          )}
        </li>
      ))}
    </ul>
  )
}
