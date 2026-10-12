import type { Metadata } from "next"
import ProjectGallery from "@/components/ProjectGallery"
import PageHeading from "@/components/PageHeading"
import { projects } from "@/lib/projects"
export const metadata: Metadata = { title: "creative", description: "kaios, kotopia, music, livecoding, films and images." }
export default function Creative() {
  return <><PageHeading title="creative" note="sound / film / images / words"><p>music, livecoding, videos, visual art, and the things i make with kotopia.</p></PageHeading><ProjectGallery projects={projects.filter(p => p.categories.some(c => ["sound", "film & images", "writing"].includes(c)))} /></>
}
