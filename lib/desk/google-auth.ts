import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto"
import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from "jose"

type Env = Record<string, string | undefined>
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30
export const FLOW_MAX_AGE = 600
export const FLOW_COOKIE = "desk-google-flow"
export type GoogleIdentity = { email: string; sub: string }
type Flow = { state: string; nonce: string; verifier: string; createdAt: number }
const GOOGLE_KEYS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"), { timeoutDuration: 10000 })

function secret(env: Env) {
  const value = env.DESK_SESSION_SECRET || env.DASHBOARD_SESSION_SECRET || ""
  if (Buffer.byteLength(value) < 32) throw new Error("desk-auth-not-configured")
  return value
}
export function allowedGoogleEmails(env: Env = process.env) {
  return new Set((env.GOOGLE_ALLOWED_EMAILS || "maramasaeva@gmail.com").split(",").map(email => email.trim().toLowerCase()).filter(Boolean))
}
export function googleAuthConfig(env: Env = process.env) {
  const clientId = env.GOOGLE_CLIENT_ID || "", clientSecret = env.GOOGLE_CLIENT_SECRET || ""
  if (!clientId || !clientSecret) throw new Error("desk-auth-not-configured")
  secret(env)
  const redirectUri = env.GOOGLE_REDIRECT_URI || "https://maramasaeva.com/api/desk/google/callback"
  const uri = new URL(redirectUri)
  const local = env.NODE_ENV !== "production" && ["localhost", "127.0.0.1"].includes(uri.hostname) && uri.protocol === "http:"
  if ((!local && (uri.protocol !== "https:" || uri.hostname !== "maramasaeva.com")) || uri.pathname !== "/api/desk/google/callback" || uri.search || uri.hash || uri.username || uri.password || (!local && uri.port)) throw new Error("desk-auth-invalid-redirect")
  return { clientId, clientSecret, redirectUri, origin: uri.origin }
}
export function googleAuthConfigured(env: Env = process.env) { try { googleAuthConfig(env); return true } catch { return false } }
// NextURL normalizes 127.0.0.1 to localhost. Keep the actual browser Host
// canonical so the transient cookie and Google's callback share one hostname.
export function googleRequestOriginMatches(origin: string, host: string | null, configured: string, env: Env = process.env) {
  if (origin === configured) return true
  if (env.NODE_ENV === "production" || !host) return false
  try {
    const actual = new URL(origin), expected = new URL(configured)
    return actual.protocol === "http:" && expected.protocol === "http:" &&
      ["localhost", "127.0.0.1"].includes(actual.hostname) &&
      ["localhost", "127.0.0.1"].includes(expected.hostname) &&
      actual.port === expected.port && host === expected.host
  } catch { return false }
}
function same(a: string, b: string) { const x=Buffer.from(a), y=Buffer.from(b); return x.length === y.length && timingSafeEqual(x,y) }
function flowKey(env: Env) { return createHash("sha256").update("desk-google-flow-v1\0" + secret(env)).digest() }

export function beginGoogleLogin(env: Env = process.env, now = Date.now()) {
  const config = googleAuthConfig(env)
  const flow: Flow = { state: randomBytes(32).toString("base64url"), nonce: randomBytes(32).toString("base64url"), verifier: randomBytes(48).toString("base64url"), createdAt: now }
  const iv = randomBytes(12), cipher = createCipheriv("aes-256-gcm", flowKey(env), iv)
  cipher.setAAD(Buffer.from("desk-google-flow-v1"))
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(flow), "utf8"), cipher.final()])
  const cookie = Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url")
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth")
  for (const [key,value] of Object.entries({ client_id:config.clientId,redirect_uri:config.redirectUri,response_type:"code",scope:"openid email profile",state:flow.state,nonce:flow.nonce,code_challenge:createHash("sha256").update(flow.verifier).digest("base64url"),code_challenge_method:"S256",prompt:"select_account" })) url.searchParams.set(key,value)
  return { url:url.toString(), cookie }
}
export function validateGoogleFlow(cookie: string | undefined, state: string | null, env: Env = process.env, now = Date.now()): Flow {
  try {
    if (!cookie || cookie.length > 4096 || !state) throw new Error()
    const data=Buffer.from(cookie,"base64url"), decipher=createDecipheriv("aes-256-gcm",flowKey(env),data.subarray(0,12))
    decipher.setAAD(Buffer.from("desk-google-flow-v1"));decipher.setAuthTag(data.subarray(12,28))
    const flow=JSON.parse(Buffer.concat([decipher.update(data.subarray(28)),decipher.final()]).toString("utf8")) as Flow
    if (!Number.isFinite(flow.createdAt) || now-flow.createdAt > FLOW_MAX_AGE*1000 || flow.createdAt > now+5000 || typeof flow.state !== "string" || !same(flow.state,state) || typeof flow.nonce !== "string" || typeof flow.verifier !== "string") throw new Error()
    return flow
  } catch { throw new Error("invalid-login-state") }
}
export async function verifyGoogleIdentity(idToken: string, nonce: string, env: Env = process.env, key: JWTVerifyGetKey = GOOGLE_KEYS): Promise<GoogleIdentity> {
  const config=googleAuthConfig(env)
  const {payload}=await jwtVerify(idToken,key,{ algorithms:["RS256"],issuer:["https://accounts.google.com","accounts.google.com"],audience:config.clientId,requiredClaims:["exp","iat","sub","email","email_verified","nonce"],maxTokenAge:600,clockTolerance:5 })
  if (typeof payload.nonce !== "string" || !same(payload.nonce,nonce) || payload.email_verified !== true || typeof payload.email !== "string" || typeof payload.sub !== "string" || !payload.sub || (payload.azp !== undefined && payload.azp !== config.clientId)) throw new Error("invalid-google-identity")
  const email=payload.email.toLowerCase()
  if (!allowedGoogleEmails(env).has(email)) throw new Error("google-owner-not-allowed")
  return {email,sub:payload.sub}
}
export async function finishGoogleLogin(code: string, flow: Flow, env: Env = process.env, fetchImpl = fetch) {
  const config=googleAuthConfig(env)
  if (!code || code.length > 4096) throw new Error("invalid-login-code")
  const response=await fetchImpl("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"authorization_code",client_id:config.clientId,client_secret:config.clientSecret,redirect_uri:config.redirectUri,code,code_verifier:flow.verifier}),cache:"no-store",redirect:"error",signal:AbortSignal.timeout(15000)})
  if (!response.ok) throw new Error("google-login-exchange-failed")
  const token=await response.json() as {id_token?:unknown}
  if (typeof token.id_token !== "string") throw new Error("google-login-exchange-failed")
  // Do not persist access tokens: sign-in does not grant Gmail/calendar access.
  return verifyGoogleIdentity(token.id_token,flow.nonce,env)
}
export function createDeskSession(identity: GoogleIdentity, env: Env = process.env, now = Date.now()) {
  if (!allowedGoogleEmails(env).has(identity.email.toLowerCase()) || !identity.sub) throw new Error("google-owner-not-allowed")
  const data=Buffer.from(JSON.stringify({v:2,provider:"google",email:identity.email.toLowerCase(),sub:identity.sub,iat:Math.floor(now/1000),exp:Math.floor(now/1000)+SESSION_MAX_AGE,jti:randomBytes(24).toString("base64url")})).toString("base64url")
  return data+"."+createHmac("sha256",secret(env)).update("desk-session-v2\0"+data).digest("base64url")
}
export function validateDeskSession(value: string | undefined, env: Env = process.env, now = Date.now()) {
  try {
    if (!value || value.length > 4096) return false
    const [data,signature,extra]=value.split(".")
    if (!data || !signature || extra || !same(signature,createHmac("sha256",secret(env)).update("desk-session-v2\0"+data).digest("base64url"))) return false
    const payload=JSON.parse(Buffer.from(data,"base64url").toString("utf8")), time=Math.floor(now/1000)
    return payload.v===2 && payload.provider==="google" && typeof payload.sub==="string" && Boolean(payload.sub) && typeof payload.email==="string" && allowedGoogleEmails(env).has(payload.email) && Number.isSafeInteger(payload.iat) && Number.isSafeInteger(payload.exp) && payload.iat<=time+5 && payload.exp>time && payload.exp-payload.iat===SESSION_MAX_AGE
  } catch { return false }
}
export function readDeskSession(value: string | undefined, env: Env = process.env, now = Date.now()): GoogleIdentity | null {
  if (!validateDeskSession(value,env,now)) return null
  const payload=JSON.parse(Buffer.from(value!.split(".")[0],"base64url").toString("utf8"))
  return {email:payload.email,sub:payload.sub}
}
