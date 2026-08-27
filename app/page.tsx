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
        technique of life, indeed; i build bottom-up, top-down, front- and
        back, all parts of the stack. attack, defense, evaluation, and
        creation. you will find me on every frontier.
      </p>

      <p>
        more concretely, i develop ai products and pipelines, evaluate them
        and push them into innovative hands and environments.
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
