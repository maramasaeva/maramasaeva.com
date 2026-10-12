import { cookies } from "next/headers"
import { createDeskSession, googleAuthConfigured, readDeskSession, SESSION_MAX_AGE, validateDeskSession, type GoogleIdentity } from "./google-auth"

export const COOKIE = "desk"
export const deskConfigured = googleAuthConfigured
export const cookieOk = validateDeskSession

/** true when the request carries a valid desk cookie */
export async function isDesk() {
  const jar = await cookies()
  return cookieOk(jar.get(COOKIE)?.value)
}
export async function getDeskIdentity() {
  const jar=await cookies()
  return readDeskSession(jar.get(COOKIE)?.value)
}

export function sessionCookie(identity: GoogleIdentity) {
  return {
    name: COOKIE,
    value: createDeskSession(identity),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  }
}
