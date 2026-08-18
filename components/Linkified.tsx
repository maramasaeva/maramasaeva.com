export type Ref = { text: string; href: string }

/* Turns the substrings named in refs into links, leaving the rest as text.
   Longest first, so a ref that contains another still matches correctly. */
export default function Linkified({
  text,
  refs,
}: {
  text: string
  refs?: Ref[]
}) {
  if (!refs?.length) return <>{text}</>

  const pattern = new RegExp(
    `(${[...refs]
      .sort((a, b) => b.text.length - a.text.length)
      .map((r) => r.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|")})`,
    "g",
  )

  return (
    <>
      {text.split(pattern).map((part, i) => {
        const ref = refs.find((r) => r.text === part)
        return ref ? (
          <a
            key={i}
            href={ref.href}
            className="prose-link"
            target="_blank"
            rel="noreferrer"
          >
            {part}
          </a>
        ) : (
          part
        )
      })}
    </>
  )
}
