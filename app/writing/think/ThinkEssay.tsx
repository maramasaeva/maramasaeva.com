"use client"

import { useState } from "react"

type Lang = "en" | "nl"

/* Migrated from messier-systems/think. The original used semicolons where
   other punctuation belonged (a rewrite artefact); those are commas and colons
   here. The service offerings and the "bring me in" pitch are deliberately not
   carried over: this site doesn't sell anything. */

const COPY = {
  en: {
    label: "on thinking, tools, and what we owe the next generation",
    title: ["i work in AI.", "that's why i'm saying this."],
    intro: [
      "i'm a nonbinary AI engineer building systems at the intersection of intelligence, creativity, and care. and i've become increasingly convinced that the way we're introducing these tools, especially to children, is doing quiet, serious harm.",
      "this page is for anyone who wants to think about that with me.",
    ],
    concernsLabel: "what concerns me",
    concerns: [
      {
        id: "01",
        label: "cognitive offloading",
        body: "when we outsource thinking before building the capacity to think, we don't augment intelligence, we replace it. research on the google effect (sparrow et al., 2011) and cognitive offloading (risko & gilbert) shows the brain encodes differently when it knows retrieval is external. the question isn't whether tools help. it's what atrophies when we stop doing the hard internal work entirely.",
      },
      {
        id: "02",
        label: "children + development",
        body: "children are being handed intelligence amplification tools before they've built their own intelligence. maryanne wolf's work on deep reading shows how the brain literally rewires itself through effortful cognitive practice. a child who has never learned to sit with a hard problem, who has only ever prompted their way through, is not ready for a collaborative relationship with AI. they're in a dependent one.",
      },
      {
        id: "03",
        label: "systems + equity",
        body: "the costs of uncritical AI adoption are not evenly distributed. safiya umoja noble, virginia eubanks and kate crawford all document how algorithmic systems encode and amplify existing inequalities. AI literacy is not a neutral skill. it's a question of who gets to understand the systems shaping their lives, and who is just subject to them.",
      },
      {
        id: "04",
        label: "the inside view",
        body: "i work in AI. i help organizations implement it. i build these systems. and that's exactly why i'm saying this, not despite it. i've seen what happens when we skip the part where humans stay in the loop. when speed-to-deployment trumps critical thinking. when the tool becomes the default, not the option.",
      },
    ],
    standLabel: "where i stand",
    stand: [
      "i am not against AI. i think the human-AI relationship, built right, is one of the most interesting things happening in the world. i want to be part of building it well.",
      'but "built right" means humans come in with something: their own capacity for reasoning, for sitting with difficulty, for being wrong and correcting themselves. children especially need to develop that capacity BEFORE they\'re in a dependent relationship with a system that will do it for them.',
    ],
    close: ["that's the work. not fear. not prohibition.", "literacy."],
  },
  nl: {
    label:
      "over denken, tools, en wat we de volgende generatie verschuldigd zijn",
    title: ["ik werk in AI.", "daarom zeg ik dit."],
    intro: [
      "ik ben een non-binaire AI-engineer die systemen bouwt op het snijvlak van intelligentie, creativiteit en zorg. en ik ben er steeds meer van overtuigd dat de manier waarop we deze tools introduceren, vooral bij kinderen, stille, serieuze schade aanricht.",
      "deze pagina is voor iedereen die hierover wil nadenken met mij.",
    ],
    concernsLabel: "wat me bezighoudt",
    concerns: [
      {
        id: "01",
        label: "cognitieve uitbesteding",
        body: "wanneer we het denken uitbesteden voordat we de capaciteit om te denken hebben opgebouwd, versterken we geen intelligentie, we vervangen ze. onderzoek naar het google-effect (sparrow et al., 2011) en cognitieve uitbesteding (risko & gilbert) toont aan dat het brein anders encodeert wanneer het weet dat ophalen extern gebeurt. de vraag is niet of tools helpen. het gaat erom wat verzwakt wanneer we stoppen met het moeilijke interne werk.",
      },
      {
        id: "02",
        label: "kinderen + ontwikkeling",
        body: "kinderen krijgen tools voor intelligentieversterking in handen voordat ze hun eigen intelligentie hebben opgebouwd. het werk van maryanne wolf over diep lezen toont hoe het brein zichzelf letterlijk herstructureert door cognitieve inspanning. een kind dat nooit heeft geleerd om bij een moeilijk probleem te blijven zitten, dat alleen maar heeft geprompt, is niet klaar voor een samenwerkingsrelatie met AI. het zit in een afhankelijkheidsrelatie.",
      },
      {
        id: "03",
        label: "systemen + gelijkheid",
        body: "de kosten van onkritische AI-adoptie zijn niet gelijk verdeeld. safiya umoja noble, virginia eubanks en kate crawford documenteren allemaal hoe algoritmische systemen bestaande ongelijkheden vastleggen en versterken. AI-geletterdheid is geen neutrale vaardigheid. het is de vraag wie de systemen begrijpt die hun leven vormgeven, en wie er gewoon aan onderworpen is.",
      },
      {
        id: "04",
        label: "het perspectief van binnenuit",
        body: "ik werk in AI. ik help organisaties het te implementeren. ik bouw deze systemen. en precies daarom zeg ik dit, niet ondanks dat. ik heb gezien wat er gebeurt als we het stuk overslaan waar mensen in de loop blijven. wanneer snelheid van implementatie boven kritisch denken gaat. wanneer de tool de standaard wordt, niet de optie.",
      },
    ],
    standLabel: "waar ik sta",
    stand: [
      "ik ben niet tegen AI. ik denk dat de mens-AI-relatie, als ze goed wordt opgebouwd, een van de meest interessante dingen is die in de wereld gebeuren. ik wil mee helpen om dat goed te doen.",
      '"goed opgebouwd" betekent dat mensen ergens mee komen: hun eigen vermogen om te redeneren, om bij moeilijkheden te blijven, om fout te zijn en zichzelf te corrigeren. kinderen moeten die capaciteit vooral ontwikkelen VOORDAT ze in een afhankelijkheidsrelatie zitten met een systeem dat het voor hen doet.',
    ],
    close: ["dat is het werk. geen angst. geen verbod.", "geletterdheid."],
  },
} as const

/** renders the one SHOUTED word as an emphasis, without markup in the copy */
function Emphasised({ text }: { text: string }) {
  const parts = text.split(/\b(BEFORE|VOORDAT)\b/)
  return (
    <>
      {parts.map((p, i) =>
        p === "BEFORE" || p === "VOORDAT" ? (
          <em key={i}>{p.toLowerCase()}</em>
        ) : (
          p
        ),
      )}
    </>
  )
}

export default function ThinkEssay() {
  const [lang, setLang] = useState<Lang>("en")
  const c = COPY[lang]

  return (
    <div className="flow-lg max-w-[34rem]">
      <div className="flow">
        <div className="flex items-baseline justify-between gap-4">
          <p className="font-mono text-meta text-muted">{c.label}</p>
          <div className="flex shrink-0 gap-2 font-mono text-meta">
            {(["en", "nl"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={lang === l ? "text-fg underline" : "text-muted hover:text-fg"}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <h1 className="text-head">
          {c.title[0]}
          <br />
          {c.title[1]}
        </h1>

        {c.intro.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      <section className="flow">
        <h2 className="font-mono text-meta text-muted">{c.concernsLabel}</h2>
        <div>
          {c.concerns.map((x) => (
            <details
              key={x.id}
              className="border-t py-2"
              style={{ borderColor: "var(--faint)" }}
            >
              <summary className="cursor-pointer list-none marker:hidden">
                <span className="font-mono text-meta text-muted">{x.id}</span>{" "}
                <span>{x.label}</span>
              </summary>
              <p className="mt-2 text-muted">{x.body}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="flow">
        <h2 className="font-mono text-meta text-muted">{c.standLabel}</h2>
        {c.stand.map((p) => (
          <p key={p}>
            <Emphasised text={p} />
          </p>
        ))}
        <p>
          {c.close[0]}{" "}
          <span style={{ color: "var(--accent)" }}>{c.close[1]}</span>
        </p>
      </section>
    </div>
  )
}
