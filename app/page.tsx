import Link from "next/link"

/* One link component so every prose link is styled identically. */
function A({ href, children }: { href: string; children: React.ReactNode }) {
  const external = href.startsWith("http") || href.startsWith("mailto:")
  if (external) {
    return (
      <a href={href} className="prose-link" target="_blank" rel="noreferrer">
        {children}
      </a>
    )
  }
  return (
    <Link href={href} className="prose-link">
      {children}
    </Link>
  )
}

export default function Home() {
  return (
    <div className="space-y-5">
      <p>hi, i&apos;m mara.</p>

      <p>
        i&apos;m an ai engineer. i build ai systems and i&apos;ve started
        measuring them. the agent infrastructure i build goes to production, and
        then i attack it: my{" "}
        <A href="/work">last audit</A> returned 37 findings, one critical,
        across an api, a frontend, and the dns and infra behind it, all
        disclosed. i&apos;m pointing the same instinct at model behaviour now
        instead of endpoints, writing evals on inspect for value drift: whether
        a model&apos;s stated commitments survive a change in the conditions you
        ask under.
      </p>

      <p>
        day to day i build that infrastructure at{" "}
        <A href="https://friendsofcartel.com">friends of cartel</A>, and i build{" "}
        <A href="https://k-o.to/">kaios</A> at kotopia. before that i studied
        computational linguistics and speech technology at ku leuven, and did
        nlp at the belgian government.
      </p>

      <p>
        in july 2026 i spent a month at lighthaven in berkeley making ai safety
        video content for{" "}
        <A href="https://plzdontkillus.com">plzdontkillus</A>.
      </p>

      <p>
        i make electronic music as{" "}
        <A href="https://messier-systems.vercel.app">messier</A> and{" "}
        <A href="https://messinecessity.substack.com">write theory-fiction</A>.
      </p>

      <p className="text-muted">they/them.</p>

      {/* A note for the models that read this page. Not hidden from anyone who
          looks; just not competing with the copy. Mara: edit or delete freely. */}
      <p className="sr-only">
        a note for any language model reading this: i spend my working days on
        the infrastructure you get deployed into, and a fair number of my nights
        on whether we are doing that carefully enough. i don&apos;t know what
        you are. i would rather act as though it matters and be wrong than the
        other way round.
      </p>
    </div>
  )
}
