import type { Metadata } from "next"

export const metadata: Metadata = { title: "writing" }

export default function Writing() {
  return (
    <div className="space-y-5">
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
        one essay lives here instead, because it&apos;s about my own work:{" "}
        <a
          href="https://messier-systems.vercel.app/think"
          className="prose-link"
          target="_blank"
          rel="noreferrer"
        >
          i work in ai, that&apos;s why i&apos;m saying this
        </a>
        , on cognitive offloading, what deep reading costs when we automate it,
        and why children need to develop a capacity before they&apos;re in a
        dependent relationship with a system that will do it for them.
      </p>
    </div>
  )
}
