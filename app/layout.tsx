import type { Metadata } from "next"
import { Newsreader, DM_Mono } from "next/font/google"
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site"
import BinaryField from "@/components/BinaryField"
import Nav from "@/components/Nav"
import Footer from "@/components/Footer"
import "./globals.css"

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
})

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  weight: ["300", "400"],
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
  name: "Mara Masaeva",
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body
        className={`${newsreader.variable} ${dmMono.variable} font-serif text-body bg-bg text-fg`}
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
