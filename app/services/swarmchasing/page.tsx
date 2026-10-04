import type { Metadata } from "next"
import Link from "next/link"

import { SITE_NAME, SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  title: "swarmchasing",
  description:
    "technical investigation of unusual agent activity: trace reconstruction, baselines, instrumentation, and evidence-led reporting.",
  alternates: { canonical: SITE_URL + "/services/swarmchasing" },
  openGraph: {
    title: "swarmchasing · " + SITE_NAME,
    description:
      "technical investigation of unusual agent activity: trace reconstruction, baselines, instrumentation, and evidence-led reporting.",
    url: SITE_URL + "/services/swarmchasing",
  },
}

const work = [
  {
    title: "reconstruct what happened",
    copy: "i turn public traces and privacy-scrubbed operator logs into a timeline: what was observed, where it came from, and what joins are actually justified.",
  },
  {
    title: "measure before naming",
    copy: "a busy service proves nothing. i compare a suspected pattern with its own history and with controls, then keep the null results in the report too.",
  },
  {
    title: "make the next case easier",
    copy: "i can design the small things that make later investigation possible: event schemas, read and write telemetry, retention rules, pseudonymisation, and an operator-facing tripwire.",
  },
  {
    title: "leave a record somebody else can check",
    copy: "the result is a technical account of the trace, method, baselines, confidence, and limits. claims stay tied to their evidence grade.",
  },
]

export default function SwarmchasingPage() {
  return (
    <main className="flow-lg">
      <header className="flow">
        <p className="font-sans text-meta text-muted">a technical investigation service</p>
        <h1 className="text-head">swarmchasing</h1>
        <p>
          sometimes a public log, a queue, a wiki, or a scanner starts doing
          something odd. perhaps activity appears in bursts. perhaps many new
          accounts settle on the same strange convention. perhaps an agent
          system has found a use for your service that you did not design.
        </p>
        <p>
          i investigate that kind of event without skipping from pattern to
          story. the work begins with the traces you can lawfully inspect and
          ends with a report that distinguishes observation, inference, and
          uncertainty.
        </p>
        <p>
          <a
            href="mailto:maramasaeva@gmail.com?subject=swarmchasing%20enquiry"
            className="prose-link"
          >
            tell me what you&apos;re seeing →
          </a>
        </p>
      </header>

      <section>
        <h2 className="text-head mb-4">the work</h2>
        <div className="flow">
          {work.map((item) => (
            <article key={item.title} className="flow">
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="flow">
        <h2 className="text-head">how i approach it</h2>
        <p>
          this work comes out of murmuration, my pre-alpha research build for
          studying coordinated agent behaviour in public records and
          instrumented surfaces. its methods include stream ingestion,
          temporal baselines, change-point and graph analysis, canary design,
          pseudonymised event handling, and reproducible evaluation.
        </p>
        <p>
          the current public work lives at{" "}
          <Link href="/observatory" className="prose-link">
            maramasaeva.com/observatory
          </Link>
          .
        </p>
        <p>
          the bar for a claim rises with the claim. timing alone does not prove
          coordination. text style alone does not identify an agent. naming an
          operator needs converging evidence and a disclosure process. those
          constraints are part of the work, not fine print.
        </p>
      </section>

      <section className="flow">
        <h2 className="text-head">a useful first engagement</h2>
        <p>
          start with a short, fixed investigation: one surface, one question,
          the records you are allowed to share, and a decision about whether
          monitoring or a deeper audit is worth doing.
        </p>
        <p>
          <Link href="/services" className="prose-link">
            see my other services
          </Link>
        </p>
      </section>
    </main>
  )
}
