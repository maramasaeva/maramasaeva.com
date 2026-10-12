"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import ThemeToggle from "./ThemeToggle"
import {
  channels, channelNames, registers, normalise, defaultDraft, editDraft, mergeRemoteDraft,
  acknowledgeDraft, generatedDraft, sendAvailability, snapshot, sameReply, sendResult,
  type Channel, type Conversation, type Draft, type DraftMetadata, type Health,
  type Thread, type SendJob, type SendSnapshot,
} from "@/lib/dashboard/frontend"

type DraftResponse = { drafts?: Record<string, string>; metadata?: Record<string, DraftMetadata>; background?: { enabled?: boolean } }
class RequestError extends Error { constructor(message: string, public status: number) { super(message) } }
async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch("/api/dashboard/v1/" + path, {
    ...options, cache: "no-store", credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...options.headers },
    signal: options.signal || AbortSignal.timeout(path === "draft" ? 115000 : 30000),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new RequestError(body.error || "the messaging host could not be reached.", response.status)
  return body as T
}
const modules = [
  { id: "messages", label: "messages", icon: "↗" }, { id: "calendar", label: "calendar", icon: "▦" },
  { id: "notes", label: "notes & tasks", icon: "≡" }, { id: "visuals", label: "visualisations", icon: "◈" },
  { id: "images", label: "images", icon: "▧" },
]
function dateLabel(value: string | number | undefined) {
  if (!value) return ""
  const date = new Date(typeof value === "number" && value < 1e12 ? value * 1000 : value)
  return Number.isNaN(date.valueOf()) ? "" : date.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}
function Review({ reply, busy, onCancel, onApprove }: { reply: SendSnapshot; busy: boolean; onCancel: () => void; onApprove: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => { dialog.current?.showModal() }, [])
  return <dialog ref={dialog} className="send-review" onCancel={e => { e.preventDefault(); if (!busy) onCancel() }}>
    <p className="eyebrow">one message. your approval.</p><h2>send this reply?</h2>
    <dl><dt>conversation</dt><dd>{reply.name} · {channelNames[reply.channel]}</dd><dt>exact recipient</dt><dd className="recipient-value">{reply.to}</dd>{reply.subject && <><dt>subject</dt><dd>{reply.subject}</dd></>}</dl>
    <div className="review-text">{reply.text}</div><p className="desk-help">this sends only the message shown above. it cannot be recalled here.</p>
    <div className="desk-actions"><button className="desk-button secondary" disabled={busy} onClick={onCancel}>keep editing</button><button className="desk-button primary" disabled={busy} onClick={onApprove}>{busy ? "sending…" : "approve & send this message"}</button></div>
  </dialog>
}

export default function DeskWorkspace() {
  const [module, setModule] = useState("messages")
  const [items, setItems] = useState<Conversation[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [filter, setFilter] = useState<Channel | "all">("all")
  const [query, setQuery] = useState("")
  const [health, setHealth] = useState<Health | null>(null)
  const [metadata, setMetadata] = useState<Record<string, DraftMetadata>>({})
  const [background, setBackground] = useState(false)
  const [drafts, setDrafts] = useState<Record<string, Draft>>({})
  const [threads, setThreads] = useState<Record<string, Thread>>({})
  const [jobs, setJobs] = useState<Record<string, SendJob>>({})
  const [generating, setGenerating] = useState<Record<string, boolean>>({})
  const [draftErrors, setDraftErrors] = useState<Record<string, string>>({})
  const [threadErrors, setThreadErrors] = useState<Record<string, string>>({})
  const [connectorErrors, setConnectorErrors] = useState<Partial<Record<Channel, string>>>({})
  const [connection, setConnection] = useState("checking your private messaging host…")
  const [refreshing, setRefreshing] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [review, setReview] = useState<SendSnapshot | null>(null)
  const [notice, setNotice] = useState("")
  const [storageWarning, setStorageWarning] = useState(false)
  const draftRef = useRef<Record<string, Draft>>({})
  const itemsRef = useRef<Conversation[]>([])
  const jobsRef = useRef<Record<string, SendJob>>({})
  const selectedRef = useRef<string | null>(null)
  const healthRef = useRef<Health | null>(null)
  const remoteRef = useRef<DraftResponse>({})
  const editor = useRef<HTMLTextAreaElement>(null)
  const history = useRef<HTMLDivElement>(null)
  const syncing = useRef(new Set<string>())
  const refreshingRef = useRef(false)
  const mounted = useRef(false)
  const inFlightSend = useRef(false)
  const historyRequests = useRef(new Set<string>())
  const historyChecked = useRef(new Set<string>())
  const generationRequests = useRef(new Set<string>())

  const storeDrafts = useCallback((next: Record<string, Draft>) => {
    draftRef.current = next
    if (mounted.current) setDrafts(next)
    for (const [key, value] of Object.entries(next)) {
      try { localStorage.setItem("reply-queue:draft:" + key, JSON.stringify(value)) }
      catch { if (mounted.current) setStorageWarning(true) }
    }
  }, [])
  const storeJob = useCallback((key: string, job: SendJob) => {
    const next = { ...jobsRef.current, [key]: job }; jobsRef.current = next
    if (mounted.current) setJobs(next)
    try { localStorage.setItem("desk:delivery:" + key, JSON.stringify(job)) } catch { /* in-memory protection remains */ }
  }, [])
  const syncDraft = useCallback(async (key: string) => {
    const saved = draftRef.current[key]
    if (!saved?.dirty || syncing.current.has(key)) return
    syncing.current.add(key)
    try {
      await api("drafts", { method: "PUT", body: JSON.stringify({ key, text: saved.text, register: saved.register, intent: saved.intent }) })
      if (!mounted.current) return
      const current = draftRef.current[key]
      if (current) storeDrafts({ ...draftRef.current, [key]: acknowledgeDraft(current, saved.revision) })
      setDraftErrors(previous => { const next = { ...previous }; delete next[key]; return next })
    } catch (error) {
      if (mounted.current) setDraftErrors(previous => ({ ...previous, [key]: error instanceof Error ? error.message : "draft sync failed." }))
    } finally { syncing.current.delete(key) }
  }, [storeDrafts])

  const refresh = useCallback(async () => {
    if (refreshingRef.current) return
    refreshingRef.current = true; setRefreshing(true)
    try {
      const status = await api<Health>("health")
      if (!mounted.current) return
      healthRef.current = status; setHealth(status)
      const results = await Promise.allSettled(channels.map(async channel => {
        const inbox = await api<{ messages?: Record<string, unknown>[] }>("inbox/" + channel)
        return { channel, messages: inbox.messages || [] }
      }))
      const remote = await api<DraftResponse>("drafts").catch(() => null)
      if (!mounted.current) return
      let next = [...itemsRef.current]
      const errors: Partial<Record<Channel, string>> = {}
      results.forEach((result, index) => {
        if (result.status === "rejected") { errors[channels[index]] = result.reason?.message || "inbox unavailable"; return }
        const { channel, messages } = result.value
        next = next.map(item => item.channel === channel ? { ...item, unread: false } : item)
        for (const message of messages) {
          const item = normalise(message, channel)
          const old = next.findIndex(x => x.key === item.key)
          if (old < 0) next.push(item); else next[old] = item
        }
      })
      next.sort((a, b) => (Date.parse(b.receivedAt) || 0) - (Date.parse(a.receivedAt) || 0))
      itemsRef.current = next; setItems(next); setConnectorErrors(errors)
      if (remote) { remoteRef.current = remote; setMetadata(remote.metadata || {}); setBackground(Boolean(remote.background?.enabled)) }
      const book = { ...draftRef.current }
      for (const item of next) {
        if (!book[item.key]) {
          let local: Partial<Draft> | null = null
          try { local = JSON.parse(localStorage.getItem("reply-queue:draft:" + item.key) || "null") } catch { /* remote remains available */ }
          const base = defaultDraft(item)
          book[item.key] = local && typeof local.text === "string" ? { ...base, text: local.text,
            register: typeof local.register === "string" ? local.register : base.register,
            intent: typeof local.intent === "string" ? local.intent : "",
            to: typeof local.to === "string" && local.to ? local.to : base.to,
            subject: typeof local.subject === "string" ? local.subject : base.subject,
            revision: typeof local.revision === "number" ? local.revision : 0, dirty: local.dirty !== false } : base
          if (!jobsRef.current[item.key]) {
            try {
              const job = JSON.parse(localStorage.getItem("desk:delivery:" + item.key) || "null")
              if (job && typeof job.text === "string" && ["submitting", "queued", "sending", "running", "unknown", "sent", "failed"].includes(job.status)) {
                storeJob(item.key, ["submitting", "queued", "sending", "running"].includes(job.status) ? { ...job, status: "unknown", error: "a previous delivery is unconfirmed. check the conversation." } : job)
              }
            } catch { /* no remembered job */ }
          }
        }
        if (remote && !generationRequests.current.has(item.key)) book[item.key] = mergeRemoteDraft(book[item.key], remote.drafts?.[item.key], remote.metadata?.[item.key], selectedRef.current === item.key && document.activeElement?.closest(".draft-editor") !== null)
      }
      storeDrafts(book)
      setConnection("connected to your private host")
      setLoaded(true)
      for (const key of Object.keys(book)) if (book[key].dirty) void syncDraft(key)
    } catch (error) {
      if (!mounted.current) return
      healthRef.current = null; setHealth(null); setLoaded(true)
      setConnection(error instanceof Error ? error.message : "the private messaging host is unavailable.")
    } finally { refreshingRef.current = false; if (mounted.current) setRefreshing(false) }
  }, [storeDrafts, storeJob, syncDraft])

  useEffect(() => {
    mounted.current = true
    void refresh()
    const timer = setInterval(() => { if (document.visibilityState === "visible") void refresh() }, 15000)
    const online = () => void refresh()
    window.addEventListener("online", online); window.addEventListener("focus", online)
    return () => { mounted.current = false; clearInterval(timer); window.removeEventListener("online", online); window.removeEventListener("focus", online) }
  }, [refresh])

  useEffect(() => {
    const timer = setTimeout(() => { for (const [key, value] of Object.entries(drafts)) if (value.dirty) void syncDraft(key) }, 650)
    return () => clearTimeout(timer)
  }, [drafts, syncDraft])

  const readHistory = useCallback(async (item: Conversation, before?: number) => {
    const connector = healthRef.current?.connectors?.[item.channel]
    if (item.channel === "whatsapp" && (typeof connector !== "object" || connector.transport !== "headless")) {
      setThreadErrors(previous => ({ ...previous, [item.key]: "the whatsapp background connector must be connected to load history without opening another app." }))
      return
    }
    if (historyRequests.current.has(item.key)) return
    historyRequests.current.add(item.key)
    try {
      const query = new URLSearchParams({ chat: item.chat, limit: "80" })
      if (before) query.set("before", String(before))
      const thread = await api<Thread>("thread/" + item.channel + "?" + query)
      if (!mounted.current) return
      setThreads(previous => {
        if (!before) return { ...previous, [item.key]: thread }
        const old = previous[item.key]?.messages || [], older = thread.messages || []
        const all = [...older, ...old].filter((m, i, list) => list.findIndex(x => (x.id && m.id ? x.id === m.id : x.text === m.text && x.timestamp === m.timestamp && x.fromMe === m.fromMe)) === i)
        return { ...previous, [item.key]: { ...thread, messages: all } }
      })
      setThreadErrors(previous => { const next = { ...previous }; delete next[item.key]; return next })
      historyChecked.current.add(item.key)
    } catch (error) { if (mounted.current) setThreadErrors(previous => ({ ...previous, [item.key]: error instanceof Error ? error.message : "history unavailable." })) }
    finally { historyRequests.current.delete(item.key) }
  }, [])

  useEffect(() => {
    if (!selected) return
    const item = itemsRef.current.find(x => x.key === selected)
    if (!item) return
    void readHistory(item)
    const timer = setInterval(() => { if (document.visibilityState === "visible") void readHistory(item) }, 10000)
    return () => clearInterval(timer)
  }, [selected, readHistory])
  useEffect(() => { if (history.current && selected) history.current.scrollTop = history.current.scrollHeight }, [selected])
  useEffect(() => {
    const el = history.current
    if (el && el.scrollHeight - el.scrollTop - el.clientHeight < 160) el.scrollTop = el.scrollHeight
  }, [threads])

  function choose(key: string | null) { selectedRef.current = key; setSelected(key); setNotice("") }
  function change(fields: Partial<Pick<Draft, "text" | "register" | "intent" | "to" | "subject">>) {
    if (!selected || !draftRef.current[selected]) return
    storeDrafts({ ...draftRef.current, [selected]: editDraft(draftRef.current[selected], fields) })
  }
  async function redraft(item: Conversation) {
    if (generationRequests.current.has(item.key)) return
    const saved = draftRef.current[item.key]
    if (!saved) return
    if (saved.text.trim() && !window.confirm("replace this saved draft with a new suggestion? any edits you make while it generates will be kept.")) return
    generationRequests.current.add(item.key); setGenerating(previous => ({ ...previous, [item.key]: true }))
    try {
      const result = await api<{ status: string; text?: string; error?: string }>("draft", { method: "POST", body: JSON.stringify({ channel: item.channel, chat: item.chat, register: saved.register, intent: saved.intent }) })
      if (!mounted.current) return
      if (result.status !== "generated" || !result.text) throw new Error(result.error || "a draft provider is not connected.")
      const current = draftRef.current[item.key]
      storeDrafts({ ...draftRef.current, [item.key]: generatedDraft(current, saved.revision, result.text) })
      setNotice(current.revision === saved.revision ? "suggestion ready. read it, make it yours." : "your edits were kept while the suggestion generated.")
      await syncDraft(item.key)
    } catch (error) { if (mounted.current) setDraftErrors(previous => ({ ...previous, [item.key]: error instanceof Error ? error.message : "could not generate a draft." })) }
    finally { generationRequests.current.delete(item.key); if (mounted.current) setGenerating(previous => ({ ...previous, [item.key]: false })) }
  }
  async function approve(reply: SendSnapshot) {
    if (inFlightSend.current) return
    const item = itemsRef.current.find(x => x.key === reply.key), draft = draftRef.current[reply.key]
    if (!item || !draft || !sameReply(reply, snapshot(item, draft)) || !sendAvailability(item, draft, healthRef.current, jobsRef.current[reply.key]).ok) {
      setReview(null); setNotice("the reply or connection changed. review it again before sending."); return
    }
    inFlightSend.current = true
    let job: SendJob = { status: "submitting", text: reply.text, to: reply.to, subject: reply.subject }
    storeJob(reply.key, job)
    try {
      const result = await api<{ status?: string; error?: string; task?: { id?: string; status?: string; error?: string }; result?: { id?: string; status?: string; error?: string } }>("send", { method: "POST", headers: { "X-Reply-Queue-Approval": "manual" }, body: JSON.stringify({ channel: reply.channel, chat: reply.chat, to: reply.to, text: reply.text, subject: reply.subject }) })
      const task = result.task || result.result || result
      if (["queued", "sending", "running", "pending"].includes(task.status || "") && "id" in task && task.id) {
        job = { ...job, id: task.id, status: "queued" }; storeJob(reply.key, job)
        const deadline = Date.now() + 90000
        while (mounted.current && Date.now() < deadline) {
          await new Promise(resolve => setTimeout(resolve, 2000))
          const status = await api<{ status?: string; error?: string }>("send/tasks/" + encodeURIComponent(task.id), { signal: AbortSignal.timeout(10000) })
          if (["sent", "failed", "unknown"].includes(status.status || "")) { job = { ...job, ...sendResult(status) }; break }
        }
        if (job.status === "queued") job = { ...job, ...sendResult({ status: "unknown" }) }
      } else job = { ...job, ...sendResult(task) }
    } catch (error) {
      // A gateway timeout (502/504) may follow successful delivery. Never retry it automatically.
      const definiteRejection = error instanceof RequestError && error.status >= 400 && error.status < 500
      job = { ...job, status: definiteRejection ? "failed" : "unknown", error: definiteRejection ? error.message : "delivery could not be confirmed. check the history before retrying." }
    } finally {
      storeJob(reply.key, job); inFlightSend.current = false
      if (mounted.current) {
        setReview(null); setNotice(job.status === "sent" ? "send confirmed. your original draft is kept." : job.error || "delivery is not confirmed.")
        const item = itemsRef.current.find(x => x.key === reply.key); if (item) void readHistory(item)
      }
    }
  }
  async function signOut() {
    // Try to save pending edits before leaving; a failed save remains local.
    await Promise.all(Object.keys(draftRef.current).map(syncDraft))
    try { const response = await fetch("/api/desk/login", { method: "DELETE", credentials: "same-origin" }); if (response.ok) window.location.replace("/desk"); else setNotice("could not sign out. try again.") }
    catch { setNotice("could not sign out. check your connection.") }
  }
  const current = items.find(x => x.key === selected)
  const draft = current ? drafts[current.key] : undefined
  const thread = current ? threads[current.key] : undefined
  const meta = current ? metadata[current.key] : undefined
  const job = current ? jobs[current.key] : undefined
  const availability = current && draft ? sendAvailability(current, draft, health, job) : { ok: false, reason: "" }
  const visible = items.filter(x => (filter === "all" || x.channel === filter) && (x.name + " " + x.text).toLowerCase().includes(query.toLowerCase()))
  const messages = thread?.messages?.length ? thread.messages : current?.text ? [{ text: current.text, fromMe: current.fromMe, timestamp: current.receivedAt }] : []
  const unavailable = modules.find(x => x.id === module)
  const counts = channels.map(channel => items.filter(x => x.channel === channel).length)
  const status = current && draft ? draft.dirty ? "edited · syncing" : generating[current.key] || meta?.status === "generating" ? "drafting in your voice" : meta?.stale ? "new context · draft kept" : meta?.error ? "draft needs attention" : draft.text ? meta?.userEdited ? "your edited draft" : "draft ready" : meta?.status === "waiting-provider" ? "draft model not connected" : meta?.status === "rate-limited" ? "queued · hourly limit" : background ? "queued in the background" : "write a reply or prepare a draft" : ""
  return <div className="desk-workspace">
    <aside className="desk-sidebar"><a href="/" className="desk-brand">m<span>mara’s desk</span></a><p className="eyebrow">a place to gather things</p><nav aria-label="workspace modules">{modules.map(x => <button key={x.id} onClick={() => setModule(x.id)} aria-current={module === x.id ? "page" : undefined}><span aria-hidden>{x.icon}</span>{x.label}{x.id !== "messages" && <small>later</small>}</button>)}</nav><div className="desk-sidebar-bottom"><a href="/desk/x">x public replies ↗</a><a href="/">back to the website ↗</a><div><ThemeToggle /><button onClick={signOut}>sign out</button></div></div></aside>
    <main className="desk-main"><header className="desk-topbar"><div><span className="status-dot" data-connected={Boolean(health)} /> <span>{health ? "private workspace" : "connection unavailable"}</span></div><button className="desk-text-button" onClick={() => void refresh()} disabled={refreshing}>{refreshing ? "checking…" : "refresh ↻"}</button></header>
      <section className="desk-heading"><p className="eyebrow">your desk / {unavailable?.label}</p><h1>{module === "messages" ? <>a little room<br />to <em>answer people.</em></> : unavailable?.label}</h1><p>{module === "messages" ? "your conversations, a draft in your voice, and the time to make it yours." : "this part of your desk is not connected yet."}</p></section>
      {module !== "messages" ? <section className="desk-unavailable"><span className="unavailable-icon" aria-hidden>{unavailable?.icon}</span><h2>room for later.</h2><p>{module === "calendar" ? "google sign-in grants identity access only. calendar consent and integration are still pending." : module === "notes" ? "obsidian-linked tasks and notes are not connected. no vault files are being read here." : module === "visuals" ? "visualisations will appear here when a data source is connected." : "your image workspace is not connected. no images or files have been accessed."}</p><button className="desk-button secondary" onClick={() => setModule("messages")}>back to messages →</button></section> : <>
      <div className="desk-connection" role="status">{connection}<span>{health?.sendEnabled ? "every send needs your approval" : "sending paused"}</span></div>
      <div className={`messaging-grid ${current ? "conversation-open" : ""}`}>
        <section className="inbox-panel"><div className="panel-heading"><h2>conversations</h2><span>{items.length}</span></div><label className="desk-search"><span className="sr-only">search conversations</span><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="find someone…" /></label><div className="channel-filters" role="group" aria-label="filter messaging channels"><button aria-pressed={filter === "all"} onClick={() => setFilter("all")}>all</button>{channels.map((channel, i) => <button key={channel} aria-pressed={filter === channel} onClick={() => setFilter(channel)}>{channelNames[channel]} <span>{counts[i]}</span></button>)}</div>
        <div className="inbox-list">{visible.length ? visible.map(item => <button key={item.key} className="conversation-item" aria-pressed={selected === item.key} onClick={() => choose(item.key)}><div className="conversation-line"><span className="conversation-name">{item.name}</span><time>{dateLabel(item.receivedAt)}</time></div><p>{item.text || "attachment"}</p><div className="conversation-line conversation-labels"><span>{channelNames[item.channel]}{item.unread ? " · unread" : ""}</span><span>{drafts[item.key]?.dirty ? "edited · syncing" : drafts[item.key]?.text ? "draft saved" : metadata[item.key]?.status === "generating" ? "drafting…" : "awaiting draft"}</span></div></button>) : <div className="desk-empty"><span aria-hidden>↗</span><h3>{loaded ? health ? "nothing in this view." : "waiting for a connection." : "checking your inbox…"}</h3><p>{loaded && health ? "conversations appear here when they sync. try another filter or search." : "your real conversations will appear when the private messaging host is available."}</p></div>}</div></section>
        <section className="conversation-panel">{current && draft ? <><div className="panel-heading"><div><button className="mobile-back desk-text-button" onClick={() => choose(null)}>← conversations</button><h2>{current.name}</h2><span>{channelNames[current.channel]} · {current.chat}</span></div><button className="desk-text-button" onClick={() => void readHistory(current)}>refresh history ↻</button></div>
          <div className="thread-caption">{thread?.messages?.length ? `${thread.messages.length} messages · both sides of the conversation` : ["queued", "pending", "running"].includes(thread?.status || "") ? "loading conversation history…" : "latest preview · full history has not loaded"}</div>
          <div className="desk-thread" ref={history} role="log" aria-label={`conversation with ${current.name}`}>
            {thread?.messages?.length ? <button className="desk-text-button older-messages" onClick={() => { const first = thread.messages?.[0]; const timestamp = Number(first?.timestamp) || Date.parse(String(first?.timestamp || first?.receivedAt)); if (timestamp) void readHistory(current, timestamp > 1e12 ? Math.floor(timestamp / 1000) : timestamp) }}>load earlier messages ↑</button> : null}
            {messages.map((message, index) => <div key={message.id || index} className={`message-bubble ${message.fromMe ? "from-me" : ""}`}><p>{message.text || "[attachment]"}</p><small>{message.fromMe ? "you" : message.sender || message.from || current.name} · {dateLabel(message.timestamp || message.receivedAt)}</small></div>)}
            {threadErrors[current.key] && <p className="desk-error">{threadErrors[current.key]}</p>}
          </div>
          <div className="draft-editor"><div className="draft-heading"><h3>your reply</h3><span role="status">{status}</span></div>
            <div className="draft-preferences"><label>language & register<select value={draft.register} onChange={e => change({ register: e.target.value })}>{!registers.some(([id]) => id === draft.register) && <option value={draft.register}>{draft.register}</option>}{registers.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label><label>what would you like to say?<input maxLength={800} value={draft.intent} onChange={e => change({ intent: e.target.value })} placeholder="a thought, a question, an intention…" /></label></div>
            <textarea ref={editor} value={draft.text} onChange={e => change({ text: e.target.value })} aria-label="editable reply draft" placeholder="a suggestion will appear when the background worker prepares it. you can also write here." />
            <details className="recipient-details"><summary>recipient · {draft.to || "not supplied"}</summary><label>exact recipient<input value={draft.to} onChange={e => change({ to: e.target.value })} /></label>{current.channel === "gmail" && <label>subject<input value={draft.subject} onChange={e => change({ subject: e.target.value })} /></label>}</details>
            {meta?.stale && <p className="desk-help">new messages arrived. your saved draft has been kept; review the new context.</p>}
            {draftErrors[current.key] && <p className="desk-error" role="status">{draftErrors[current.key]} your local edits are kept.</p>}
            {storageWarning && <p className="desk-error">this browser cannot store drafts locally. keep this page open until your edits have synced.</p>}
            <div className="desk-actions"><button className="desk-button primary" disabled={!availability.ok || Boolean(generating[current.key])} onClick={() => setReview(snapshot(current, draft))}>review & send ↗</button><button className="desk-button secondary" disabled={Boolean(generating[current.key]) || meta?.status === "generating" || !health} onClick={() => void redraft(current)}>{generating[current.key] || meta?.status === "generating" ? "preparing…" : draft.text ? "redraft" : "prepare a reply"}</button><button className="desk-text-button" onClick={() => { void syncDraft(current.key); choose(null) }}>reply later</button></div>
            <p className="desk-help">{availability.reason}</p>
            {job?.status === "unknown" && <div className="delivery-unknown"><p>{job.error}</p><button className="desk-button secondary" onClick={() => { if (!historyChecked.current.has(current.key)) { setNotice("refresh and inspect this conversation’s history first."); return } if (window.confirm("have you checked the conversation and confirmed that this exact reply was NOT delivered?")) storeJob(current.key, { ...job, status: "failed", error: "you confirmed the reply was not delivered. a new exact-message review is required." }) }}>i checked history: it did not send</button></div>}
            {job?.status === "sent" && <p className="desk-help">delivery confirmed. the original draft is kept.</p>}
          </div></> : <div className="desk-empty select-conversation"><span aria-hidden>↗</span><h2>one person at a time.</h2><p>choose a conversation to read its history and make the draft yours.</p><p className="desk-help">nothing sends automatically.</p></div>}</section>
      </div>
      <details className="connector-details"><summary>connections & background drafts <span>{background ? "worker enabled" : "worker not confirmed"}</span></summary><div className="connector-grid">{channels.map(channel => {
        const state = health?.connectors?.[channel], connector = typeof state === "object" ? state : null
        return <div key={channel}><h3>{channelNames[channel]}</h3><p>{typeof state === "string" ? state : connector?.state || connector?.status || (connector?.connected ? "connected" : "not connected")}</p>{connector?.error && <p>{connector.error}</p>}{connectorErrors[channel] && <p>{connectorErrors[channel]}</p>}{channel === "signal" && <p>{connector?.historyNotice || "only messages collected after linking are available. earlier phone history is not imported."}</p>}{channel === "gmail" && <p>gmail consent and account linking are separate from google sign-in.</p>}{channel === "x" && <p>legacy dms only. encrypted x chat is not connected here.</p>}{connector?.coverage?.complete === false && <p>sync is incomplete; more conversations may still arrive.</p>}</div>
      })}</div><p className="desk-help">calendar, obsidian, visualisations and images are not connected. account setup is handled privately on the background host.</p></details>
      </>}
      {notice && <p className="desk-notice" role="status">{notice}<button onClick={() => setNotice("")} aria-label="dismiss notice">×</button></p>}
    </main>{review && <Review reply={review} busy={Boolean(jobs[review.key] && ["submitting", "queued", "sending", "running"].includes(jobs[review.key].status))} onCancel={() => setReview(null)} onApprove={() => void approve(review)} />}
  </div>
}
