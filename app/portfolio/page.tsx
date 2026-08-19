import type { Metadata } from "next"
import Image from "next/image"
import Linkified from "@/components/Linkified"
import { portfolio, type Media } from "@/lib/portfolio"

export const metadata: Metadata = {
  title: "portfolio",
  description: "four things i built, and what was hard in each.",
}

/* One media slot. Videos autoplay muted and looping so the page reads as a
   moving thing without shouting; controls stay available for a real look. */
function Frame({ media }: { media: Media }) {
  return (
    <figure className="mt-[var(--gap)]">
      <div className="overflow-hidden rounded-sm border border-faint">
        {media.kind === "video" ? (
          <video
            className="block h-auto w-full"
            src={media.src}
            poster={media.poster}
            controls
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          >
            your browser will not play this video. the links above go to the
            live thing.
          </video>
        ) : (
          <Image
            className="block h-auto w-full"
            src={media.src}
            width={media.width}
            height={media.height}
            alt={media.caption}
            sizes="(min-width: 640px) 46rem, 100vw"
          />
        )}
      </div>
      <figcaption className="mt-1.5 font-mono text-meta text-muted">
        {media.caption}
      </figcaption>
    </figure>
  )
}

export default function Portfolio() {
  return (
    <div className="flow-lg">
      <p className="text-muted">
        four things i built and kept building, with what was hard in each. the
        short list, including the private work, is on{" "}
        <a href="/work" className="prose-link">
          work
        </a>
        .
      </p>

      {portfolio.map((piece) => (
        <section key={piece.title}>
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-head">{piece.title}</h2>
            <span className="shrink-0 font-mono text-meta text-muted tabular-nums">
              {piece.year}
            </span>
          </div>

          <p className="font-mono text-meta text-muted">
            <Linkified text={piece.role} refs={piece.refs} />
          </p>
          <p className="font-mono text-meta text-muted">{piece.stack}</p>

          <div className="mt-[var(--gap)] flow">
            {piece.body.map((para) => (
              <p key={para.slice(0, 24)}>
                <Linkified text={para} refs={piece.refs} />
              </p>
            ))}
          </div>

          {piece.media?.map((media) => (
            <Frame key={media.src} media={media} />
          ))}

          <p className="mt-[var(--gap)] flex flex-wrap gap-x-4 gap-y-1 font-mono text-meta">
            {piece.links?.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="prose-link"
                target="_blank"
                rel="noreferrer"
              >
                {link.label}
              </a>
            ))}
          </p>
        </section>
      ))}
    </div>
  )
}
