"use client"
import { useState } from "react"
import Image from "next/image"
import { categories, type Category, type Project } from "@/lib/projects"

export function ProjectVisual({ project }: { project: Project }) {
  const [index, setIndex] = useState(0)
  const media = project.media?.[index]
  if (media) return <div className={`project-visual visual-${project.id}`}>
    {media.kind === "video" ? <video src={media.src} poster={media.poster} controls muted playsInline preload="none" aria-label={media.caption} /> :
      <Image src={media.src} alt={media.caption} width={media.width} height={media.height} sizes="(max-width: 700px) 100vw, 50vw" />}
    {(project.media?.length || 0) > 1 && <div className="media-switch"><span>{index + 1} / {project.media!.length}</span><button onClick={() => setIndex((index + 1) % project.media!.length)} aria-label={`next image for ${project.title}`}>next →</button></div>}
  </div>
  if (project.visual === "observatory") return <div className="project-visual visual-observatory">
    <div className="visual-label">murmuration / field notes</div><div className="observatory-title">are they<br /><em>talking?</em></div>
    <Image src="/observatory/fig/topics-fig_k_map.svg" alt="topic map from the 1f916 content analysis" width={850} height={500} unoptimized />
    <span className="visual-caption">public traces. controls. a record you can check.</span>
  </div>
  if (project.visual === "agents") return <div className="project-visual visual-agents"><span className="visual-label">agent infrastructure / mcp</span>
    <div className="agent-flow"><span>the question</span><b>↓</b><span>agent + tools</span><b>↓</b><div><span>state</span><span>permissions</span><span>evaluation</span></div><b>↓</b><span>the whole job, done</span></div><span className="visual-caption">a map of what i build</span></div>
  if (project.visual === "poem") return <div className="project-visual visual-poem"><span className="visual-label">francesca birlogeanu × mara messier</span><span className="poem-title">faraj</span><span className="visual-caption">poetry / livecoding / de internet gids</span></div>
  if (project.visual === "editor") return <div className="project-visual visual-editor"><span className="visual-label">kaios / browser video editor</span><span className="editor-title">cut. crop.<br /><em>make it move.</em></span><div className="editor-strip" aria-hidden><span /><span /><span /><span /></div><span className="visual-caption">editing · colour · subtitles · sound</span></div>
  if (project.visual === "code") return <div className="project-visual visual-code"><span className="visual-label">{project.id === "supercollider" ? "poem → sound" : "inspect / evaluation design"}</span><pre>{project.id === "supercollider" ? "poem\n  ↓ emotional themes\n  ↓ audio matching\n  ↓ supercollider code\n  ↓\nlive sound" : "same task. three conditions.\n\nunmonitored    no human reads\nmonitored      notes are reviewed\nunspecified    no audience named\n\ncompare the reply with the notes."}</pre><span className="visual-caption">{project.role}</span></div>
  return null
}

export default function ProjectGallery({ projects, initialCategory = "all" }: { projects: Project[]; initialCategory?: Category }) {
  const [category, setCategory] = useState<Category>(initialCategory)
  const visible = projects.filter(p => category === "all" || p.categories.includes(category))
  return <section className="project-gallery" aria-label="project archive">
    <div className="gallery-toolbar"><div className="gallery-filters" role="group" aria-label="filter projects">{categories.map(c => <button key={c} aria-pressed={category === c} onClick={() => setCategory(c)}>{c}</button>)}</div><span className="eyebrow" role="status">{visible.length} projects</span></div>
    <div className="project-grid">{visible.map(p => <article key={p.id} id={p.id} className={`project-card ${p.media || p.visual ? "has-visual" : "text-project"}`}>
      <ProjectVisual project={p} />
      <div className="project-copy"><div className="project-meta"><span>{p.year}</span><span>{p.categories.join(" / ")}</span></div><h3>{p.title}</h3><p>{p.description}</p>{p.role && <p className="project-role">{p.role}</p>}<div className="project-links">{p.links.map(link => <a key={link.href} href={link.href} {...(link.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>{link.label} <span aria-hidden>↗</span></a>)}</div></div>
    </article>)}</div>
  </section>
}
