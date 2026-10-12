"use client"
import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { categories, type Category, type Project } from "@/lib/projects"
import type { Media } from "@/lib/portfolio"

function ImageViewer({ media, close }: { media: Extract<Media, { kind: "image" }>; close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => { dialog.current?.showModal() }, [])
  return <dialog ref={dialog} className="image-viewer" aria-label={media.caption} onCancel={event => { event.preventDefault(); close() }}>
    <header><p>{media.caption}</p><button onClick={close} aria-label="close image">close ×</button></header>
    <Image src={media.src} width={media.width} height={media.height} alt={media.caption} unoptimized sizes="100vw" />
  </dialog>
}

export function ProjectVisual({ project }: { project: Project }) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [enlarged, setEnlarged] = useState(false)
  const media = project.media?.[index]
  if (!media) return null
  const embed = project.id === "faraj" ? "https://player.vimeo.com/video/1010668878?autoplay=0&dnt=1" : project.id === "messier" ? "https://bandcamp.com/EmbeddedPlayer/album=3155715685/size=large/bgcol=fdfcfb/linkcol=a52a5f/tracklist=false/artwork=small/transparent=true/" : null
  return <div className={`project-visual visual-${project.id} ${media.kind === "image" && media.fit === "contain" ? "contain-image" : ""}`}>
    {media.kind === "video" ? <video src={media.src} poster={media.poster} controls muted playsInline preload="none" aria-label={media.caption} /> :
      <Image src={media.src} alt={media.caption} width={media.width} height={media.height} unoptimized={media.src.endsWith(".svg")} sizes="(max-width: 700px) 100vw, 50vw" />}
    {media.kind === "image" && !playing && <button className="view-project-image" onClick={() => setEnlarged(true)} aria-label={`view image for ${project.title}`}>⤢</button>}
    {enlarged && media.kind === "image" && <ImageViewer media={media} close={() => setEnlarged(false)} />}
    {embed && (playing ? <iframe className={project.id === "messier" ? "music-player" : "film-player"} src={embed} title={project.id === "messier" ? "perseverance on bandcamp" : "faraj · published recording"} allow="fullscreen; picture-in-picture" /> : <button className="play-project" onClick={() => setPlaying(true)}>{project.id === "messier" ? "listen" : "watch the recording"} <span aria-hidden>▷</span></button>)}
    {(project.media?.length || 0) > 1 && <div className="media-switch"><span>{index + 1} / {project.media!.length}</span><button onClick={() => { setPlaying(false); setIndex((index + 1) % project.media!.length) }} aria-label={`next image for ${project.title}`}>next →</button></div>}
  </div>
}

export default function ProjectGallery({ projects, initialCategory = "all" }: { projects: Project[]; initialCategory?: Category }) {
  const [category, setCategory] = useState<Category>(initialCategory)
  const visible = projects.filter(p => category === "all" || p.categories.includes(category))
  return <section className="project-gallery" aria-label="projects">
    <div className="gallery-toolbar"><div className="gallery-filters" role="group" aria-label="filter projects">{categories.map(c => <button key={c} aria-pressed={category === c} onClick={() => setCategory(c)}>{c}</button>)}</div><span className="eyebrow" role="status">{visible.length} projects</span></div>
    <div className="project-grid">{visible.map(p => <article key={p.id} id={p.id} className="project-card">
      <ProjectVisual project={p} />
      <div className="project-copy"><div className="project-meta"><span>{p.year}</span><span>{p.categories.join(" / ")}</span></div><h3>{p.title}</h3><p>{p.description}</p>{p.role && <p className="project-role">{p.role}</p>}<div className="project-links">{p.links.map(link => <a key={link.href} href={link.href} {...(link.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>{link.label} <span aria-hidden>↗</span></a>)}</div></div>
    </article>)}</div>
  </section>
}
