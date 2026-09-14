"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { SOFT_MAX } from "@/lib/desk/config"
import type { Item, Sent } from "@/lib/desk/store"

/* The desk: a short list of new posts from a handful of watched accounts,
   and under each one a composer that asks for three drafts in mara's voice,
   lets them edit, and posts on an explicit second click. Nothing leaves
   without that click. */

type Kind = "reply" | "quote" | "post"
type Feed = { items: Item[]; sent: Sent[]; lastRefresh: string | null; watched: string[] }

function ago(iso: string | null) {
  if (!iso) return "never"
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (s < 60) return "just now"
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 48) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const n = (x?: number) => (x == null ? "" : x >= 10_000 ? `${Math.round(x / 1000)}k` : String(x))
const HAS_LINK = /https?:\/\/|www\.|\b[a-z0-9-]+\.(?:com|net|org|io|ai|dev|xyz|co|substack\.com)\b/i

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } })
  const d = (await res.json().catch(() => ({}))) as T & { error?: string }
  if (!res.ok) throw new Error(d.error ?? `failed (${res.status})`)
  return d
}

/* x refuses api replies and quotes unless the author mentioned you first (rule
   since feb 2026, every tier below enterprise). so replies and quotes are
   handed to x's own composer, prefilled; mara taps send in the app. */
function intentUrl(kind: Kind, text: string, item: Item | null) {
  const q = new URLSearchParams({ text })
  if (item && kind === "reply") q.set("in_reply_to", item.id)
  if (item && kind === "quote") q.set("url", `https://x.com/${item.author}/status/${item.id}`)
  return `https://x.com/intent/post?${q}`
}

const btn =
  "cursor-pointer border border-faint px-2.5 py-1 text-fg transition-colors hover:border-muted disabled:cursor-default disabled:text-muted"
const link = "cursor-pointer text-muted hover:text-fg"

/* ---- composer -------------------------------------------------------------- */

function Composer({
  kind,
  item,
  onDone,
  onClose,
}: {
  kind: Kind
  item: Item | null
  onDone: (sent: Sent) => void
  onClose: () => void
}) {
  const [hint, setHint] = useState("")
  const [drafts, setDrafts] = useState<string[]>([])
  const [text, setText] = useState("")
  const [busy, setBusy] = useState<"draft" | "post" | null>(null)
  const [arm, setArm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [posted, setPosted] = useState<string | null>(null)

  async function draft() {
    setBusy("draft")
    setError(null)
    try {
      const d = await api<{ drafts: { text: string }[] }>("/api/desk/draft", {
        method: "POST",
        body: JSON.stringify({ kind, itemId: item?.id, hint }),
      })
      setDrafts(d.drafts.map((x) => x.text))
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed")
    } finally {
      setBusy(null)
    }
  }

  async function post() {
    if (!arm) {
      setArm(true)
      return
    }
    setBusy("post")
    setError(null)
    try {
      const d = await api<{ id: string; url: string }>("/api/desk/post", {
        method: "POST",
        body: JSON.stringify({ kind, text, target: item?.id }),
      })
      setPosted(d.url)
      onDone({ id: d.id, text, kind, target: item?.id ?? null, created_at: new Date().toISOString() })
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed")
      setArm(false)
    } finally {
      setBusy(null)
    }
  }

  const over = text.length > SOFT_MAX
  const linky = kind === "post" && HAS_LINK.test(text)
  const viaX = kind !== "post"

  function handoff() {
    window.open(intentUrl(kind, text, item), "_blank", "noopener")
    onDone({ id: "", text, kind, target: item?.id ?? null, created_at: new Date().toISOString() })
    setPosted("handoff")
  }

  if (posted === "handoff")
    return (
      <div className="mt-3 border-l border-faint pl-3 font-sans text-meta">
        <p className="text-fg">
          opened in x. tap post there.{" "}
          <button type="button" onClick={() => setPosted(null)} className={link}>
            back
          </button>
        </p>
      </div>
    )

  if (posted)
    return (
      <div className="mt-3 border-l border-faint pl-3 font-sans text-meta">
        <p className="text-fg">
          posted.{" "}
          <a href={posted} target="_blank" rel="noopener noreferrer" className="prose-link">
            open on x
          </a>
        </p>
      </div>
    )

  return (
    <div className="mt-3 flex flex-col gap-2 border-l border-faint pl-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-sans text-meta">
        <input
          id={`hint-${item?.id ?? "post"}`}
          type="text"
          value={hint}
          onChange={(e) => setHint(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              void draft()
            }
          }}
          placeholder={kind === "post" ? "what is the post about" : "your angle (optional)"}
          aria-label="note for the drafts"
          className="min-w-0 flex-1 border-b border-faint bg-transparent py-1 text-fg placeholder:text-muted focus:border-muted focus:outline-none"
        />
        <button type="button" onClick={draft} disabled={busy !== null || (kind === "post" && !hint.trim())} className={btn}>
          {busy === "draft" ? "drafting…" : drafts.length ? "again" : "draft"}
        </button>
        <button type="button" onClick={onClose} className={link}>
          close
        </button>
      </div>

      {drafts.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {drafts.map((d, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => {
                  setText(d)
                  setArm(false)
                }}
                className={`w-full cursor-pointer border px-3 py-2 text-left text-body whitespace-pre-wrap transition-colors ${
                  text === d ? "border-muted text-fg" : "border-faint text-muted hover:text-fg"
                }`}
              >
                {d}
              </button>
            </li>
          ))}
        </ul>
      )}

      <textarea
        id={`text-${item?.id ?? "post"}`}
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          setArm(false)
        }}
        rows={4}
        placeholder={drafts.length ? "pick a draft above, or write" : "write, or ask for drafts"}
        aria-label={`${kind} text`}
        className="w-full resize-y border border-faint bg-transparent px-3 py-2 text-body text-fg placeholder:text-muted focus:border-muted focus:outline-none"
      />

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-sans text-meta">
        <span className={`tabular-nums ${over ? "text-accent" : "text-muted"}`}>
          {text.length}/{SOFT_MAX}
        </span>
        {linky && <span className="text-accent">has a link: costs 0.20 instead of 0.015</span>}
        <span className="flex-1" />
        {viaX ? (
          <button type="button" onClick={handoff} disabled={!text.trim()} className={btn}>
            open in x
          </button>
        ) : (
          <>
            {arm && <span className="text-muted">as @rssmrm, new post. sure?</span>}
            <button type="button" onClick={post} disabled={busy !== null || !text.trim()} className={`${btn} ${arm ? "border-accent" : ""}`}>
              {busy === "post" ? "posting…" : arm ? "yes, post" : "post"}
            </button>
          </>
        )}
      </div>
      {error && <p className="font-sans text-meta text-accent">{error}</p>}
    </div>
  )
}

/* ---- the desk -------------------------------------------------------------- */

export default function Desk() {
  const [feed, setFeed] = useState<Feed | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const [who, setWho] = useState<string>("all")
  const [open, setOpen] = useState<{ id: string; kind: Kind } | null>(null)
  const [composing, setComposing] = useState(false)
  const [done, setDone] = useState<Record<string, string>>({})
  const router = useRouter()

  const load = useCallback(async () => {
    try {
      setFeed(await api<Feed>("/api/desk/feed"))
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed")
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function refresh() {
    setRefreshing(true)
    setError(null)
    setNote(null)
    try {
      const d = await api<Feed & { fetched: number; tooSoon: boolean; errors: string[] }>("/api/desk/feed", { method: "POST" })
      setFeed(d)
      setNote(d.tooSoon ? "refreshed less than 5 min ago" : `${d.fetched} new${d.errors.length ? ` · ${d.errors.join("; ")}` : ""}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed")
    } finally {
      setRefreshing(false)
    }
  }

  async function dismiss(id: string) {
    setFeed((f) => (f ? { ...f, items: f.items.filter((i) => i.id !== id) } : f))
    try {
      await api("/api/desk/hide", { method: "POST", body: JSON.stringify({ id }) })
    } catch {}
  }

  async function out() {
    await fetch("/api/desk/login", { method: "DELETE" })
    router.refresh()
  }

  const authors = useMemo(() => {
    const c: Record<string, number> = {}
    for (const i of feed?.items ?? []) c[i.author] = (c[i.author] ?? 0) + 1
    return Object.entries(c).sort((a, b) => b[1] - a[1])
  }, [feed])

  const items = (feed?.items ?? []).filter((i) => who === "all" || i.author === who)

  return (
    <section aria-labelledby="desk-heading" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <h1 id="desk-heading" className="text-head">
          desk
        </h1>
        <span className="flex flex-wrap items-baseline gap-x-3 font-sans text-meta text-muted">
          <button type="button" onClick={refresh} disabled={refreshing} className={link}>
            {refreshing ? "pulling…" : "refresh"}
          </button>
          <button type="button" onClick={() => setComposing((c) => !c)} className={link}>
            {composing ? "close" : "new post"}
          </button>
          <span>synced {ago(feed?.lastRefresh ?? null)}</span>
          {note && <span className="text-fg">{note}</span>}
          <span className="flex-1" />
          <button type="button" onClick={out} className={link}>
            out
          </button>
        </span>
      </div>

      {composing && (
        <Composer
          kind="post"
          item={null}
          onClose={() => setComposing(false)}
          onDone={(s) => setFeed((f) => (f ? { ...f, sent: [s, ...f.sent] } : f))}
        />
      )}

      {error && <p className="font-sans text-meta text-accent">{error}</p>}

      {authors.length > 1 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 font-sans text-meta">
          {[["all", items.length] as const, ...authors].map(([a, c]) => (
            <button
              key={a}
              type="button"
              onClick={() => setWho(a)}
              className={`cursor-pointer ${who === a ? "text-fg underline" : "text-muted hover:text-fg"}`}
            >
              {a === "all" ? "all" : `@${a}`} <span className="tabular-nums">{a === "all" ? feed?.items.length : c}</span>
            </button>
          ))}
        </div>
      )}

      <ul className="border-t border-faint">
        {!feed && !error && <li className="py-3 font-sans text-meta text-muted">reading the desk…</li>}
        {feed && items.length === 0 && (
          <li className="py-3 text-muted">nothing new. hit refresh.</li>
        )}
        {items.map((it) => (
          <li key={it.id} className="border-b border-faint py-3">
            <div className="flex flex-wrap items-baseline gap-x-3 font-sans text-meta text-muted">
              <span className="text-fg">@{it.author}</span>
              <span>{ago(it.created_at)}</span>
              {it.metrics && (
                <span className="tabular-nums">
                  ♥{n(it.metrics.likes)} · {n(it.metrics.replies)} replies · {n(it.metrics.reposts)} reposts
                  {it.metrics.views ? ` · ${n(it.metrics.views)} views` : ""}
                </span>
              )}
              <a
                href={`https://x.com/${it.author}/status/${it.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-fg"
              >
                open ↗
              </a>
            </div>
            <p className="mt-1 whitespace-pre-wrap [overflow-wrap:anywhere]">{it.text}</p>
            <div className="mt-2 flex flex-wrap gap-x-3 font-sans text-meta">
              {done[it.id] ? (
                <a href={done[it.id]} target="_blank" rel="noopener noreferrer" className="prose-link">
                  handed to x ✓
                </a>
              ) : (
                <>
                  <button type="button" onClick={() => setOpen(open?.id === it.id && open.kind === "reply" ? null : { id: it.id, kind: "reply" })} className={link}>
                    reply
                  </button>
                  <button type="button" onClick={() => setOpen(open?.id === it.id && open.kind === "quote" ? null : { id: it.id, kind: "quote" })} className={link}>
                    quote
                  </button>
                </>
              )}
              <button type="button" onClick={() => dismiss(it.id)} className={link}>
                dismiss
              </button>
            </div>
            {open?.id === it.id && (
              <Composer
                key={open.kind}
                kind={open.kind}
                item={it}
                onClose={() => setOpen(null)}
                onDone={(s) => {
                  setDone((d) => ({ ...d, [it.id]: s.id ? `https://x.com/rssmrm/status/${s.id}` : `https://x.com/${it.author}/status/${it.id}` }))
                  if (s.id) setFeed((f) => (f ? { ...f, sent: [s, ...f.sent] } : f))
                }}
              />
            )}
          </li>
        ))}
      </ul>

      {feed && feed.sent.length > 0 && (
        <div className="flow">
          <h2 className="font-sans text-meta text-muted">sent from here</h2>
          <ul className="flex flex-col gap-2">
            {feed.sent.map((s) => (
              <li key={s.id} className="flex flex-col gap-0.5">
                <span className="font-sans text-meta text-muted">
                  {s.kind} · {ago(s.created_at)} ·{" "}
                  <a href={`https://x.com/rssmrm/status/${s.id}`} target="_blank" rel="noopener noreferrer" className="hover:text-fg">
                    open ↗
                  </a>
                </span>
                <span className="whitespace-pre-wrap text-muted">{s.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="font-sans text-meta text-muted">
        watching {feed?.watched.map((w) => `@${w}`).join(" ") ?? "…"}
      </p>
    </section>
  )
}
