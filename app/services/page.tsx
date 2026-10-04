import type { Metadata } from "next"
import Link from "next/link"

import { SITE_NAME, SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  title: "services",
  description:
    "remote software and agentic engineering: agents, creative systems, integrations, and evaluation work.",
  alternates: { canonical: SITE_URL + "/services" },
  openGraph: {
    title: "services · " + SITE_NAME,
    description:
      "remote software and agentic engineering: agents, creative systems, integrations, and evaluation work.",
    url: SITE_URL + "/services",
  },
}

const services = [
  {
    title: "agentic engineering",
    copy: "when an agent has to touch a real system, somebody has to think about state, tools, permissions, retries, and what happens when it goes sideways. i make that layer.",
  },
  {
    title: "software systems and integrations",
    copy: "a lot of useful work is glue. apis, auth, data, a small interface, a deployment. i can take the thing that has been held together by a prompt and turn it into software people can use.",
  },
  {
    title: "ai production workflows",
    copy: "for wibra, a person could give a name and receive a video made for them. i designed and built the whole technical workflow behind 800+ of those videos.",
  },
  {
    title: "creative and consumer ai products",
    copy: "i have worked across inku’s brand-native visual engine, and on kaios’s browser audio, realtime infrastructure, and generative-music tooling. this is where models meet taste, latency, and the strange things users actually do.",
  },
  {
    title: "evaluation and research software",
    copy: "i like systems you can interrogate. i make tests, scorers, parsers, and research pipelines that leave a trail of why a model did what it did.",
  },
  {
    title: "swarmchasing",
    href: "/services/swarmchasing",
    copy: "for people who have seen strange agent traffic and want more than a hunch. i reconstruct the trace, build a baseline, and say plainly what the evidence can and cannot show.",
  },
]

const capabilities = [
  {
    title: "coding with agents",
    items:
      "claude code · codex · cursor · agent loops · multi-agent workflows · model context protocol (mcp) · a2a · custom tools · structured outputs · oauth and jwt",
  },
  {
    title: "models, tests, and failure cases",
    items:
      "openai · anthropic · google genai · inspect ai · scenario design · eval harnesses · scorers · parsers · dataset pipelines · model-behaviour analysis",
  },
  {
    title: "the normal software part",
    items:
      "typescript · python · node.js · react · next.js · vite · tailwind · rest apis · webhooks · cli tools · html and css",
  },
  {
    title: "data that moves",
    items:
      "postgres · supabase · sqlalchemy · websockets · server-sent events · httpx · event-driven workflows · network analysis · scikit-learn",
  },
  {
    title: "images, video, and sound",
    items:
      "image, video, and audio pipelines · flux · dreambooth · lora · hugging face · stable audio · tone.js · web audio · three.js",
  },
  {
    title: "getting it out the door",
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
          i&apos;m mara masaeva. i work on software, agents, creative tools, and the
          infrastructure around them. i can work across a product when that is what
          the job needs.
        </p>
        <p>
          i take remote projects and embedded contracts. bring me in for a build,
          an integration, or a problem that has become more complicated than it
          looked at first.
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
        <h2 className="text-head mb-4">what i do</h2>
        <div className="flow">
          {services.map((service) => (
            <article key={service.title} className="flow">
              <h3>
                {service.href ? (
                  <Link href={service.href} className="prose-link">
                    {service.title} →
                  </Link>
                ) : (
                  service.title
                )}
              </h3>
              <p>{service.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="flow">
        <h2 className="text-head">a working inventory</h2>
        <p>
          this is the stuff i&apos;ve used, not a certification wall. if your stack
          is nearby, i can probably get useful in it quickly.
        </p>
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
        <h2 className="text-head mb-4">things you can click</h2>
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
          if the work has a clean shape, i&apos;ll quote it as a fixed scope.
        </p>
        <p>
          send the problem, the team, and the timing. a few plain sentences are
          enough.
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
