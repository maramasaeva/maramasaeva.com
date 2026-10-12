import { NextResponse, type NextRequest } from "next/server"
import { COOKIE } from "@/lib/desk/auth"
import { FLOW_COOKIE } from "@/lib/desk/google-auth"
import { json, sameSite } from "@/lib/desk/route-helpers"

export const dynamic = "force-dynamic"

export async function POST() {
  return json({error:"Use Google sign-in at /api/desk/google/start."},405)
}

export async function DELETE(req: NextRequest) {
  if (!sameSite(req)) return json({ error: "cross-site request" }, 403)
  const res = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } })
  const options={value:"",maxAge:0,httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax" as const}
  res.cookies.set({ name: COOKIE, path: "/", ...options })
  res.cookies.set({name:FLOW_COOKIE,path:"/api/desk/google",...options})
  return res
}
