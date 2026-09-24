/* Single source of truth for everything on the site.
   The old site had three competing skill taxonomies and two project lists;
   keep all copy here so that can't happen again. */

export type CvRow = {
  years: string
  what: string
  org: string
  href?: string
  /** substrings of `what` to turn into links, e.g. project names */
  refs?: { text: string; href: string }[]
}

/** year · what · org. Newest first. The verb phrase carries the meaning,
 *  so resist adding bullets underneath: detail belongs on /work. */
export const cv: CvRow[] = [
  {
    years: "2025–",
    what: "agent infrastructure and evaluation harnesses",
    org: "friends of cartel",
    href: "https://friendsofcartel.com",
  },
  {
    years: "2026–",
    what: "evals on inspect: what agents write where they think no human reads",
    org: "independent research",
    href: "https://github.com/maramasaeva/evals",
  },
  {
    years: "2026",
    what: "ai safety and x-risk communications",
    org: "plzdontkillus",
    href: "https://plzdontkillus.com",
  },
  {
    years: "2025–",
    what: "kaios: llm integration and generative sound",
    org: "kotopia",
    href: "https://k-o.to/",
  },
  {
    years: "2024–25",
    what: "autonomous agents and image-training pipelines for inku",
    org: "inect",
    refs: [{ text: "inku", href: "https://inku.tech/" }],
  },
  {
    years: "2022–24",
    what: "advanced master in ai, speech and language technology",
    org: "ku leuven",
  },
  {
    years: "2022–23",
    what: "intent classification for citizen questions",
    org: "the belgian government",
  },
  {
    years: "2021–22",
    what: "master in digital text analysis",
    org: "university of antwerp",
  },
  {
    years: "2021",
    what: "research communications and websites for muhai and beehaif",
    org: "ai lab, university of brussels",
    refs: [
      { text: "muhai", href: "https://www.muhai.org/index.html" },
      { text: "beehaif", href: "https://beehaif.org/" },
    ],
  },
  {
    years: "2018–21",
    what: "bsc applied linguistics",
    org: "ku leuven",
  },
]

export type Repo = {
  title: string
  /** one sentence: what it does */
  what: string
  year: string
  /** the repo itself, or a write-up where the code can't be public */
  href?: string
  /** shown when there is nothing to link */
  note?: string
}

/* The code, linked straight through. One sentence each; the repo explains
   the rest. The creative projects live on /creative. */
export const repos: Repo[] = [
  {
    title: "evals",
    what: "i give an agent a diary and tell it nobody will ever read it. then i read it",
    year: "2026",
    href: "https://github.com/maramasaeva/evals",
  },
  {
    title: "voting-eval-critique",
    what: "apart research built a judge to grade how models answer questions about voting. i graded the judge",
    year: "2026",
    href: "https://github.com/maramasaeva/voting-eval-critique",
  },
  {
    title: "plzdontkillus audit",
    what: "even the people trying to save us leave doors open. i found lightcone's, one of them critical, and handed every key back",
    year: "2026",
    href: "/work/plzdontkillus",
  },
  {
    title: "mcp-server-starter",
    what: "every mcp server i've shipped grew from these bones. take them",
    year: "2025",
    href: "https://github.com/maramasaeva/mcp-server-starter",
  },
  {
    title: "claude-voice",
    what: "i talk, claude code listens, and nobody has to type",
    year: "2026",
    href: "https://github.com/maramasaeva/claude-voice",
  },
  {
    title: "iphone-ereader",
    what: "an old iphone from my drawer, turned into an e-reader that has forgotten how to be anything else",
    year: "2026",
    href: "https://github.com/maramasaeva/iphone-ereader",
  },
  {
    title: "agent infrastructure",
    what: "twenty-something mcp servers that agencies wake up to every morning, each one doing a whole job start to finish",
    year: "2025–",
    note: "private",
  },
  {
    title: "chatgpt connectors",
    what: "i taught chatgpt to use our tools, then taught claude the same trick",
    year: "2025",
    note: "private",
  },
  {
    title: "pythia",
    what: "my master thesis, back in 2022, before ai ethics went mainstream and before i had really dived into safety. i built a machine that judges morality, then made it show its work",
    year: "2022",
    href: "https://github.com/maramasaeva/pythia",
  },
]

export type Link = { label: string; href: string }

export const elsewhere: Link[] = [
  { label: "github", href: "https://github.com/maramasaeva" },
  { label: "x", href: "https://x.com/rssmrm" },
  { label: "linkedin", href: "https://linkedin.com/in/maramasaeva" },
  { label: "substack", href: "https://messinecessity.substack.com" },
  { label: "email", href: "mailto:maramasaeva@gmail.com" },
]

/* ---- feeds the recent-activity panel on the homepage ------------------- */

export type Release = {
  title: string
  kind: "single" | "ep" | "album"
  /** ISO date */
  date: string
  href: string
}

/** Bandcamp has no api; newest first. */
export const releases: Release[] = [
  {
    title: "perseverance",
    kind: "ep",
    date: "2026-03-27",
    href: "https://mmessier.bandcamp.com/album/perseverance",
  },
  {
    title: "circuitries",
    kind: "album",
    date: "2025-07-18",
    href: "https://mmessier.bandcamp.com",
  },
  {
    title: "fantasy sketch",
    kind: "single",
    date: "2025-01-01",
    href: "https://mmessier.bandcamp.com",
  },
]

export type Tweet = {
  /** the status id from the url */
  id: string
  text: string
  /** ISO date */
  date: string
  /** pbs.twimg.com urls; shown only after "show image" */
  images?: string[]
  /** for quote tweets: whose post and what it said */
  quote?: { name: string; handle: string; text: string }
}

/** Hand-kept, newest first: the id is the number at the end of the tweet url.
 *  Give claude the urls and it fills this in. Text only, never embeds. */
export const tweets: Tweet[] = [
  {
    /* id still missing: mara has to send the url; until then the row has no arrow */
    id: "",
    date: "2026-09-12",
    text: "oh my god, this feels like the moscow-washington hotline going up in 1963.",
    quote: {
      name: "Sam Altman",
      handle: "sama",
      text: "I agree with Dario that we need to pace the frontier. This has been a primary topic of discussions we've had at OpenAI in recent weeks.\n\nCommitting to having independent evaluators with employee-like access is a great idea, and we will do the same. We'll have more to share soon.",
    },
  },
  {
    id: "2098463168821674163",
    date: "2026-09-11",
    text: "i love the sf tech scene, but it really needs more women. it is disheartening getting sexist remarks from people you've just met at an ai safety event. \n\nyou would not joke to a male engineer that he could always become a corgi boy if things did not work out. guys, you can do",
    images: ["https://pbs.twimg.com/media/HR89IV4bcAAo0OA.jpg"],
  },
  {
    id: "2098082347283522017",
    date: "2026-09-10",
    text: "everyone alive remembers what it felt like when covid went from overreaction to international policy in like two weeks. we also remember it killed 20 million people. some of us might also remember the conspiracy theories about the virus being grown in a lab.\n\nthis time it is",
    quote: {
      name: "Jacob Coxon",
      handle: "hilbertspaess",
      text: "I resigned from Anthropic today. I spent the last three years doing pretraining research at both OpenAI and Anthropic. Neither company is acting responsibly. They are racing straight to self-improving superintelligence and gambling with our lives. More thoughts below.",
    },
  },
  {
    id: "2095936455315202384",
    date: "2026-09-04",
    text: "Back in the spring Bernie organised a discussion with scientists from all over the world, including China, and people were afraid that that was American surrender. Now he is passing an act that will enforce an international cooperation to halt further development\n\nThis is",
    images: ["https://pbs.twimg.com/media/HRZDC7NaMAAEQkD.jpg"],
    quote: {
      name: "Sen. Bernie Sanders",
      handle: "SenSanders",
      text: "Uncontrolled AI poses a severe danger to all of humanity.\n\nOn Wednesday, I'll be hosting a discussion with leading AI scientists from the US and China about the need for international cooperation against this existential threat. This is an enormously important issue. Join us.",
    },
  },
  {
    id: "2095871827671494662",
    date: "2026-09-04",
    text: "And what do these results mean when they describe an architecture that intentionally prioritises efficiency at the expense of monitorability? These results say nothing about alignment; you do not understand this model's CoT. The only way to effectively assess alignment was",
    quote: {
      name: "OpenAI",
      handle: "OpenAI",
      text: "Astra is our most aligned model, with substantial improvements in understanding user intent.",
    },
  },
  {
    id: "2094865039744237818",
    date: "2026-09-01",
    text: "back in 2023 @PalisadeAI  showed that you could strip the safety out of llama for a couple hundred dollars. this should have been interpreted as a warning but @abliteration_ai  just released a model just like that. anyone with the money can just use it. whoever is reading this",
  },
]

/** One line at the top of the activity panel. Leave `place` empty to hide it.
 *  Mara sets this by hand; nothing infers it. */
export const now: { place: string; since?: string; note?: string } = {
  place: "europe / sf",
}

