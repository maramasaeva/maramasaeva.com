"use client"
import { usePathname } from "next/navigation"
import Nav from "./Nav"
import Footer from "./Footer"
import BinaryField from "./BinaryField"
import Portrait from "./Portrait"
export default function SiteFrame({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  if (path === "/desk" || path.startsWith("/desk/") || path === "/dashboard") return <div className="desk-frame"><div className={path === "/desk/x" || path === "/desk/replies" ? "legacy-desk" : undefined}>{children}</div></div>
  const wide = ["/", "/work", "/creative", "/services", "/writing"].includes(path)
  return <><Portrait /><BinaryField /><div className="site-shell"><a href="#main" className="skip-link">skip to content</a><Nav /><main id="main" className={`site-main ${wide ? "wide-page" : "reading-page"}`}>{children}</main><Footer /></div></>
}
