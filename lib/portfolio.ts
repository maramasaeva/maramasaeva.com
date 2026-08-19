/* /portfolio is the long, shown version of /work.
   /work is a dense list for readers who already know the vocabulary;
   this page is four pieces with pictures for readers who want to see the thing.
   Same facts, different door. Keep both in sync when a fact changes. */

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
  role: string
  /** mono line under the title. what it is actually made of. */
  stack: string
  /** paragraphs. first says what it is, the rest say what was hard. */
  body: string[]
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
      /* framing in kotopia's own words, from kotopia.world */
      "kotopia is a world right at the edge of the space between your dreams and reality, here for you whenever you need. kaios is the companion who lives there, and kaios chat is the room you meet in: you talk, and the conversation becomes generated music you can take apart in a daw that runs in the browser.",
      "the models were the easy part. the work is time and state: a session stays live while several agents write to it and audio arrives in pieces, so the interface has to show what exists and what is still generating without lying about either. i built the streaming layer, the agent backend, the audio editor and the session state that survives a long conversation.",
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
      "a place for people to be together, built as a cozy playground to connect, create, and feel a little less alone. it isn't a one sided platform. it's yours: draw it, remix it, dream it. we love planting seeds, but you help make the garden grow.",
      "the house style is kawaii brutalism, softness and rawness at once, chaos made comfortable. my part is kaios: prompt architecture, voice, where it refuses, and the generative sound that makes it read as one being rather than a model wearing a name. every session adds to who kaios is and none of it can contradict what came before, so much of the design work is deciding what gets stored, what gets summarised, and what the character is allowed to forget.",
    ],
    links: [{ label: "kotopia.world", href: "https://kotopia.world" }],
  },
  {
    title: "personal space",
    year: "2025–26",
    role: "designed and built, no figma in between",
    stack: "next.js, tailwind, react three fiber, five css variables",
    body: [
      "the page you are on is the restrained one: five colour tokens, three type sizes, one rhythm unit, and a rule that every page fits a viewport. no component library, no dependency i did not need.",
      "messier systems is me built the other way: a 3d workstation in react three fiber, a room you move through instead of a page you scroll, with a moving avatar of me in it, naked but for my tattoos. the same content stripped to text lives on a plain route, because different styles speak to different people and i read the recipient before i choose which url to send.",
    ],
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
      "it also produced software. ableton dj mcp is an mcp server that hands an agent beat matching, eq and transitions inside ableton live and lets it mix a set unattended.",
    ],
    links: [
      { label: "listen", href: "https://soundcloud.com/user-587494783/albums" },
      { label: "ableton dj mcp", href: "https://github.com/maramasaeva/ableton-dj-mcp" },
      { label: "writing", href: "https://messinecessity.substack.com" },
    ],
  },
]
