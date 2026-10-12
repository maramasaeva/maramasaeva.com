import test from 'node:test'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {generateKeyPair,exportJWK,createLocalJWKSet,SignJWT} from 'jose'
import {beginGoogleLogin,validateGoogleFlow,verifyGoogleIdentity,createDeskSession,validateDeskSession,readDeskSession,googleAuthConfigured,googleAuthConfig,SESSION_MAX_AGE} from './google-auth.ts'

const env={GOOGLE_CLIENT_ID:'test-client.apps.googleusercontent.com',GOOGLE_CLIENT_SECRET:'not-a-real-secret',DESK_SESSION_SECRET:'test-only-session-key-not-for-production-0123456789',NODE_ENV:'test',GOOGLE_REDIRECT_URI:'http://localhost:3000/api/desk/google/callback'}
const identity={email:'maramasaeva@gmail.com',sub:'test-owner-sub'}

test('Google flow has scoped login, PKCE, random state/nonce and encrypted transient verifier',()=>{
  const start=beginGoogleLogin(env,1000000),url=new URL(start.url)
  const flow=validateGoogleFlow(start.cookie,url.searchParams.get('state'),env,1000100)
  assert.equal(url.searchParams.get('scope'),'openid email profile')
  assert.equal(url.searchParams.get('code_challenge_method'),'S256')
  assert.equal(url.searchParams.get('code_challenge'),createHash('sha256').update(flow.verifier).digest('base64url'))
  assert.equal(url.searchParams.get('nonce'),flow.nonce)
  assert.notEqual(flow.state,flow.nonce)
  assert.notEqual(beginGoogleLogin(env,1000000).cookie,start.cookie)
  assert.equal(Buffer.from(start.cookie,'base64url').includes(Buffer.from(flow.verifier)),false)
})
test('flow rejects missing/wrong state, tampering, expiry and rotated secret',()=>{
  const start=beginGoogleLogin(env,1000000),state=new URL(start.url).searchParams.get('state')
  for(const [cookie,value,config,time] of [[undefined,state,env,1000100],[start.cookie,'wrong',env,1000100],[start.cookie,null,env,1000100],['A'+start.cookie.slice(1),state,env,1000100],[start.cookie,state,env,1600001],[start.cookie,state,{...env,DESK_SESSION_SECRET:'different-test-session-key-for-rotation-123456'},1000100]])assert.throws(()=>validateGoogleFlow(cookie,value,config,time),/invalid-login-state/)
})
test('sessions expire, bind owner, invalidate legacy passphrase and tampering, and rotate cleanly',()=>{
  const token=createDeskSession(identity,env,1000000)
  assert.equal(validateDeskSession(token,env,1000100),true)
  assert.deepEqual(readDeskSession(token,env,1000100),identity)
  assert.equal(readDeskSession(token+'x',env,1000100),null)
  assert.equal(validateDeskSession(token,env,1000000+SESSION_MAX_AGE*1000),false)
  assert.equal(validateDeskSession(token+'x',env,1000100),false)
  assert.equal(validateDeskSession('a'.repeat(64),env,1000100),false)
  assert.equal(validateDeskSession(token,{...env,GOOGLE_ALLOWED_EMAILS:'someoneelse@example.test'},1000100),false)
  assert.equal(validateDeskSession(token,{...env,DESK_SESSION_SECRET:'another-test-secret-for-rotation-only-12345'},1000100),false)
  assert.throws(()=>createDeskSession({email:'other@example.test',sub:'x'},env),/not-allowed/)
  assert.equal(googleAuthConfigured({...env,DESK_SESSION_SECRET:'weak'}),false)
})
test('redirect URI comes only from server config, never arbitrary hosts or URLs',()=>{
  assert.equal(googleAuthConfig({...env,GOOGLE_REDIRECT_URI:undefined,NODE_ENV:'production'}).redirectUri,'https://maramasaeva.com/api/desk/google/callback')
  for(const redirect of ['https://evil.example/api/desk/google/callback','https://maramasaeva.com/api/desk/google/callback?next=https://evil.example','https://user:pass@maramasaeva.com/api/desk/google/callback','https://maramasaeva.com:444/api/desk/google/callback'])assert.equal(googleAuthConfigured({...env,GOOGLE_REDIRECT_URI:redirect}),false)
  assert.equal(googleAuthConfigured({...env,NODE_ENV:'production'}),false)
})
test('OIDC verifier enforces signature, issuer, audience, nonce, verified email, expiry and owner',async()=>{
  const {publicKey,privateKey}=await generateKeyPair('RS256'),jwk=await exportJWK(publicKey)
  jwk.kid='test-key';jwk.alg='RS256';const keys=createLocalJWKSet({keys:[jwk]})
  const now=Math.floor(Date.now()/1000)
  const claims={iss:'https://accounts.google.com',aud:env.GOOGLE_CLIENT_ID,iat:now,exp:now+300,sub:identity.sub,email:identity.email,email_verified:true,nonce:'test-nonce'}
  const sign=values=>new SignJWT(values).setProtectedHeader({alg:'RS256',kid:'test-key'}).sign(privateKey)
  assert.deepEqual(await verifyGoogleIdentity(await sign(claims),'test-nonce',env,keys),identity)
  for(const changed of [{nonce:'wrong'},{email:'other@example.test'},{email_verified:false},{iss:'https://evil.example'},{aud:'another-client'},{azp:'another-client'},{exp:now-100},{iat:now-1000},{sub:''}])await assert.rejects(verifyGoogleIdentity(await sign({...claims,...changed}),'test-nonce',env,keys))
  const token=await sign(claims),parts=token.split('.');parts[1]=Buffer.from(JSON.stringify({...claims,email:'other@example.test'})).toString('base64url')
  await assert.rejects(verifyGoogleIdentity(parts.join('.'),'test-nonce',env,keys))
})
