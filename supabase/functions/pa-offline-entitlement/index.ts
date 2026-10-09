// STAGED ONLY: Supabase Edge Function pa-offline-entitlement.
// Requires PA_OFFLINE_SIGNING_JWK Supabase secret, never committed to GitHub.
import { createClient } from 'npm:@supabase/supabase-js@2.111.0';
const encoder=new TextEncoder();
const b64url=(data:Uint8Array)=>btoa(String.fromCharCode(...data)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
let cachedSigner:Promise<CryptoKey>|null=null;
async function signer(){
 if(!cachedSigner)cachedSigner=(async()=>{
  const raw=Deno.env.get('PA_OFFLINE_SIGNING_JWK');
  if(!raw)throw Error('Signing key is not configured');
  const key=JSON.parse(raw);
  if(key.kty!=='EC'||key.crv!=='P-256'||!key.d||!key.x||!key.y)
   throw Error('Invalid signing JWK');
  return crypto.subtle.importKey('jwk',key,{name:'ECDSA',namedCurve:'P-256'},false,['sign']);
 })();
 return cachedSigner;
}
function reply(status:number,body:unknown){
 return new Response(JSON.stringify(body),{status,headers:{
  'content-type':'application/json','cache-control':'no-store',
  'access-control-allow-origin':'*','vary':'Origin'
 }});
}
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:{
  'access-control-allow-origin':'*','access-control-allow-headers':'authorization,apikey,content-type',
  'access-control-allow-methods':'POST','access-control-max-age':'600'
 }});
 if(req.method!=='POST')return reply(405,{error:'method_not_allowed'});
 const bearer=req.headers.get('authorization')||'';
 const jwt=bearer.match(/^Bearer\s+(\S+)$/i)?.[1];
 if(!jwt)return reply(401,{error:'authentication_required'});
 try{
  const url=Deno.env.get('SUPABASE_URL'),anon=Deno.env.get('SUPABASE_ANON_KEY');
  if(!url||!anon)return reply(503,{error:'server_unconfigured'});
  const client=createClient(url,anon,{global:{headers:{authorization:'Bearer '+jwt}},auth:{persistSession:false}});
  const auth=await client.auth.getUser(jwt),user=auth.data.user;
  if(auth.error||!user)return reply(401,{error:'invalid_session'});
  const result=await client.rpc('get_commercial_access');
  if(result.error)return reply(503,{error:'access_unavailable'});
  const row=Array.isArray(result.data)?result.data[0]:result.data;
  if(!(row&&row.status==='active'&&['premium','family_plus'].includes(row.plan)))
   return reply(403,{error:'purchase_not_active'});
  const scopes=row.plan==='family_plus'?['core','worksheet_plus']:['core'];
  const payload=b64url(encoder.encode(JSON.stringify({
   v:1,aud:'pahlawan-angka-offline',kid:'pa-p256-v1',
   sub:user.id,plan:row.plan,scopes,issued_at:new Date().toISOString()
  })));
  const signature=new Uint8Array(await crypto.subtle.sign(
   {name:'ECDSA',hash:'SHA-256'},await signer(),encoder.encode(payload)
  ));
  return reply(200,{payload,signature:b64url(signature)});
 }catch(error){
  console.error('offline receipt signing failed',error instanceof Error?error.name:'unknown');
  return reply(503,{error:'receipt_unavailable'});
 }
});
