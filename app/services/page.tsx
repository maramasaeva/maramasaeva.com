import type { Metadata } from "next"

import { SITE_NAME, SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  title: "work with me",
  description:
    "Remote software and AI engineering: product systems, integrations, creative tooling, and evaluation work.",
  alternates: { canonical: `${SITE_URL}/services` },
  openGraph: {
    title: `work with ${SITE_NAME}`,
    description:
      "Remote software and AI engineering: product systems, integrations, creative tooling, and evaluation work.",
    url: `${SITE_URL}/services`,
  },
}

const work = [
  {
    title: "software systems and integrations",
    copy: "I build the practical layer around an idea: product features, APIs, data flows, agent and MCP integrations, deployment, and the interfaces people actually use.",
  },
  {
    title: "AI production workflows",
    copy: "I turn generative models into reliable systems. For Wibra’s personalised-video campaign, I designed and built the complete technical workflow that produced more than 800 individual videos.",
  },
  {
    title: "creative and consumer AI products",
    copy: "I work across the stack when the product calls for it. My work includes Inku’s brand-native visual engine and Kaios’s browser audio, realtime infrastructure, and generative-music tooling.",
  },
  {
    title: "evaluation and research software",
    copy: "I build tools that make model behaviour inspectable: test harnesses, scoring and parsing pipelines, research workflows, and clear outputs for technical and non-technical teams.",
  },
]

const proof = [
  {
    label: "Inku",
    href: "https://inku.tech/",
    text: "brand-native visual engine and creative automation product",
  },
  {
    label: "Wibra × Cartel",
    href: "https://cartel.agency/nl/insights/zo-bezorgden-we-800-wibra-fans-een-gepersonaliseerde-video-met-ai",
    text: "800+ personalised-video workflow",
  },
  {
    label: "Kaios editor",
    href: "https://kaios-editor.vercel.app/",
    text: "browser-based creative tooling",
  },
  {
    label: "FOC MCP servers",
    href: "https://foc-mcp-servers.vercel.app/",
    text: "MCP tools for business and agency workflows",
  },
  {
    label: "writing on model evaluation",
    href: "https://messinecessity.substack.com/p/trying-to-make-a-model-do-the-wrong",
    text: "a candid technical write-up on evaluation work",
  },
]

export default function ServicesPage() {
  return (
    <main className="flow-lg">
      <header className="flow">
        <p className="font-sans text-meta text-muted">remote, worldwide · available now</p>
        <h1 className="text-head">work with me</h1>
        <p>
          I&apos;m Mara Masaeva, a full-stack software and AI engineer. I help teams
          take ambitious ideas from prototype to a working, maintained system.
        </p>
        <p>
          I take on remote projects and embedded contracts. The best starting point
          is usually a focused build, integration, or technical discovery that leaves
          your team with a concrete result.
        </p>
        <p>
          <a
            href="mailto:maramasaeva@gmail.com?subject=Project%20enquiry"
            className="prose-link"
          >
            Tell me what you&apos;re building →
          </a>
        </p>
      </header>

      <section>
        <h2 className="text-head mb-4">where I help</h2>
        <div className="flow">
          {work.map((item) => (
            <article key={item.title} className="flow">
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-head mb-4">technical range</h2>
        <p>
          TypeScript and Python · web products and APIs · LLM and agent workflows ·
          MCP · realtime systems · generative image, audio, and video pipelines ·
          evaluation harnesses · cloud deployment
        </p>
      </section>

      <section>
        <h2 className="text-head mb-4">selected work</h2>
        <ul className="flow">
          {proof.map((item) => (
            <li key={item.href}>
              <a href={item.href} className="prose-link" target="_blank" rel="noreferrer">
                {item.label}
              </a>{" "}
              <span className="font-sans text-meta text-muted">· {item.text}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flow">
        <h2 className="text-head">starting a project</h2>
        <p>
          My starting rate is €100/hour excluding VAT, or €800 for an eight-hour day.
          For a defined outcome, I&apos;ll quote a fixed scope after we agree on the
          inputs, acceptance criteria, and timeline.
        </p>
        <p>
          Send a short note with the problem, your team, and the timing. I&apos;ll reply
          with a direct view on fit and the most useful first step.
        </p>
        <p>
          <a
            href="mailto:maramasaeva@gmail.com?subject=Project%20enquiry"
            className="prose-link"
          >
            maramasaeva@gmail.com
          </a>
        </p>
      </section>
    </main>
  )
}
