import { NextResponse, type NextRequest } from "next/server"
import { beginGoogleLogin, FLOW_COOKIE, FLOW_MAX_AGE, googleAuthConfig } from "@/lib/desk/google-auth"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export async function GET(req: NextRequest) {
  try {
    const config=googleAuthConfig()
    if (req.nextUrl.origin !== config.origin) return NextResponse.redirect(new URL("/desk",config.origin))
    const flow=beginGoogleLogin()
    const res=NextResponse.redirect(flow.url)
    res.headers.set("Cache-Control","no-store");res.headers.set("Referrer-Policy","no-referrer")
    res.cookies.set({name:FLOW_COOKIE,value:flow.cookie,httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/api/desk/google",maxAge:FLOW_MAX_AGE})
    return res
  } catch {
    return NextResponse.json({error:"Google sign-in is not configured yet."},{status:503,headers:{"Cache-Control":"no-store"}})
  }
}
