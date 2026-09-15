import type { Metadata } from "next"
import { Cormorant_Garamond, Work_Sans } from "next/font/google"
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site"
import BinaryField from "@/components/BinaryField"
import Nav from "@/components/Nav"
import Footer from "@/components/Footer"
import Portrait from "@/components/Portrait"
import "./globals.css"

/* Cormorant Garamond for the prose, Work Sans for labels, nav and everything
   small. Cormorant is light and sits small on the line, so the body runs at
   weight 500 and the type scale in globals.css is a step larger. */
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["500", "600"],
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
})

const workSans = Work_Sans({
  variable: "--font-work-sans",
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  openGraph: {
    type: "website",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    creator: "@rssmrm",
  },
  alternates: { canonical: SITE_URL },
}

/* Person, deliberately without an address: see lib/site.ts */
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Mara Messier Masaeva",
  alternateName: "messier",
  url: SITE_URL,
  jobTitle: "AI Engineer",
  description: SITE_DESCRIPTION,
  sameAs: [
    "https://github.com/maramasaeva",
    "https://x.com/rssmrm",
    "https://linkedin.com/in/maramasaeva",
    "https://messinecessity.substack.com",
  ],
}

/* Applies a remembered dark choice before the first paint, so a returning
   visitor never sees the light page flash first. Anyone else gets light: the
   system preference is deliberately not consulted. Kept inline and tiny
   because it has to run ahead of everything else. */
const themeScript = `try{if(localStorage.getItem("theme")==="dark")document.documentElement.dataset.theme="dark"}catch(e){}`

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    /* the script above writes data-theme before react hydrates */
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body
        className={`${cormorant.variable} ${workSans.variable} font-serif text-body bg-bg text-fg`}
      >
        <Portrait />
        <BinaryField />
        <div className="relative z-10 mx-auto flex min-h-screen max-w-[46rem] flex-col px-5 pb-[var(--gap)] pt-[clamp(1.75rem,5vh,4rem)] sm:px-6">
          <Nav />
          <main className="flex-1 pt-[clamp(1.5rem,4.5vh,2.75rem)]">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
