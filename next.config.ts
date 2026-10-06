import type { NextConfig } from "next"

/* Plain hardening headers for every response. No CSP here: next's inline
   hydration scripts would need per-request nonces, and the site loads no
   third-party script at all, so the win would be small. */
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  /* /about merged into /work and /portfolio became /creative (2026-09-24);
     old links keep landing somewhere. */
  async redirects() {
    return [
      { source: "/about", destination: "/work", permanent: true },
      { source: "/portfolio", destination: "/creative", permanent: true },
    ]
  },
  /* Murmuration observatory: static pages in public/observatory. */
  async rewrites() {
    return [
      { source: "/observatory", destination: "/observatory/index.html" },
      { source: "/observatory/fleet", destination: "/observatory/fleet.html" },
      { source: "/observatory/data", destination: "/observatory/data.html" },
      { source: "/observatory/info", destination: "/observatory/info.html" },
      { source: "/observatory/1f916", destination: "/observatory/1f916.html" },
    ]
  },
  async headers() {
    return [{ source: "/(.*)", headers: SECURITY_HEADERS }]
  },
}

export default nextConfig
