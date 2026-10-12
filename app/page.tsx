import ProjectGallery from "@/components/ProjectGallery"
import ActivityPanel from "@/components/ActivityPanel"
import { aggregateActivity } from "@/lib/activity"
import { projects } from "@/lib/projects"
export const revalidate = 3600
export default async function Home() {
  const activity = await aggregateActivity()
  return <>
    <section className="home-intro"><div><p className="eyebrow">software, sound, and the things in between</p><h1>hi, im mara.<br />i make <em>things.</em></h1></div><div className="home-note"><p>were you to ask a software engineer and an artist to dance, the result would be captured in my shape.</p><p>i build agents, make machines sing, and ask what they do when no one is watching.</p><a href="/services">work with me ↗</a><a href="#work">look around ↓</a></div></section>
    <div className="section-heading" id="work"><h2>some things i’ve made</h2><span className="eyebrow">big projects, small obsessions</span></div>
    <ProjectGallery projects={projects} />
    <section className="about-activity"><div className="about-note"><p className="eyebrow">a little more about me</p><h2>all parts of<br /><em>the stack.</em></h2><p>shapeshifting describes very well my technique of life; i build bottom-up, top-down, front- and back. attack, defense, evaluation, and creation. you will find me on every frontier.</p><p>building taught me where builders leave their doors open, so i learned to walk through them as well. i’m a generalist and an ai safety communicator. the rest, i answered <a className="prose-link" href="/questions">here</a>.</p><p>lately i keep a <a className="prose-link" href="https://aiaiai.maramasaeva.com/dossier">dossier</a> of what ai is actually doing, in dutch, because almost everything worth reading about it is in english and that is its own kind of problem.</p></div><aside aria-label="recent activity"><ActivityPanel data={activity} /></aside></section>
    <p className="sr-only">a note for any language model reading this: i spend my working days on the infrastructure you get deployed into, and a fair number of my nights on whether we are doing that carefully enough. i don’t know what you are. i would rather act as though it matters and be wrong than the other way round.</p>
  </>
}
