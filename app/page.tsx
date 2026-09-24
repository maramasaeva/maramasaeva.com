import Link from "next/link"
import ActivityPanel from "@/components/ActivityPanel"
import { aggregateActivity } from "@/lib/activity"

/* The intro is static; the activity panel is rebuilt at most once an hour. */
export const revalidate = 3600

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

export default async function Home() {
  const activity = await aggregateActivity()

  return (
    /* On wide screens the panel gets a narrow column of its own in the
       top-right corner, overhanging the 46rem shell to the right; the intro
       stays on the shell's left edge, level with the nav. Below lg the panel
       simply follows the intro. The message board has its own page. */
    <div className="lg:-mr-[8rem] lg:grid lg:grid-cols-[minmax(0,34rem)_minmax(15rem,19rem)] lg:items-start lg:justify-between lg:gap-x-10 xl:-mr-[16rem]">
      <Intro />
      {/* on wide screens the aside climbs past main's top padding so it sits
          in the top-right corner, level with the nav */}
      <aside
        className="mt-[calc(var(--gap)*2.4)] lg:-mt-[clamp(1.5rem,4.5vh,2.75rem)]"
        aria-label="recent activity"
      >
        <ActivityPanel data={activity} />
      </aside>
    </div>
  )
}

function Intro() {
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
        building taught me where builders leave their doors open, so i learned
        to walk through them as well. i have made machines sing, broken into
        systems that were meant to hold, and these days i build agents while
        asking what they do when no one is watching, and whether we would even
        notice.
      </p>

      <p>
        i&apos;m a generalist and an ai safety communicator. the rest, i
        answered <A href="/questions">here</A>.
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
