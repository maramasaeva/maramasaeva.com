import { NextResponse, type NextRequest } from "next/server"
import { sessionCookie } from "@/lib/desk/auth"
import { finishGoogleLogin, FLOW_COOKIE, googleAuthConfig, validateGoogleFlow } from "@/lib/desk/google-auth"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export async function GET(req: NextRequest) {
  let destination="https://maramasaeva.com/desk?login=failed"
  let identity: Awaited<ReturnType<typeof finishGoogleLogin>> | null=null
  try {
    const config=googleAuthConfig();destination=new URL("/desk?login=failed",config.origin).toString()
    if(req.nextUrl.origin!==config.origin)throw new Error("invalid-origin")
    const flow=validateGoogleFlow(req.cookies.get(FLOW_COOKIE)?.value,req.nextUrl.searchParams.get("state"))
    if(req.nextUrl.searchParams.has("error"))throw new Error("google-login-denied")
    identity=await finishGoogleLogin(req.nextUrl.searchParams.get("code")||"",flow)
    destination=new URL("/desk/app",config.origin).toString()
  } catch { /* Never echo OAuth errors, codes, tokens or secrets to the browser. */ }
  const res=NextResponse.redirect(destination)
  res.headers.set("Cache-Control","no-store");res.headers.set("Referrer-Policy","no-referrer")
  res.cookies.set({name:FLOW_COOKIE,value:"",maxAge:0,path:"/api/desk/google",httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax"})
  if(identity)res.cookies.set(sessionCookie(identity))
  return res
}
