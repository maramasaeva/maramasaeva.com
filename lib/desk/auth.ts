import { createHmac, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"

/* One user, one passphrase. The cookie holds an hmac of a fixed label under
   the passphrase, so it never carries the passphrase itself and changing the
   passphrase logs every device out. */

export const COOKIE = "desk"
const MAX_AGE = 60 * 60 * 24 * 30

export const deskConfigured = () => (process.env.DESK_PASSPHRASE?.length ?? 0) >= 12

function token(passphrase: string) {
  return createHmac("sha256", passphrase).update("desk-session-v1").digest("hex")
}

function same(a: string, b: string) {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

export const passphraseOk = (given: unknown) =>
  deskConfigured() && typeof given === "string" && same(given.normalize("NFC").trim(), process.env.DESK_PASSPHRASE!)

export const cookieOk = (value: string | undefined) =>
  deskConfigured() && !!value && same(value, token(process.env.DESK_PASSPHRASE!))

/** true when the request carries a valid desk cookie */
export async function isDesk() {
  const jar = await cookies()
  return cookieOk(jar.get(COOKIE)?.value)
}

export function sessionCookie() {
  return {
    name: COOKIE,
    value: token(process.env.DESK_PASSPHRASE!),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE,
  }
}
