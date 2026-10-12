export default function PageHeading({ title, note, children }: { title: string; note?: string; children?: React.ReactNode }) {
  return <header className="page-heading">{note && <p className="eyebrow">{note}</p>}<h1>{title}</h1>{children && <div className="page-intro">{children}</div>}</header>
}
