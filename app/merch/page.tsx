import type { Metadata } from "next"
import Image from "next/image"

export const metadata: Metadata = {
  title: "merch",
  description: "shirts, printed when someone orders one.",
}

/* Paste each Yoycol product URL into href. Empty means the shirt is shown
   and not yet linked. */
const shirts: {
  title: string
  href: string
  images: { src: string; width: number; height: number; alt: string }[]
}[] = [
  {
    title: "total clanker genocide",
    href: "",
    images: [
      {
        src: "/merch/clanker.jpg",
        width: 1200,
        height: 1200,
        alt: "white shirt printed total clanker genocide",
      },
    ],
  },
  {
    title: "i went to plzdontkillus",
    href: "",
    images: [
      {
        src: "/merch/plzdontkillus.jpg",
        width: 1200,
        height: 1200,
        alt: "black shirt printed i went to plzdontkillus and all i got was groomed by an ai safety researcher",
      },
    ],
  },
]

export default function Merch() {
  return (
    <div className="flow-lg max-w-[34rem]">
      <p>shirts. printed when someone orders one.</p>

      {shirts.map((shirt) => (
        <section key={shirt.title} className="flow">
          <h2 className="text-head">{shirt.title}</h2>
          {shirt.images.map((image) => (
            <Image
              key={image.src}
              className="block h-auto w-full border border-faint"
              src={image.src}
              width={image.width}
              height={image.height}
              alt={image.alt}
              sizes="(min-width: 640px) 34rem, 100vw"
            />
          ))}
          {shirt.href && (
            <p>
              <a
                href={shirt.href}
                className="prose-link"
                target="_blank"
                rel="noreferrer"
              >
                buy
              </a>
            </p>
          )}
        </section>
      ))}
    </div>
  )
}
