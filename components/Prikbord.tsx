"use client"

import { useEffect, useRef, useState } from "react"
import type { Message } from "@/lib/prikbord"
import { BODY_MAX, NAME_MAX } from "@/lib/prikbord"

/* The message board (/messageboard). Anyone can leave a note under any name,
   and everyone reads the same board. Storage and the rate limit live in
   /api/prikbord; this fetches on mount so the list is always fresh. */

const NAME_KEY = "prikbord-name"

function when(iso: string) {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (s < 60) return "just now"
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).toLowerCase()
}

type State = "loading" | "ready" | "off"

export default function Prikbord() {
  const [state, setState] = useState<State>("loading")
  const [messages, setMessages] = useState<Message[]>([])
  const [name, setName] = useState("")
  const [body, setBody] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    try {
      setName(localStorage.getItem(NAME_KEY) ?? "")
    } catch {}
    fetch("/api/prikbord")
      .then((r) => r.json())
      .then((d: { messages: Message[]; enabled: boolean }) => {
        setMessages(d.messages ?? [])
        setState(d.enabled ? "ready" : "off")
      })
      .catch(() => setState("off"))
  }, [])

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (sending || !body.trim()) return
    setSending(true)
    setError(null)
    const form = new FormData(e.currentTarget)
    try {
      const res = await fetch("/api/prikbord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          body: body.trim(),
          website: form.get("website"),
        }),
      })
      const d = (await res.json()) as { message?: Message; error?: string }
      if (!res.ok || !d.message) throw new Error(d.error ?? "could not save")
      setMessages((m) => [d.message!, ...m])
      setBody("")
      try {
        if (name.trim()) localStorage.setItem(NAME_KEY, name.trim())
      } catch {}
    } catch (err) {
      setError(err instanceof Error ? err.message : "could not save")
    } finally {
      setSending(false)
    }
  }

  if (state === "off")
    return <p className="text-muted">the board is closed for the moment.</p>

  return (
    <section aria-labelledby="prikbord-heading">
      <h1 id="prikbord-heading" className="text-head">
        messageboard
      </h1>

      <form onSubmit={submit} className="mt-3 border-t border-faint pt-3">
        <textarea
          ref={bodyRef}
          value={body}
          onChange={(e) => setBody(e.target.value.slice(0, BODY_MAX))}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") e.currentTarget.form?.requestSubmit()
          }}
          rows={3}
          required
          placeholder="leave a message"
          aria-label="message"
          className="w-full resize-y border border-faint bg-transparent px-3 py-2 text-body text-fg placeholder:text-muted focus:border-muted focus:outline-none"
        />
        {/* honeypot; hidden from people, not from scripts */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
        />
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-meta">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, NAME_MAX))}
            placeholder="name (optional)"
            aria-label="name, optional"
            className="min-w-0 flex-1 border-b border-faint bg-transparent py-1 text-fg placeholder:text-muted focus:border-muted focus:outline-none"
          />
          <span className="tabular-nums text-muted">
            {body.length}/{BODY_MAX}
          </span>
          <button
            type="submit"
            disabled={sending || !body.trim()}
            className="cursor-pointer border border-faint px-3 py-1 text-fg transition-colors hover:border-muted disabled:cursor-default disabled:text-muted"
          >
            {sending ? "pinning…" : "pin it"}
          </button>
        </div>
        {error && <p className="mt-2 text-left font-mono text-meta text-accent">{error}</p>}
      </form>

      <ul className="mt-3">
        {state === "loading" && (
          <li className="font-mono text-meta text-muted">reading the board…</li>
        )}
        {state === "ready" && messages.length === 0 && (
          <li className="text-muted">nothing pinned yet. you could be first.</li>
        )}
        {messages.map((m) => (
          <li key={m.id} className="border-t border-faint py-[calc(var(--gap)*0.7)]">
            <p className="text-left font-mono text-meta text-muted [hyphens:none]">
              {m.name} · {when(m.created_at)}
            </p>
            <p className="mt-1 whitespace-pre-line text-left [hyphens:none]">{m.body}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
