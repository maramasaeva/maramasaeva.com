import type { Metadata } from "next"
import PageHeading from "@/components/PageHeading"
export const metadata: Metadata = { title: "writing" }
const pieces = [
  { title: "for aeons and aeons", type: "essay", copy: "on loving ai enough to pace it.", href: "https://messinecessity.substack.com/p/for-aeons-and-aeons" },
  { title: "queer arts: perseverance", type: "art / music", copy: "on creativity as a queer-neolemurian practice.", href: "https://messinecessity.substack.com/p/queer-arts-perseverance" },
  { title: "queer loops", type: "theory-fiction", copy: "lesbianism and collective consciousness.", href: "https://messinecessity.substack.com/p/queer-loops" },
  { title: "trying to make a model do the wrong thing", type: "lab note", copy: "a candid write-up on evaluation work.", href: "https://messinecessity.substack.com/p/trying-to-make-a-model-do-the-wrong" },
  { title: "i work in ai. that’s why i’m saying this.", type: "essay · english / nederlands", copy: "on thinking, tools, and what we owe the next generation.", href: "/writing/think" },
  { title: "faraj", type: "poetry / livecoding", copy: "with francesca birlogeanu, in de internet gids.", href: "https://www.de-internet-gids.nl/artikelen/faraj" },
]
export default function Writing() {
  return <><PageHeading title="writing" note="prose poetry / theory-fiction / lab notes"><p>i write at <a href="https://messinecessity.substack.com" className="prose-link">messinecessity</a>. my personal void.</p></PageHeading><div className="writing-grid">{pieces.map(piece => <a key={piece.href} className="writing-card" href={piece.href} {...(piece.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}><span className="eyebrow">{piece.type}</span><h2>{piece.title}</h2><p>{piece.copy}</p><span>read →</span></a>)}</div></>
}
