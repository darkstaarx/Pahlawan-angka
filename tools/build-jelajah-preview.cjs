/* Derive the actual production stage DOM without editing the production entry. */
const fs=require('node:fs');
let html=fs.readFileSync('index.html','utf8');
const excluded=/\/(cloud|commercial-foundation|beta-trust|entry-flow|qsv2-shadow-sync|qsv2-pilot-sync|demo-funnel|demo-wrapup|guardian-onboarding|bug-report|parent-live-runtime)[^/]*\.js/;
html=html.replace(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/g,(tag,src)=>excluded.test(src)?'':tag);
html=html.replace('<head>','<head><meta name="robots" content="noindex,nofollow"><script>window.PAJelajahSkipEntrance=true;</script><script src="js/jelajah-isolation-v1.js"></script>');
html=html.replace('</head>','<link rel="stylesheet" href="css/jelajah-runtime-v1.css"></head>');
html+='\n<script src="js/jelajah-scenarios-v1.js?v=3.87.87"></script><script src="js/jelajah-engine-v3.js?v=3.87.87"></script><script src="js/jelajah-battle-bridge-v1.js?v=3.87.87"></script>\n';
fs.writeFileSync('jelajah-runtime.html',html);
const offer=fs.readFileSync('index.html','utf8').replace('</head>','<meta name="robots" content="noindex,nofollow"></head>')+`<script>window.addEventListener('DOMContentLoaded',()=>{const mode=new URLSearchParams(location.search).get('mode');if(mode==='pakej')window.PAEntry?.plans();else window.PAEntry?.registerFree()})</script>`;
fs.writeFileSync('jelajah-offer.html',offer);
console.log('Built isolated Jelajah runtime from current index.html');
require('./build-jelajah-minigames.cjs');
