import test from "node:test"
import assert from "node:assert/strict"
import { normalise, defaultDraft, editDraft, acknowledgeDraft, generatedDraft, mergeRemoteDraft, sendAvailability, snapshot, sameReply, sendResult, messageTime, mergeMessages } from "./frontend.ts"
import type { Health, SendJob } from "./frontend.ts"

// Synthetic fixtures live only in tests; the workspace never supplies demo conversations.
const item = normalise({ from: "test peer", threadId: "test-chat", recipient: "+32470000000", text: "hello" }, "whatsapp")
const health: Health = { sendEnabled: true, connectors: { whatsapp: { transport: "headless", state: "headless-connected", sendEnabled: true } } }
const draft = { ...defaultDraft(item), text: "test reply" }

test("unsynced edits and writing preferences survive background polling", () => {
  const edited = editDraft(draft, { text: "my edit", register: "flemish-close", intent: "ask when" })
  assert.equal(mergeRemoteDraft(edited, "background suggestion", { register: "mail" }), edited)
  assert.equal(mergeRemoteDraft(draft, "background suggestion", undefined, true), draft)
  const synced = mergeRemoteDraft(draft, "new suggestion", { register: "mail", intent: "follow up" })
  assert.equal(synced.text, "new suggestion")
  assert.equal(synced.register, "mail")
  assert.equal(synced.intent, "follow up")
})
test("a save acknowledgement cannot mark a newer edit as synced", () => {
  const first = editDraft(draft, { text: "first" })
  const second = editDraft(first, { text: "second" })
  assert.equal(acknowledgeDraft(second, first.revision).dirty, true)
  assert.equal(acknowledgeDraft(second, second.revision).dirty, false)
})
test("a slow poll cannot roll back an edit saved during that request", () => {
  const start = draft
  const edited = acknowledgeDraft(editDraft(start, { text: "newer saved edit" }), start.revision + 1)
  assert.equal(mergeRemoteDraft(edited, "old server response", undefined, false, start), edited)
})
test("edits during generation win even if those edits were already synced", () => {
  const start = draft
  const edited = acknowledgeDraft(editDraft(start, { text: "keep this", register: "work" }), start.revision + 1)
  const kept = generatedDraft(edited, start.revision, "late generated text")
  assert.equal(kept.text, "keep this")
  assert.equal(kept.register, "work")
  assert.equal(kept.dirty, true)
  assert.equal(generatedDraft(start, start.revision, "new suggestion").text, "new suggestion")
})
test("sending requires a connected background worker, content, and allowed recipient", () => {
  assert.equal(sendAvailability(item, draft, health).ok, true)
  assert.equal(sendAvailability(item, draft, null).ok, false)
  assert.equal(sendAvailability(item, { ...draft, text: "" }, health).ok, false)
  assert.equal(sendAvailability(item, draft, { sendEnabled: true, connectors: { whatsapp: { transport: "extension", state: "connected" } } }).ok, false)
  const restricted: Health = { ...health, connectors: { whatsapp: { ...health.connectors!.whatsapp as object, allowedRecipients: ["+32471111111"] } } }
  assert.equal(sendAvailability(item, draft, restricted).ok, false)
  restricted.connectors!.whatsapp = { ...health.connectors!.whatsapp as object, allowedRecipients: ["0032470000000"] }
  assert.equal(sendAvailability(item, draft, restricted).ok, true)
})
test("approval snapshots are exact and invalidate on text, recipient, subject, or conversation changes", () => {
  const approved = snapshot(item, draft)
  assert.equal(sameReply(approved, snapshot(item, draft)), true)
  for (const change of [{ text: "changed" }, { to: "+32471111111" }, { subject: "changed" }]) assert.equal(sameReply(approved, snapshot(item, { ...draft, ...change })), false)
  assert.equal(sameReply(approved, snapshot({ ...item, chat: "different", key: "whatsapp:different" }, draft)), false)
})
test("unknown delivery and in-flight jobs block retries; confirmed sends block duplicates", () => {
  const job: SendJob = { status: "unknown", text: draft.text, to: draft.to, subject: draft.subject }
  for (const status of ["unknown", "submitting", "queued", "running", "sending", "sent"] as const) assert.equal(sendAvailability(item, draft, health, { ...job, status }).ok, false)
  assert.equal(sendAvailability(item, { ...draft, text: "a different reply" }, health, { ...job, status: "sent" }).ok, true)
  assert.equal(sendResult({}).status, "unknown")
  assert.equal(sendResult({ status: "queued" }).status, "unknown")
  assert.equal(sendResult({ status: "sent" }).status, "sent")
})
test("conversation keys distinguish people with the same display name and messaging channels", () => {
  assert.notEqual(normalise({ from: "same name", threadId: "one" }, "signal").key, normalise({ from: "same name", threadId: "two" }, "signal").key)
  assert.notEqual(normalise({ threadId: "one" }, "signal").key, normalise({ threadId: "one" }, "whatsapp").key)
})
test("history keeps older pages and both sides when live updates arrive", () => {
  const earlier = { id: "earlier", text: "older", fromMe: false, timestamp: 1700000000000 }
  const mine = { id: "mine", text: "my reply", fromMe: true, timestamp: 1700000001000 }
  const latest = { id: "latest", text: "new", fromMe: false, timestamp: 1700000002000 }
  const merged = mergeMessages([mine], [earlier, mine, latest])
  assert.deepEqual(merged.map(m => m.id), ["earlier", "mine", "latest"])
  assert.equal(merged[1].fromMe, true)
  assert.deepEqual(mergeMessages(merged, [latest]), merged)
  assert.equal(messageTime("1700000000000"), 1700000000000)
  assert.equal(messageTime(1700000000), 1700000000000)
  assert.equal(messageTime("2023-11-14T22:13:20.000Z"), 1700000000000)
})
