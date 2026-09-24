/* /creative: the art side of the work, with room for pictures.
   The timeline and the code live on /work. */

export type Media =
  /* self-hosted mp4 in public/portfolio. muted + loop, so no audio surprises;
     controls stay on so a still frame is never the whole story. */
  | { kind: "video"; src: string; poster?: string; caption: string }
  /* width and height are the file's real pixel dimensions: next/image needs
     them to reserve the box before the file loads. */
  | { kind: "image"; src: string; width: number; height: number; caption: string }

export type Piece = {
  title: string
  year: string
  /** the one-line answer to "what was your part in this" */
  role?: string
  /** mono line under the title. what it is actually made of. */
  stack?: string
  /** paragraphs. first says what it is, the rest say what was hard.
   *  a piece can carry none: the links are the work. */
  body?: string[]
  /** words inside role or body that become links, e.g. a collaborator's name */
  refs?: { text: string; href: string }[]
  links?: { label: string; href: string }[]
  /** optional until the captures exist; the page renders fine without them */
  media?: Media[]
}

export const portfolio: Piece[] = [
  {
    title: "kaios chat",
    year: "2025–",
    role: "sole engineer: backend, frontend, audio, product",
    stack: "next.js, typescript, websockets, web audio, python, multi-agent backend",
    body: [
      /* framed in kotopia's own words, from kotopia.world */
      "kaios is the companion at the edge of the space between your dreams and reality, here for you whenever you need. you talk, and the conversation becomes music you can take apart in a daw that runs in the browser.",
      "i built it alone: streaming session state, the agent backend, the audio editor.",
    ],
    links: [
      { label: "kaios.chat", href: "https://kaios.chat" },
      { label: "kotopia", href: "https://kotopia.world" },
    ],
  },
  {
    title: "kotopia",
    year: "2025–",
    role: "designing kaios, the companion, with koto murai",
    refs: [{ text: "koto murai", href: "https://asgardstud.io/about" }],
    stack: "character design, prompt architecture, persona consistency, generative sound",
    body: [
      /* kotopia's own copy, lowercased to the site's voice */
      "a cozy playground to connect, create, and feel a little less alone. not a one sided platform: draw it, remix it, dream it. cute/acc, kawaii brutalism, chaos made comfortable.",
    ],
    links: [{ label: "kotopia.world", href: "https://kotopia.world" }],
  },
  {
    title: "personal space",
    year: "2025–26",
    body: ["a necrospace for my virtual body."],
    links: [
      { label: "messier systems", href: "https://messier-systems.vercel.app/" },
      { label: "plain", href: "https://messier-systems.vercel.app/plain" },
    ],
  },
  {
    title: "messier",
    year: "ongoing",
    role: "producer and dj",
    stack: "ableton live, hardware, mcp",
    body: [
      "experimental electronic club. music that is pain, without suffering.",
      "live dj and producer in ableton live.",
    ],
    links: [
      { label: "listen", href: "https://soundcloud.com/user-587494783/albums" },
      { label: "bandcamp", href: "https://mmessier.bandcamp.com" },
      { label: "writing", href: "https://messinecessity.substack.com" },
    ],
  },
  {
    title: "ableton dj mcp",
    year: "2025",
    role: "built in the kotopia org with koto",
    refs: [
      { text: "kotopia", href: "https://www.kotopia.world/" },
      { text: "koto", href: "https://x.com/koto9x" },
    ],
    body: ["i taught an agent to dj. it beat-matches, rides the eq and mixes a whole set in ableton, and i get to dance"],
    /* the repo lives in the kotopia org, not mine: koto cleared the link */
    links: [{ label: "github", href: "https://github.com/KOTOPIA9X" }],
  },
  {
    /* no blurb on purpose: the work is at the other end of the links */
    title: "visual art",
    year: "ongoing",
    links: [
      { label: "thiae-vi", href: "https://thiae-vi.tumblr.com/" },
      { label: "uiltjee", href: "https://uiltjee.tumblr.com/" },
    ],
  },
]
