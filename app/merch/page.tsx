import type { Metadata } from "next"
import Image from "next/image"
import MerchOrder from "@/components/MerchOrder"
import { countries } from "@/lib/merch"

export const metadata: Metadata = {
  title: "merch",
  description: "shirts.",
}

const shirts: {
  title: string
  images: { src: string; width: number; height: number; alt: string }[]
}[] = [
  {
    title: "total clanker genocide",
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

export default async function Merch({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>
}) {
  const { sent } = await searchParams
  const countryList = countries()
  return (
    <div className="flow-lg max-w-[34rem]">
      {sent === "1" && (
        <p className="text-left [hyphens:none]">
          payment sent. the shirt ships to the address you entered, once that payment arrives.
        </p>
      )}
      {shirts.map((shirt) => (
        <section key={shirt.title} className="flow">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-head">{shirt.title}</h2>
            <span className="shrink-0 font-sans text-meta text-muted tabular-nums">
              €24 / $27
            </span>
          </div>
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
          <MerchOrder shirt={shirt.title} countries={countryList} />
        </section>
      ))}
    </div>
  )
}
