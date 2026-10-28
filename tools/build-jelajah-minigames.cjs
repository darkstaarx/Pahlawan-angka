/* Build isolated copies of the real production games for Demo Jelajah. */
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const games=['gudang-harta.html','kedai-kek.html','bengkel-ajaib.html','lombong-permata.html','dapur-ramuan.html'];
const out=path.join(root,'preview');fs.mkdirSync(out,{recursive:true});
const bridge=`<script>(function(){'use strict';var q=new URLSearchParams(location.search),g=Number(q.get('grade'))||0;document.addEventListener('pointerdown',function(){try{window.parent.postMessage({source:'pa-jelajah',type:'interaction',grade:g},location.origin)}catch(_){}} ,{once:true});document.addEventListener('DOMContentLoaded',function(){var d=document.getElementById('devBtn');if(d){d.hidden=true;d.style.display='none'}var x=document.getElementById('dev');if(x){x.hidden=true;x.style.display='none'}});})();</script>`;
for(const file of games){let html=fs.readFileSync(path.join(root,file),'utf8');const inject=`<meta name="robots" content="noindex,nofollow" data-jelajah-production="1"><base href="../"><script src="js/jelajah-isolation-v1.js"></script>${bridge}`;if(html.includes('<head>'))html=html.replace('<head>','<head>'+inject);else html=inject+html;html=html.replace(/<body([^>]*)>/, '<body$1 data-jelajah-production="1">');const target=path.join(out,'jelajah-game-'+file);fs.writeFileSync(target,html);}
console.log(`Built ${games.length} isolated production game copies in preview/`);
