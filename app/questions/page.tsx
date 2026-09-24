import type { Metadata } from "next"
import Link from "next/link"
import Linkified from "@/components/Linkified"
import { questions } from "@/lib/questions"

export const metadata: Metadata = { title: "questions" }

export default function Questions() {
  return (
    <div className="flow-lg max-w-[34rem]">
      <p>
        things people ask me, or would if they thought of it. if yours isn&apos;t
        here, the{" "}
        <Link href="/messageboard" className="prose-link">
          messageboard
        </Link>{" "}
        is open.
      </p>

      {questions.map((section) => (
        <section key={section.title}>
          <h2 className="mb-4 font-sans text-meta text-muted">{section.title}</h2>
          <dl className="flow-lg">
            {section.items.map((item) => (
              <div key={item.q} className="flow">
                <dt className="text-head">{item.q}</dt>
                {item.a.map((para, i) => (
                  <dd key={i}>
                    <p>
                      <Linkified text={para} refs={item.refs} />
                    </p>
                  </dd>
                ))}
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  )
}
