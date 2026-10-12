export const channels = ["whatsapp", "signal", "imessage", "gmail", "x"] as const
export type Channel = typeof channels[number]
export const channelNames: Record<Channel, string> = { whatsapp: "whatsapp", signal: "signal", imessage: "imessage", gmail: "gmail", x: "x" }
export type Conversation = { key: string; chat: string; channel: Channel; name: string; text: string; to: string; subject: string; receivedAt: string; fromMe: boolean; unread: boolean }
export type Message = { id?: string; text?: string; fromMe?: boolean; sender?: string; from?: string; timestamp?: string | number; receivedAt?: string }
export type Thread = { messages?: Message[]; status?: string; error?: string; hasMore?: boolean }
export type Connector = { state?: string; status?: string; connected?: boolean; transport?: string; sendEnabled?: boolean; configured?: boolean; tokenStored?: boolean; allowedRecipients?: string[]; error?: string; historyNotice?: string; coverage?: { complete?: boolean }; linked?: boolean; messageCount?: number }
export type Health = { sendEnabled?: boolean; connectors?: Partial<Record<Channel, Connector | string>> }
export type DraftMetadata = { register?: string; intent?: string; status?: string; userEdited?: boolean; stale?: boolean; error?: string; contextScope?: string }
export type Draft = { text: string; register: string; intent: string; to: string; subject: string; revision: number; dirty: boolean }
export type SendSnapshot = { key: string; name: string; channel: Channel; chat: string; to: string; text: string; subject: string }
export type SendJob = { status: "submitting" | "queued" | "sending" | "running" | "sent" | "failed" | "unknown"; id?: string; text: string; to: string; subject: string; error?: string }
export const registers = [
  ["english-peer", "english · personal / peer"], ["english-short", "english · very short"],
  ["flemish-close", "flemish · close"], ["dutch-family", "dutch · family"],
  ["work", "work message"], ["mail", "email"],
] as const

export function normalise(message: Record<string, unknown>, channel: Channel): Conversation {
  const name = String(message.from || message.sender || message.sourceName || message.source || "unknown sender")
  const chat = String(message.threadId || message.chatId || message.jid || message.chat || name)
  return { key: channel + ":" + chat, chat, channel, name, text: String(message.text || message.snippet || ""),
    to: String(message.to || message.recipient || message.phone || (["signal", "imessage"].includes(channel) ? name : "")),
    subject: String(message.subject || ""), receivedAt: String(message.receivedAt || message.timestamp || ""),
    fromMe: message.fromMe === true, unread: message.unread !== false }
}
export function defaultDraft(item: Conversation): Draft {
  const dutch = item.text.toLowerCase().match(/\b(?:ik|jij|gij|ge|het|een|niet|nie|hoe|wat|kunnen|kun|heb|met|maar|morgen|wanneer)\b/g) || []
  return { text: "", to: item.to, subject: item.subject, register: item.channel === "gmail" ? "mail" : dutch.length >= 2 ? "flemish-close" : "english-peer", intent: "", revision: 0, dirty: false }
}
export function mergeRemoteDraft(current: Draft, text: string | undefined, metadata?: DraftMetadata, focused = false): Draft {
  if (current.dirty || focused) return current
  return { ...current, text: text === undefined ? current.text : text,
    register: metadata?.register || current.register, intent: metadata?.intent ?? current.intent }
}
export function editDraft(current: Draft, fields: Partial<Pick<Draft, "text" | "register" | "intent" | "to" | "subject">>): Draft {
  return { ...current, ...fields, revision: current.revision + 1, dirty: true }
}
export function acknowledgeDraft(current: Draft, savedRevision: number): Draft {
  return current.revision === savedRevision ? { ...current, dirty: false } : current
}
export function generatedDraft(current: Draft, startedAtRevision: number, text: string): Draft {
  return current.revision === startedAtRevision ? { ...current, text, revision: current.revision + 1, dirty: true } : { ...current, dirty: true }
}
const phone = (v: string) => v.replace(/\D/g, "").replace(/^00/, "").replace(/^320(?=\d{8,}$)/, "32")
export function sendAvailability(item: Conversation, draft: Draft, health: Health | null, job?: SendJob): { ok: boolean; reason: string } {
  if (!health?.sendEnabled) return { ok: false, reason: "sending is paused. your draft stays saved." }
  const value = health.connectors?.[item.channel]
  const connector = typeof value === "object" ? value : null
  if (!connector || connector.sendEnabled === false) return { ok: false, reason: "sending is unavailable for this connector." }
  if (item.channel === "whatsapp" && (connector.transport !== "headless" || !["headless-connected", "connected"].includes(connector.state || ""))) return { ok: false, reason: "the whatsapp background connector is offline." }
  if (["gmail", "x"].includes(item.channel) && (!connector.configured || !connector.tokenStored)) return { ok: false, reason: "this account is not connected for sending." }
  if (!draft.to.trim() || !draft.text.trim()) return { ok: false, reason: "add a recipient and a reply before reviewing." }
  if (job && ["submitting", "queued", "sending", "running", "unknown"].includes(job.status)) return { ok: false, reason: job.status === "unknown" ? "delivery is unknown. check the history before any retry." : "your approved reply is awaiting delivery confirmation." }
  if (job?.status === "sent" && job.to === draft.to.trim() && job.text === draft.text.trim() && job.subject === draft.subject) return { ok: false, reason: "this exact reply has already been sent." }
  if (connector.allowedRecipients?.length) {
    const canonical = item.channel === "gmail" ? (v: string) => v.toLowerCase() : item.channel === "x" ? (v: string) => v.toLowerCase().replace(/^@/, "") : phone
    if (!connector.allowedRecipients.some(to => canonical(to) === canonical(draft.to.trim()))) return { ok: false, reason: "test mode: this recipient is not on the approved list." }
  }
  return { ok: true, reason: "review the exact recipient and message. approval sends one reply." }
}
export function snapshot(item: Conversation, draft: Draft): SendSnapshot {
  return { key: item.key, name: item.name, channel: item.channel, chat: item.chat, to: draft.to.trim(), text: draft.text.trim(), subject: draft.subject }
}
export function sameReply(a: SendSnapshot, b: SendSnapshot): boolean {
  return a.key === b.key && a.chat === b.chat && a.channel === b.channel && a.to === b.to && a.text === b.text && a.subject === b.subject
}
export function sendResult(data: { status?: string; error?: string }): Pick<SendJob, "status" | "error"> {
  if (data.status === "sent") return { status: "sent" }
  if (data.status === "failed") return { status: "failed", error: data.error || "the connector could not send this reply." }
  if (data.status === "unknown") return { status: "unknown", error: "delivery could not be confirmed. check the conversation before retrying." }
  return { status: "unknown", error: "delivery has not been confirmed. check the conversation before retrying." }
}
