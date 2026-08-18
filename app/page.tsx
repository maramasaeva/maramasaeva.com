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
    <div className="flow max-w-[34rem]">
      <p>hi, i&apos;m mara.</p>

      {/* The one-glance version: fragments, not sentences. */}
      <div>
        <p className="font-mono text-meta text-muted">tldr;</p>
        <ul className="mt-[calc(var(--gap)/2)] list-disc space-y-1 pl-5 marker:text-muted">
          <li>
            sole engineer of <A href="https://www.kaios.chat/">kaios</A>: live
            conversation into generated music, multi-agent backend, in-browser
            daw
          </li>
          <li>diffusion models trained on h100s</li>
          <li>first ai dj inside ableton live</li>
          <li>
            two production web apps for a 60-person berkeley residency, shipped
            in days
          </li>
          <li>
            <A href="/work/plzdontkillus">security audit</A> of miri-sponsored
            infrastructure: 37 findings, one critical, all disclosed
          </li>
          <li>value-drift evals on inspect, cross-lingual</li>
          <li>two ai masters; nlp at the belgian government before the llm wave</li>
          <li>
            relocating to the bay area: engineering, ops, and communicating ai
            to the public
          </li>
          <li>
            electronic music as{" "}
            <A href="https://soundcloud.com/user-587494783/albums">messier</A>;{" "}
            <A href="https://messinecessity.substack.com">theory-fiction</A>
          </li>
        </ul>
      </div>

      {/* The longer version, folded. Native <details>: no JS, and the text
          stays in the DOM for crawlers and models reading the page. */}
      <details className="group">
        <summary className="inline-block cursor-pointer list-none select-none rounded-full border border-faint px-3 py-1 font-mono text-meta text-muted hover:border-muted hover:text-fg [&::-webkit-details-marker]:hidden">
          <span className="group-open:hidden">tell me more ↓</span>
          <span className="hidden group-open:inline">less ↑</span>
        </summary>
        <div className="flow mt-[var(--gap)]">
          <p>
            i am proud to call myself an engineer. i build ai products whole
            and fast: backend, frontend, models, and the words that explain
            them. i built <A href="https://www.kaios.chat/">kaios</A> end to
            end as sole engineer, a platform where live conversation becomes
            generated music through a multi-agent backend and an in-browser
            daw. i&apos;ve trained diffusion models on h100s and made the
            first ai dj that lives inside ableton.
          </p>

          <p>
            day to day i build agent infra at{" "}
            <A href="https://friendsofcartel.com">friends of cartel</A>, and
            at <A href="https://www.kotopia.world/">kotopia</A> i&apos;m
            designing kaios, the ai companion for the future we actually want.
          </p>

          <p>
            speed is half of it; the other half is that i fiercely attack what
            i build. when a 60-person residency at lighthaven in berkeley
            needed tools, i designed and shipped two production web apps in
            days, and the whole house used them, while writing and producing
            ai safety video for{" "}
            <A href="https://plzdontkillus.com">plzdontkillus</A> that same
            month. my <A href="/work/plzdontkillus">last audit</A>, of
            miri-sponsored infrastructure for the residency, returned 37
            findings, one critical, across an api, a frontend, and the dns
            behind it, all disclosed. i&apos;m pointing that instinct at model
            behaviour now, writing evals on inspect for value drift: whether a
            model&apos;s stated commitments survive a change in the conditions
            you ask under.
          </p>

          <p>
            before that: an advanced master of artificial intelligence at ku
            leuven, speech and language technology, where my thesis was{" "}
            <A href="https://github.com/maramasaeva/pythia">pythia</A>, a
            moral judgement classifier i probed with shap, and a second master
            in digital text analysis at antwerp. i was early to nlp:
            classifying citizen questions at the belgian government before the
            llm wave, and doing research communications for{" "}
            <A href="https://www.muhai.org/index.html">muhai</A> and{" "}
            <A href="https://beehaif.org/">beehaif</A> at the university of
            brussels ai lab.
          </p>

          <p>
            i&apos;m relocating to the bay area, and i want to work across the
            entire surface of an org, small or big: engineering, operations,
            and communicating with the public, ai safety and social media
            included. hand me a task i haven&apos;t done before and i&apos;ll
            learn it on the spot: switching surfaces is the part of the work i
            like most.
          </p>

          <p>
            i make electronic music as{" "}
            <A href="https://soundcloud.com/user-587494783/albums">messier</A>{" "}
            and{" "}
            <A href="https://messinecessity.substack.com">
              write theory-fiction
            </A>
            .
          </p>
        </div>
      </details>

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
