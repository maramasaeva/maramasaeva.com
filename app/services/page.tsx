import type { Metadata } from "next"

import { SITE_NAME, SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  title: "services",
  description:
    "remote software and agentic engineering: product systems, integrations, creative tooling, and evaluation work.",
  alternates: { canonical: SITE_URL + "/services" },
  openGraph: {
    title: "services · " + SITE_NAME,
    description:
      "remote software and agentic engineering: product systems, integrations, creative tooling, and evaluation work.",
    url: SITE_URL + "/services",
  },
}

const services = [
  {
    title: "agentic engineering",
    copy: "i build production systems around coding agents and language models: agent loops, tool use, custom mcp servers, integrations, evals, guardrails, and the operational software around them.",
  },
  {
    title: "software systems and integrations",
    copy: "i build the practical layer around an idea: product features, apis, data flows, authentication, deployment, and the interfaces people actually use.",
  },
  {
    title: "ai production workflows",
    copy: "i turn generative models into reliable systems. for wibra’s personalised-video campaign, i designed and built the complete technical workflow that produced more than 800 individual videos.",
  },
  {
    title: "creative and consumer ai products",
    copy: "i work across the stack when the product calls for it. my work includes inku’s brand-native visual engine and kaios’s browser audio, realtime infrastructure, and generative-music tooling.",
  },
  {
    title: "evaluation and research software",
    copy: "i build tools that make model behaviour inspectable: test harnesses, scoring and parsing pipelines, research workflows, and clear outputs for technical and non-technical teams.",
  },
]

const capabilities = [
  {
    title: "agentic engineering",
    items:
      "claude code · codex · cursor · agent loops · multi-agent workflows · model context protocol (mcp) · a2a · custom tool schemas · tool calling · structured outputs · oauth and jwt",
  },
  {
    title: "language-model systems",
    items:
      "openai · anthropic · google genai · inspect ai · evaluation harnesses · scenario design · scorers · parsers · dataset pipelines · model-behaviour analysis",
  },
  {
    title: "application engineering",
    items:
      "typescript · python · node.js · react · next.js · vite · tailwind · rest apis · webhooks · cli tools · html and css",
  },
  {
    title: "data and realtime systems",
    items:
      "postgres · supabase · sqlalchemy · websockets · server-sent events · httpx · event-driven workflows · network analysis · scikit-learn",
  },
  {
    title: "generative media",
    items:
      "image, video, and audio pipelines · flux · dreambooth · lora · hugging face · stable audio · tone.js · web audio · three.js",
  },
  {
    title: "infrastructure and delivery",
    items:
      "docker · azure container apps · vercel · github actions · ci/cd · cloud deployment · observability · production handover",
  },
]

const proof = [
  {
    label: "inku",
    href: "https://inku.tech/",
    text: "brand-native visual engine and creative automation product",
  },
  {
    label: "wibra × cartel",
    href: "https://cartel.agency/nl/insights/zo-bezorgden-we-800-wibra-fans-een-gepersonaliseerde-video-met-ai",
    text: "800+ personalised-video workflow",
  },
  {
    label: "kaios editor",
    href: "https://kaios-editor.vercel.app/",
    text: "browser-based creative tooling",
  },
  {
    label: "kaios chat",
    href: "https://www.kaios.chat/",
    text: "realtime generative-audio product",
  },
  {
    label: "foc mcp servers",
    href: "https://foc-mcp-servers.vercel.app/",
    text: "mcp tools for business and agency workflows",
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
        <p className="font-sans text-meta text-muted">remote · worldwide</p>
        <h1 className="text-head">services</h1>
        <p>
          i&apos;m mara masaeva, a full-stack software and ai engineer. i help teams
          take ambitious ideas from prototype to a working, maintained system.
        </p>
        <p>
          i take on remote projects and embedded contracts. the best starting point
          is usually a focused build, integration, or technical discovery that leaves
          your team with a concrete result.
        </p>
        <p>
          <a
            href="mailto:maramasaeva@gmail.com?subject=project%20enquiry"
            className="prose-link"
          >
            tell me what you&apos;re building →
          </a>
        </p>
      </header>

      <section>
        <h2 className="text-head mb-4">what i build</h2>
        <div className="flow">
          {services.map((service) => (
            <article key={service.title} className="flow">
              <h3>{service.title}</h3>
              <p>{service.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-head mb-4">what i can work with</h2>
        <div className="flow">
          {capabilities.map((capability) => (
            <article key={capability.title} className="flow">
              <h3>{capability.title}</h3>
              <p>{capability.items}</p>
            </article>
          ))}
        </div>
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
        <h2 className="text-head">start a project</h2>
        <p>
          my starting rate is €100/hour excluding vat, or €800 for an eight-hour day.
          for a defined outcome, i&apos;ll quote a fixed scope after we agree on the
          inputs, acceptance criteria, and timeline.
        </p>
        <p>
          send a short note with the problem, your team, and the timing. i&apos;ll
          reply with a direct view on fit and the most useful first step.
        </p>
        <p>
          <a
            href="mailto:maramasaeva@gmail.com?subject=project%20enquiry"
            className="prose-link"
          >
            maramasaeva@gmail.com
          </a>
        </p>
      </section>
    </main>
  )
}
