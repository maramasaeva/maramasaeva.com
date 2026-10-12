"use client"
import { usePathname } from "next/navigation"
import Nav from "./Nav"
import Footer from "./Footer"
import BinaryField from "./BinaryField"
import Portrait from "./Portrait"
export default function SiteFrame({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  if (path === "/desk" || path.startsWith("/desk/") || path === "/dashboard") return <div className="desk-frame">{children}</div>
  const wide = ["/", "/work", "/creative", "/services", "/writing"].includes(path)
  return <><Portrait /><BinaryField /><div className="site-shell"><a href="#main" className="skip-link">skip to content</a><Nav /><main id="main" className={`site-main ${wide ? "wide-page" : "reading-page"}`}>{children}</main><Footer /></div></>
}
