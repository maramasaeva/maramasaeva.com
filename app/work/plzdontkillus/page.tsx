import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "plzdontkillus security audit",
  description:
    "37 findings across an api, a frontend, dns and the infrastructure behind it. one critical, twelve high, all disclosed before publication.",
}

/* Severity is ordinal, so it gets a sequential encoding: one hue, light to
   dark, never a rainbow. Counts are labelled, so colour is never carrying the
   meaning on its own. */
const SEVERITY = [
  { label: "critical", count: 1, ink: 0.92 },
  { label: "high", count: 12, ink: 0.7 },
  { label: "medium", count: 8, ink: 0.5 },
  { label: "low", count: 5, ink: 0.32 },
  { label: "info", count: 11, ink: 0.18 },
]

const TOTAL = SEVERITY.reduce((n, s) => n + s.count, 0)

const FINDINGS = [
  "a chained attack combining csrf, stored xss, mass assignment and a javascript: uri",
  "three denial-of-service crash vectors against a single-threaded python server",
  "full infrastructure mapping: cloudflare to nginx to python http.server",
  "a write-only api with zero data leakage, which is a finding in the other direction",
  "250+ tests across five phases",
]

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-3">
      <span className="w-[4.5rem] shrink-0 font-mono text-meta text-muted">
        {k}
      </span>
      <span className="font-mono text-meta">{v}</span>
    </div>
  )
}

export default function Plzdontkillus() {
  return (
    <div className="flow-lg max-w-[34rem]">
      <div className="flow">
        <p className="font-mono text-meta text-muted">
          <Link href="/work" className="hover:text-fg">
            ← work
          </Link>
        </p>
        <h1 className="text-head">plzdontkillus security audit</h1>
        <p className="text-muted">
          i like pulling things apart to understand how they work. when i find
          something broken, i tell the people who built it. everything below was
          responsibly disclosed to the affected party before it was written up.
        </p>
      </div>

      <section className="flow">
        <h2 className="font-mono text-meta text-muted">the target</h2>
        <p>
          <a
            href="https://plzdontkillus.com"
            className="prose-link"
            target="_blank"
            rel="noreferrer"
          >
            plzdontkillus
          </a>{" "}
          is an ai safety creator residency run by aella and ronny fernandez at
          lightcone infrastructure: a month at lighthaven in berkeley for people
          making work about ai risk. i audited it in may 2026, about ten hours
          across five phases, and reported everything before publishing
          anything.
        </p>
        <p className="text-muted">
          i went to the residency two months later.
        </p>
      </section>

      <section className="flow">
        <h2 className="font-mono text-meta text-muted">what came back</h2>

        <div className="flex items-baseline gap-3">
          <span style={{ fontSize: "2.6rem", lineHeight: 1 }}>{TOTAL}</span>
          <span className="font-mono text-meta text-muted">
            findings, one critical
          </span>
        </div>

        {/* proportion at a glance; the numbers below carry the detail */}
        <div className="flex h-[6px] w-full gap-[2px]" aria-hidden>
          {SEVERITY.map((s, i) => (
            <div
              key={s.label}
              style={{
                flex: s.count,
                background: `color-mix(in srgb, var(--accent) ${s.ink * 100}%, transparent)`,
                borderTopLeftRadius: i === 0 ? 3 : 0,
                borderBottomLeftRadius: i === 0 ? 3 : 0,
                borderTopRightRadius: i === SEVERITY.length - 1 ? 3 : 0,
                borderBottomRightRadius: i === SEVERITY.length - 1 ? 3 : 0,
              }}
            />
          ))}
        </div>

        <ul className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-meta">
          {SEVERITY.map((s) => (
            <li key={s.label} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-[1px]"
                style={{
                  background: `color-mix(in srgb, var(--accent) ${s.ink * 100}%, transparent)`,
                }}
                aria-hidden
              />
              <span>{s.count}</span>
              <span className="text-muted">{s.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flow">
        <h2 className="font-mono text-meta text-muted">the interesting ones</h2>
        <ul className="space-y-1">
          {FINDINGS.map((f) => (
            <li key={f} className="flex gap-2">
              <span className="text-muted" aria-hidden>
                ·
              </span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flow">
        <h2 className="font-mono text-meta text-muted">scope</h2>
        <div className="space-y-1">
          <Meta k="surface" v="application api, static frontend, dns, osint" />
          <Meta k="stack" v="cloudflare, nginx, python http.server" />
          <Meta k="effort" v="~10 hours, five phases, 250+ tests" />
          <Meta k="status" v="disclosed, may 2026" />
        </div>
      </section>

      <section className="flow">
        <h2 className="font-mono text-meta text-muted">elsewhere</h2>
        <p className="text-muted">
          in 2025 i found authentication and authorisation flaws in the order
          management of an e-commerce platform, little wonderland, that let an
          order reach the database without payment. also disclosed.
        </p>
      </section>

      <p className="text-muted">
        if you want me to audit something, or you think i broke something of
        yours and want to talk about it, reach out. i don&apos;t do this to
        cause harm. i do it because understanding how systems fail is the first
        step to making them resilient.
      </p>
    </div>
  )
}
