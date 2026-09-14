"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function DeskLogin() {
  const [value, setValue] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (busy || !value) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/desk/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase: value }),
      })
      const d = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(d.error ?? "no")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "no")
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex max-w-xs flex-col gap-2 font-sans text-meta">
      <input
        id="desk-passphrase"
        type="password"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus
        autoComplete="current-password"
        placeholder="passphrase"
        aria-label="passphrase"
        className="border-b border-faint bg-transparent py-1 text-body text-fg placeholder:text-muted focus:border-muted focus:outline-none"
      />
      <button
        type="submit"
        disabled={busy || !value}
        className="self-start cursor-pointer border border-faint px-3 py-1 text-fg hover:border-muted disabled:cursor-default disabled:text-muted"
      >
        {busy ? "…" : "in"}
      </button>
      {error && <p className="text-accent">{error}</p>}
    </form>
  )
}
