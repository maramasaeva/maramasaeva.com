"use client"

import { useState } from "react"
import type { ActivityItem, ActivityResponse, Category, Source } from "@/lib/activity/types"
import { CATEGORIES } from "@/lib/activity/types"
import { now } from "@/lib/data"

/* What i've been up to, pulled from github, strava, substack, bandcamp, a
   calendar and a hand-kept tweet list. The server renders the data (an hour
   old at most); this only holds the active filter and which images are open. */

/* strava is wired up but parked until there is something to show */
const SOURCES: Source[] = ["github", "substack", "bandcamp", "calendar", "x"]

const MONTHS = "jan feb mar apr may jun jul aug sep oct nov dec".split(" ")
const QUOTE_MAX = 140

/** "10 sep", or "10 sep 25" when it is not this year */
function shortDate(iso: string) {
  const d = new Date(iso)
  const s = `${String(d.getUTCDate()).padStart(2, "0")} ${MONTHS[d.getUTCMonth()]}`
  return d.getUTCFullYear() === new Date().getUTCFullYear()
    ? s
    : `${s} ${String(d.getUTCFullYear()).slice(2)}`
}

function ago(iso: string) {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (s < 60) return "just now"
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const truncate = (s: string, n: number) =>
  s.length > n ? s.slice(0, n).replace(/\s+\S*$/, "") + "…" : s

function Arrow({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
      className="ml-1 inline-block font-mono text-meta text-muted transition-colors hover:text-accent"
    >
      ↗
    </a>
  )
}

function Tweet({ it }: { it: ActivityItem }) {
  const [open, setOpen] = useState(false)
  const images = it.images ?? []
  return (
    <>
      <span className="whitespace-pre-line [hyphens:none]">{it.body}</span>
      {it.url && <Arrow href={it.url} label="open on x" />}
      {it.quote && (
        <span className="mt-1 block border-l border-faint pl-2 text-muted [hyphens:none]">
          <span className="font-mono text-meta">{it.quote.name}</span>{" "}
          {truncate(it.quote.text, QUOTE_MAX)}
        </span>
      )}
      {images.length > 0 && (
        <span className="mt-1 block">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="cursor-pointer font-mono text-meta text-muted hover:text-fg hover:underline"
          >
            {open ? "hide image" : images.length > 1 ? `show ${images.length} images` : "show image"}
          </button>
          {open &&
            images.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                alt=""
                loading="lazy"
                className="mt-2 block max-h-64 w-auto max-w-full border border-faint"
              />
            ))}
        </span>
      )}
    </>
  )
}

export default function ActivityPanel({ data }: { data: ActivityResponse }) {
  const [filter, setFilter] = useState<Category | "all">("all")

  const available = CATEGORIES.filter((c) => data.counts[c] > 0)
  const items =
    filter === "all" ? data.items : data.items.filter((i) => i.category === filter)

  return (
    <section
      aria-labelledby="activity-heading"
      className="activity-panel text-[0.92em]"
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-meta">
        <h2 id="activity-heading" className="text-fg">
          recent activity
        </h2>
        <ul className="flex flex-wrap gap-x-3 gap-y-1" role="tablist" aria-label="filter">
          {(["all", ...available] as const).map((c) => {
            const active = filter === c
            return (
              <li key={c}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(c)}
                  className={`cursor-pointer transition-colors hover:text-fg ${
                    active ? "text-accent" : "text-muted"
                  }`}
                >
                  {c}
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {now.place && (
        <p className="mt-2 flex items-center gap-1.5 text-left font-mono text-meta text-muted [hyphens:none]">
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="shrink-0 text-accent"
          >
            <path d="M12 22s7-6.4 7-12a7 7 0 1 0-14 0c0 5.6 7 12 7 12Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          <span className="text-fg">{now.place}</span>
          {now.since && <span>since {now.since}</span>}
          {now.note && <span>· {now.note}</span>}
        </p>
      )}

      <ul className="activity-scroll mt-2 max-h-[46vh] overflow-y-auto border-t border-faint lg:max-h-[19rem]">
        {items.length === 0 && <li className="py-2 text-muted">nothing here yet.</li>}
        {items.map((it) => (
          <li
            key={it.id}
            className="flex gap-3 border-b border-faint py-[calc(var(--gap)*0.5)]"
          >
            <span className="w-[3.6rem] shrink-0 font-mono text-meta text-muted tabular-nums leading-[1.7]">
              {shortDate(it.day ?? it.timestamp)}
            </span>
            <span className="min-w-0 flex-1">
              {(it.today || it.upcoming) && (
                <span className="mr-2 font-mono text-meta text-accent">
                  {it.today ? "today" : "upcoming"}
                </span>
              )}
              {it.category === "tweets" ? (
                <Tweet it={it} />
              ) : (
                <>
                  {it.url ? (
                    <a href={it.url} className="prose-link" target="_blank" rel="noreferrer">
                      {it.title}
                    </a>
                  ) : (
                    it.title
                  )}
                  {it.body && (
                    <span className="mt-0.5 block whitespace-pre-line font-mono text-meta text-muted [hyphens:none]">
                      {it.body}
                    </span>
                  )}
                </>
              )}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-2 text-left font-mono text-meta text-muted [hyphens:none]">
        {SOURCES.map((s, i) => (
          <span key={s} title={data.sources[s]}>
            {i > 0 && " "}
            {s}
            {data.sources[s] === "ok" ? "✓" : data.sources[s] === "error" ? "✗" : "–"}
          </span>
        ))}
        {" · "}synced {ago(data.lastSync)}
      </p>
    </section>
  )
}
