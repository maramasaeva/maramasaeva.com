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

      <p>
        i am proud to call myself an engineer. i build ai products whole and
        fast: backend, frontend, models, and the words that explain them. i
        built <A href="https://www.kaios.chat/">kaios</A> end to end as sole
        engineer: live conversation becomes generated music through a
        multi-agent backend and an in-browser daw. i&apos;ve trained diffusion
        models on h100s and made the first ai dj that lives inside ableton.
      </p>

      <p>
        speed is half of it; the other half is that i fiercely attack what i
        build. for a 60-person residency at lighthaven in berkeley i designed
        and shipped two production web apps in days while producing ai safety
        video for <A href="https://plzdontkillus.com">plzdontkillus</A>, and
        my <A href="/work/plzdontkillus">audit</A> of the miri-sponsored
        infrastructure returned 37 findings, one critical, all disclosed. now
        i&apos;m writing evals on inspect for value drift: whether a
        model&apos;s stated commitments survive a change in the conditions you
        ask under.
      </p>

      <p>
        day to day i build agent infra at{" "}
        <A href="https://friendsofcartel.com">friends of cartel</A>, and at{" "}
        <A href="https://www.kotopia.world/">kotopia</A> i&apos;m designing
        kaios, the ai companion for the future we actually want.
      </p>

      <p>
        before that: an advanced master of ai at ku leuven, during which i
        did nlp at the belgian government before the llm wave, and a master in
        digital text analysis at antwerp, where my thesis was{" "}
        <A href="https://github.com/maramasaeva/pythia">pythia</A>, a moral
        judgement classifier.
      </p>

      <p>
        i&apos;m relocating to the bay area, and i want to work across the
        entire surface of an org: engineering, operations, and communicating
        with the public, ai safety and social media included. hand me a task i
        haven&apos;t done before and i&apos;ll learn it on the spot.
      </p>

      <p>
        i make electronic music as{" "}
        <A href="https://soundcloud.com/user-587494783/albums">messier</A> and{" "}
        <A href="https://messinecessity.substack.com">write theory-fiction</A>.
      </p>

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
