import { notFound } from "next/navigation"
import { isDesk } from "@/lib/desk/auth"

export const dynamic = "force-dynamic"

export default async function RepliesPage() {
  if (!(await isDesk())) notFound()
  const queueUrl = process.env.PRIVATE_REPLY_QUEUE_URL || "http://127.0.0.1:3900/app"
  const remote = Boolean(process.env.PRIVATE_REPLY_QUEUE_URL)

  return (
    <section className="flow-lg max-w-[34rem]">
      <header className="flow">
        <p className="font-sans text-meta text-muted"><a href="/desk" className="hover:text-fg">dashboard</a> · private</p>
        <h1 className="text-head">reply queue</h1>
        <p className="text-muted">
          one place for the people waiting on you. every reply stays editable and nothing sends without your approval.
        </p>
      </header>

      <section className="flow border-t border-faint pt-[var(--gap)]">
        <a href={queueUrl} className="prose-link font-sans text-meta">
          open reply queue ↗
        </a>
        <p className="font-sans text-meta text-muted">
          {remote
            ? "protected by the private dashboard and the queue’s owner-only access layer."
            : "available on this Mac. remote access appears here after the owner-only queue address is configured."}
        </p>
      </section>

      <section className="flow border-t border-faint pt-[var(--gap)]">
        <h2 className="font-sans text-meta text-muted">always-on agent · later</h2>
        <p className="text-muted">
          the private agent workspace will live here. a separate public contact surface can accept messages without gaining access to this dashboard or your personal conversations.
        </p>
      </section>
    </section>
  )
}
