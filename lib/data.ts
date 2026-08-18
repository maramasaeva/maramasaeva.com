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
    years: "2026",
    what: "ai safety and x-risk communications",
    org: "plzdontkillus",
    href: "https://plzdontkillus.com",
  },
  {
    years: "2025–",
    what: "agent infrastructure and evaluation harnesses",
    org: "friends of cartel",
    href: "https://friendsofcartel.com",
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

export type Work = {
  title: string
  blurb: string
  year: string
  href?: string
  /** shown in place of a link when the source can't be public */
  note?: string
}

/* Newest first, and one sentence each: the page has to fit a viewport,
   so every blurb keeps its single hardest fact and drops the rest. */
export const selected: Work[] = [
  {
    title: "cross-lingual value drift",
    blurb:
      "an eval on inspect that asks the same value-laden question in matched translations and measures whether the answer moves along a named axis.",
    year: "2026",
    note: "in progress",
  },
  {
    title: "plzdontkillus security audit",
    blurb:
      "37 findings across an api, a frontend, dns and the infrastructure behind it: one critical, twelve high, all disclosed.",
    year: "2026",
    href: "/work/plzdontkillus",
  },
  {
    title: "agent infrastructure in production",
    blurb:
      "more than twenty mcp servers on azure container apps, each encoding a whole workflow from style-learning to compliance validation.",
    year: "2025–",
    note: "private",
  },
  {
    title: "chatgpt agent-mode connectors",
    blurb:
      "mcp servers as chatgpt connectors: oauth 2.1 and a manifest generated at runtime, later re-pointed at claude desktop.",
    year: "2025",
    note: "private",
  },
  {
    title: "ableton dj mcp",
    blurb:
      "an mcp server that gives an agent beat matching, eq and transitions in ableton live, and lets it mix a set unattended.",
    year: "2025",
    href: "https://github.com/maramasaeva/ableton-dj-mcp",
  },
  {
    title: "pythia",
    blurb:
      "a moral judgement classifier: roberta and bert against svm baselines, with shap to see which tokens moved a prediction.",
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
