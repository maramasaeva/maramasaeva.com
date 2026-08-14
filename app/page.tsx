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
        i&apos;m an ai engineer. i build ai systems and i measure them. the
        agent infrastructure i build goes to production, and
        then i attack it: my{" "}
        <A href="/work/plzdontkillus">last audit</A> returned 37 findings, one critical,
        across an api, a frontend, and the dns and infra behind it, all
        disclosed. i&apos;m pointing the same instinct at model behaviour now
        instead of endpoints, writing evals on inspect for value drift: whether
        a model&apos;s stated commitments survive a change in the conditions you
        ask under.
      </p>

      <p>
        day to day i build that infrastructure at{" "}
        <A href="https://friendsofcartel.com">friends of cartel</A>, and i build{" "}
        <A href="https://k-o.to/">kaios</A> at kotopia.
      </p>

      <p>
        before that i studied computational linguistics and speech technology at
        ku leuven, where my thesis was{" "}
        <A href="https://github.com/maramasaeva/pythia">pythia</A>, a moral
        judgement classifier i probed with shap to see which tokens actually
        moved a prediction. i did nlp at the belgian government, and research
        communications for <A href="https://www.muhai.org/index.html">muhai</A> and{" "}
        <A href="https://beehaif.org/">beehaif</A> at the university of brussels ai lab.
      </p>

      <p>
        in july 2026 i spent a month at lighthaven in berkeley working on ai
        safety and x-risk communications for{" "}
        <A href="https://plzdontkillus.com">plzdontkillus</A>. i&apos;m
        relocating to the bay area.
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
