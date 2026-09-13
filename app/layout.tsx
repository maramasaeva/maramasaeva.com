import type { Metadata } from "next"
import { Instrument_Serif } from "next/font/google"
import localFont from "next/font/local"
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site"
import BinaryField from "@/components/BinaryField"
import Nav from "@/components/Nav"
import Footer from "@/components/Footer"
import "./globals.css"

/* Instrument Serif for the prose, Satoshi (self-hosted, see app/fonts) for
   labels, nav and everything small. */
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
})

const satoshi = localFont({
  variable: "--font-satoshi",
  display: "swap",
  src: [
    { path: "./fonts/Satoshi-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Satoshi-Italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/Satoshi-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Satoshi-Bold.woff2", weight: "700", style: "normal" },
  ],
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
        className={`${instrumentSerif.variable} ${satoshi.variable} font-serif text-body bg-bg text-fg`}
      >
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
