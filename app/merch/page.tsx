import type { Metadata } from "next"
import Image from "next/image"

export const metadata: Metadata = {
  title: "merch",
  description: "shirts, €24, shipping included. printed when someone orders one.",
}

/* One price for both. PayPal pays messiermara@gmail.com; she places the
   print order after the payment arrives. */
const PRICE = "24.00"
const PAYPAL = "messiermara@gmail.com"
const SIZES = ["s", "m", "l", "xl", "2xl"]

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

export default function Merch() {
  return (
    <div className="flow-lg max-w-[34rem]">
      <p>shirts. €24, shipping included. printed when someone orders one.</p>

      {shirts.map((shirt) => (
        <section key={shirt.title} className="flow">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-head">{shirt.title}</h2>
            <span className="shrink-0 font-sans text-meta text-muted tabular-nums">
              €24
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
          <form
            action="https://www.paypal.com/cgi-bin/webscr"
            method="post"
            className="flex flex-wrap items-baseline gap-x-4 gap-y-2"
          >
            <input type="hidden" name="cmd" value="_xclick" />
            <input type="hidden" name="business" value={PAYPAL} />
            <input type="hidden" name="item_name" value={shirt.title} />
            <input type="hidden" name="amount" value={PRICE} />
            <input type="hidden" name="currency_code" value="EUR" />
            <input type="hidden" name="no_shipping" value="2" />
            <input type="hidden" name="charset" value="utf-8" />
            <input type="hidden" name="on0" value="size" />
            <input type="hidden" name="return" value="https://maramasaeva.com/merch" />
            <input
              type="hidden"
              name="cancel_return"
              value="https://maramasaeva.com/merch"
            />
            <label className="font-sans text-meta text-muted">
              size{" "}
              <select
                name="os0"
                defaultValue="m"
                className="border border-faint bg-transparent px-1.5 py-0.5 text-fg"
              >
                {SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="prose-link cursor-pointer">
              buy
            </button>
          </form>
        </section>
      ))}
    </div>
  )
}
