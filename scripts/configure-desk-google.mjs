// Owner-run credential import. Secret values never appear in command arguments/output.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const input=process.argv[2];
if(!input)throw new Error('Provide the downloaded web OAuth client JSON path.');
const client=JSON.parse(fs.readFileSync(path.resolve(input),'utf8')).web;
const productionRedirect='https://maramasaeva.com/api/desk/google/callback';
const localRedirect='http://127.0.0.1:3000/api/desk/google/callback';
if(!client||!client.client_id?.endsWith('.apps.googleusercontent.com')||!client.client_secret||!client.redirect_uris?.includes(productionRedirect)||!client.redirect_uris?.includes(localRedirect))throw new Error('The web client needs both registered desk redirect URLs and a secret.');
const file=path.join(root,'.env.local');
let original='';try{original=fs.readFileSync(file,'utf8')}catch{}
let session=original.match(/^DESK_SESSION_SECRET=(.+)$/m)?.[1];
if(session?.startsWith('"')){try{session=JSON.parse(session)}catch{session=null}}
if(!session||session.length<32)session=crypto.randomBytes(48).toString('base64url');
const values={GOOGLE_CLIENT_ID:client.client_id,GOOGLE_CLIENT_SECRET:client.client_secret,GOOGLE_ALLOWED_EMAILS:'maramasaeva@gmail.com',DESK_SESSION_SECRET:session};
const local={...values,GOOGLE_REDIRECT_URI:localRedirect};
let content=original;
for(const [key,value] of Object.entries(local)){
  const line=key+'='+JSON.stringify(value);
  const pattern=new RegExp('^'+key+'=.*$','m');
  content=pattern.test(content)?content.replace(pattern,()=>line):content+(content.endsWith('\n')||!content?'':'\n')+line+'\n';
}
const temporary=file+'.desk-import.tmp';
fs.writeFileSync(temporary,content,{mode:0o600,flag:'wx'});fs.renameSync(temporary,file);fs.chmodSync(file,0o600);
console.log('Configured local Google owner login in ignored, owner-only .env.local.');
if(process.argv.includes('--production')){
  for(const [key,value] of Object.entries({...values,GOOGLE_REDIRECT_URI:productionRedirect})){
    const result=spawnSync('vercel',['env','add',key,'production','--yes','--sensitive','--force'],{cwd:root,input:value,encoding:'utf8'});
    if(result.status!==0)throw new Error(`Could not configure ${key} at Vercel. Credentials are not printed; check CLI access.`);
    console.log('Configured production '+key+'.');
  }
  console.log('Production configuration saved. Redeploy the current production version to apply it.');
}
