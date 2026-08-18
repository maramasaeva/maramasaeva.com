import type { Metadata } from "next"

export const metadata: Metadata = { title: "writing" }

export default function Writing() {
  return (
    <div className="flow max-w-[34rem]">
      <p>
        i write prose poetry and theory-fiction at{" "}
        <a
          href="https://messinecessity.substack.com"
          className="prose-link"
          target="_blank"
          rel="noreferrer"
        >
          messinecessity
        </a>
        .
      </p>

      <p>
        recent:{" "}
        <a
          href="https://messinecessity.substack.com/p/queer-arts-perseverance"
          className="prose-link"
          target="_blank"
          rel="noreferrer"
        >
          queer arts: perseverance
        </a>
        , on creativity as a queer-neolemurian practice, and{" "}
        <a
          href="https://messinecessity.substack.com/p/queer-loops"
          className="prose-link"
          target="_blank"
          rel="noreferrer"
        >
          queer loops
        </a>
        , about lesbianism and collective consciousness.
      </p>
    </div>
  )
}
