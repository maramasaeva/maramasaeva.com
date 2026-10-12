import type { Metadata } from "next"
import Link from "next/link"
import Linkified from "@/components/Linkified"
import PageHeading from "@/components/PageHeading"
import { questions } from "@/lib/questions"
export const metadata: Metadata = { title: "questions" }
export default function Questions() {
  return <div className="questions-page"><PageHeading title="things people ask." note="or would, if they thought of it"><p>if yours isn’t here, the <Link href="/messageboard" className="prose-link">messageboard</Link> is open.</p></PageHeading>
    {questions.map(section => <section key={section.title} className="question-group"><h2 className="eyebrow">{section.title}</h2>{section.items.map(item => <details key={item.q}><summary>{item.q}</summary><div className="question-answer">{item.a.map((para, index) => <p key={index}><Linkified text={para} refs={item.refs} /></p>)}</div></details>)}</section>)}
  </div>
}
