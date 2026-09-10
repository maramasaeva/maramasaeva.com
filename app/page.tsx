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
      <p>hi, im mara.</p>

      <p>
        were you to ask a software engineer and an artist to dance, the result
        would be captured in my shape. shapeshifting describes very well my
        technique of life; i build bottom-up, top-down, front- and back, all
        parts of the stack. attack, defense, evaluation, and creation. you
        will find me on every frontier.
      </p>

      <p>
        more concretely: i built <A href="https://www.kaios.chat/">kaios</A>{" "}
        end to end — live conversation becomes generated music through a
        multi-agent backend and an in-browser daw — together with{" "}
        <A href="https://x.com/koto9x">koto</A>, who spent the last five years
        as grimes&apos; creative technologist (
        <A href="https://www.austinchronicle.com/daily/music/2023-04-25/grimes-explained-to-ut-students-why-artists-should-make-songs-with-her-ai-generated-vocals/">
          grimesAI
        </A>
        , brockhampton tours, projects with openai and runway).
      </p>

      <p>
        i also attack what others build. my{" "}
        <A href="/work/plzdontkillus">audit</A> of the infrastructure behind{" "}
        <A href="https://plzdontkillus.com">plzdontkillus</A> showed that even
        lightcone&apos;s stack is breakable: real holes, one of them critical,
        all disclosed.
      </p>

      <p>
        right now i am building evals on{" "}
        <A href="https://inspect.aisi.org.uk/">inspect</A>. the first study is{" "}
        <A href="/work/unmonitored">the unmonitored channel</A>: give an agent
        a place to write that it is told no human reads, and measure how far
        what it says there drifts from what it says to the user. the design is
        public and the <A href="https://github.com/maramasaeva/evals">repo</A>{" "}
        is open while i build it.
      </p>

      <p>
        day to day i build agent infrastructure at{" "}
        <A href="https://friendsofcartel.com">friends of cartel</A>: mcp
        workflows and full ai pipelines, from the models to the interfaces on
        top of them. i&apos;m a generalist and an ai safety communicator.
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
