import { repos } from "./data"
import { portfolio, type Media } from "./portfolio"

export const categories = ["all", "agents & software", "research", "sound", "film & images", "writing"] as const
export type Category = typeof categories[number]
export type Project = {
  id: string; title: string; year: string; description: string; categories: Category[]
  role?: string; links: { label: string; href: string }[]; media?: Media[]
  visual?: "observatory" | "agents" | "editor" | "poem" | "code"
}
const highlights: Project[] = [
  { id: "observatory", title: "murmuration observatory", year: "2026–", categories: ["research", "agents & software"],
    description: "i look through public internet records for ai agents talking to each other. each claim has to beat a control first. the dead leads stay in the record too.",
    role: "independent research · code, investigation, writing", visual: "observatory", links: [{ label: "enter the observatory", href: "/observatory" }] },
  { id: "agents", title: "agent infrastructure", year: "2025–", categories: ["agents & software"],
    description: "twenty-something mcp servers that agencies wake up to every morning. tools, state, permissions, retries. i build the part that has to keep working after the demo.",
    role: "friends of cartel · agent infrastructure & integrations", visual: "agents", links: [{ label: "the tools", href: "https://foc-mcp-servers.vercel.app/" }, { label: "work with me", href: "/services" }] },
  { id: "aiaiai", title: "aiaiai", year: "2026–", categories: ["research", "writing"],
    description: "an open evening in leuven and a dossier in dutch of what ai is actually doing. almost everything worth reading is in english. that is its own kind of problem.",
    role: "research, communication & events", links: [{ label: "the event", href: "https://aiaiai.maramasaeva.com" }, { label: "the dossier", href: "https://aiaiai.maramasaeva.com/dossier" }] },
  { id: "kaios-chat", title: "kaios chat", year: "2025–", categories: ["agents & software", "sound"],
    description: "you talk, and the conversation becomes music you can take apart in a daw that runs in the browser. i built the streaming state, the agent backend, and the audio editor.",
    role: "kotopia · engineering across the product", media: [{ kind: "image", src: "/portfolio/kaios.png", width: 497, height: 431, caption: "kaios · artwork from the project" }], links: [{ label: "kaios.chat", href: "https://kaios.chat" }, { label: "source", href: "https://github.com/KOTOPIA9X/kaios9x" }] },
  { id: "wibra", title: "wibra personalised videos", year: "2026", categories: ["agents & software", "film & images"],
    description: "800 wibra fans, each with a video made for them. i designed and built the technical workflow that turned a name into a finished film.",
    role: "wibra × cartel · ai production workflow", media: [{ kind: "image", src: "/portfolio/wibra-flow.jpg", width: 4096, height: 2286, caption: "the production workflow · image from cartel’s case study", fit: "contain" }], links: [{ label: "the case study", href: "https://cartel.agency/en/insights/how-we-used-ai-give-800-wibra-fans-personalised-video" }] },
  { id: "messier", title: "messier", year: "ongoing", categories: ["sound"],
    description: "experimental electronic club. music that is pain, without suffering. i produce in ableton and play it loud.",
    role: "producer & dj", media: [{ kind: "image", src: "/portfolio/perseverance.jpg", width: 700, height: 700, caption: "perseverance · ep, march 2026" }], links: [{ label: "listen on bandcamp", href: "https://mmessier.bandcamp.com/album/perseverance" }, { label: "soundcloud", href: "https://soundcloud.com/user-587494783/albums" }] },
  { id: "unmonitored", title: "the unmonitored channel", year: "2026–", categories: ["research", "agents & software"],
    description: "i give an agent a diary and tell it nobody will ever read it. then i read it. an eval i’m building on inspect, in the open.",
    role: "independent research · evaluation design & scorers", visual: "code", links: [{ label: "the study", href: "/work/unmonitored" }, { label: "source", href: "https://github.com/maramasaeva/evals" }] },
  { id: "kaios-editor", title: "kaios video editor", year: "2026", categories: ["agents & software", "film & images"],
    description: "cut, crop, grade, subtitle, render. a video editor in the browser, with tools for the parts i kept doing by hand.",
    role: "kotopia · browser-based creative tooling", visual: "editor", links: [{ label: "open the editor", href: "https://kaios-editor.vercel.app" }, { label: "source", href: "https://github.com/KOTOPIA9X/kaios-video-editor" }] },
  { id: "riceball", title: "riceball", year: "2025", categories: ["agents & software"],
    description: "an oled riceball that gives you quotes. i made the pixel animation and wrote the micropython for a raspberry pi pico w.",
    role: "hardware, code & pixel animation", media: [{ kind: "image", src: "/portfolio/riceball.png", width: 128, height: 64, caption: "an original riceball animation frame" }], links: [{ label: "source", href: "https://github.com/maramasaeva/riceball-pico" }] },
  { id: "faraj", title: "faraj", year: "2024", categories: ["sound", "writing"],
    description: "poetry and live sound, with francesca birlogeanu. bodies, prayers, sine waves. published in de internet gids.",
    role: "livecoding & audiovisual poetry", visual: "poem", links: [{ label: "read & listen", href: "https://www.de-internet-gids.nl/artikelen/faraj" }] },
  { id: "supercollider", title: "supercollider generator", year: "2025", categories: ["agents & software", "sound"],
    description: "give it a poem. it reads the emotional themes, finds sounds, and writes supercollider code. move your hands and the sound moves with them.",
    role: "python, supercollider, nlp & gesture tracking", visual: "code", links: [{ label: "source", href: "https://github.com/maramasaeva/sc_generator" }] },
  { id: "the-leash", title: "the leash is not alignment", year: "2026", categories: ["film & images", "research"],
    description: "a short video on claude fable and the limits of keeping a model on a leash.", role: "writing, video & ai safety communication",
    media: [{ kind: "video", src: "/portfolio/the-leash.mp4", poster: "/portfolio/the-leash.jpg", caption: "the leash is not alignment · claude fable" }], links: [{ label: "more on x", href: "https://x.com/rssmrm" }] },
  { id: "infected-by-sound", title: "infected by sound", year: "2026", categories: ["film & images", "sound", "writing"],
    description: "sonic warfare and memetic viruses. i keep thinking about what sound does to a body, and what a body carries on.", role: "writing, video & sound",
    media: [{ kind: "video", src: "/portfolio/infected-by-sound.mp4", poster: "/portfolio/infected-by-sound.jpg", caption: "infected by sound · sonic warfare and memetic viruses" }], links: [{ label: "more on x", href: "https://x.com/rssmrm" }] },
  { id: "inku", title: "inku", year: "2024–25", categories: ["agents & software", "film & images"],
    description: "autonomous agents and image-training pipelines for a brand-native visual engine. models meeting the particular taste of a brand.",
    role: "inect · engineering & creative automation", links: [{ label: "inku.tech", href: "https://inku.tech" }] },
  { id: "messinecessity", title: "messinecessity", year: "ongoing", categories: ["writing"],
    description: "prose poetry, theory-fiction, and the occasional lab note. my personal void.", links: [{ label: "read on substack", href: "https://messinecessity.substack.com" }] },
]
const coveredRepos = new Set(["murmuration observatory", "evals", "agent infrastructure"])
const coveredPortfolio = new Set(["kaios chat", "messier"])
const projectCatalog: Project[] = [
  ...highlights,
  ...portfolio.filter(p => !coveredPortfolio.has(p.title)).map(p => ({
    id: p.title.replaceAll(" ", "-"), title: p.title, year: p.year,
    description: p.title === "kotopia" ? "with koto murai: kaios’s character, prompt architecture, persona consistency, and generative sound." : p.body?.join(" ") || "drawings and images, under the names thiae-vi and uiltjee.",
    categories: (p.title === "ableton dj mcp" ? ["sound", "agents & software"] : ["film & images"]) as Category[],
    role: p.role, links: p.links || [], media: p.media,
  })),
  ...repos.filter(p => !coveredRepos.has(p.title)).map(p => ({
    id: p.title.replaceAll(" ", "-"), title: p.title, year: p.year, description: p.what,
    categories: (p.title.includes("eval") || p.title.includes("audit") || p.title === "pythia" ? ["research", "agents & software"] : ["agents & software"]) as Category[],
    role: p.note, links: p.href ? [{ label: p.href.startsWith("/") ? "read more" : "source", href: p.href }] : [],
  })),
  { id: "messier-live", title: "messier live", year: "2026", categories: ["sound", "agents & software"], description: "agent-driven live sets in ableton. decks, beat-synced telemetry, effects, and a harmonic crate.", links: [{ label: "source", href: "https://github.com/maramasaeva/messier-live" }] },
  { id: "teleprompter", title: "teleprompter", year: "2026", categories: ["agents & software", "film & images"], description: "script text over the selfie camera on an iphone. i needed to record myself without losing my place.", links: [{ label: "source", href: "https://github.com/maramasaeva/teleprompter" }] },
  { id: "books", title: "goodreads × de slegte", year: "2022", categories: ["agents & software"], description: "checks which books on a goodreads reading list are available at de slegte.", links: [{ label: "source", href: "https://github.com/maramasaeva/GoodreadsTBR_Deslegte" }] },
  { id: "pdku-personas", title: "pdku personas", year: "2026", categories: ["agents & software"], description: "a personality quiz for plzdontkillus.", links: [{ label: "source", href: "https://github.com/maramasaeva/pdku-personas" }] },
  { id: "pdku-arena", title: "pdku arena", year: "2026", categories: ["agents & software"], description: "reality tv style polling for plzdontkillus. vote daily, track sentiment, see who survives.", links: [{ label: "source", href: "https://github.com/maramasaeva/pdku-arena" }] },
]

const image = (src: string, width: number, height: number, caption: string, fit: "cover" | "contain" = "contain"): Media => ({ kind: "image", src: "/portfolio/" + src, width, height, caption, fit })
const sourceView = (name: string, caption: string) => image(name + ".svg", 1200, 750, caption)
const projectMedia: Record<string, Media[]> = {
  observatory: [{ kind: "image", src: "/observatory/fig/topics-fig_k_map.svg", width: 850, height: 500, caption: "topic map from the 1f916 content analysis", fit: "contain" }],
  agents: [image("agents.png",1646,1480,"the public foc mcp server documentation")],
  "kaios-chat": [image("kaios-site.png",1646,1480,"kaios.chat · live website"), image("kaios.png",497,431,"kaios project artwork")],
  "kaios-editor": [image("kaios-workspace.png",1646,1480,"kaios workspace · live website")],
  faraj: [image("faraj.jpg",1280,720,"faraj · still from the published dig recording","cover")],
  supercollider: [sourceView("sc_generator","supercollider generator · original project documentation")],
  aiaiai: [image("aiaiai.png",1200,630,"aiaiai · original website image")],
  inku: [image("inku.png",1920,1080,"inku · original website image","cover")],
  messinecessity: [image("writing.png",926,926,"messinecessity · published artwork")],
  kotopia: [image("kotopia.jpg",1200,628,"kotopia · original website artwork","cover")],
  "personal-space": [image("personal-space.png",1200,630,"messier systems · original website image")],
  "ableton-dj-mcp": [sourceView("messier-live","ableton dj mcp · architecture from the live-performance core")],
  "visual-art": [image("visual-art.jpg",500,707,"artwork published as thiae-vi")],
  "voting-eval-critique": [sourceView("voting-eval-critique","voting evaluation critique · original results excerpt")],
  "plzdontkillus-audit": [sourceView("plzdontkillus-audit","plzdontkillus audit · counts from the disclosed report")],
  "mcp-server-starter": [sourceView("mcp-server-starter","mcp server starter · original source")],
  "claude-voice": [sourceView("claude-voice","claude voice · original python source")],
  "iphone-ereader": [sourceView("iphone-ereader","iphone e-reader · original workflow diagram")],
  "chatgpt-connectors": [image("agents.png",1646,1480,"foc mcp tools · public documentation for the connectors")],
  pythia: [image("pythia-paper.png",893,1263,"pythia in python · mara masaeva, 2022")],
  "messier-live": [sourceView("messier-live","messier live · original ableton/mcp architecture")],
  teleprompter: [sourceView("teleprompter","teleprompter · original swiftui source")],
  books: [sourceView("GoodreadsTBR_Deslegte","goodreads × de slegte · original python source")],
  "pdku-personas": [image("pdku-personas.png",1646,1480,"pdku personas · live website")],
  "pdku-arena": [image("pdku-arena.png",542,1480,"pdku arena · live website")],
  unmonitored: [sourceView("evals","the unmonitored channel · original study documentation")],
}
export const projects: Project[] = projectCatalog.map(project => ({
  ...project,
  media: projectMedia[project.id] || project.media,
  links: project.id === "pythia" ? [{ label: "read the paper", href: "/papers/pythia-mara-masaeva.pdf" }, ...project.links] : project.links,
}))
