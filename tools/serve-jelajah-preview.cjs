const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.mp4':'video/mp4','.woff2':'font/woff2','.mp3':'audio/mpeg','.wav':'audio/wav'};
http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 // The original landing CTA uses this URL when opened outside its app iframe.
 // Resolve it here, inside the development server only; production stays untouched.
 if(['/', '/index.html'].includes(url.pathname)&&url.searchParams.get('landing_action')==='demo'){
  res.writeHead(302,{Location:'/demo-jelajah.html','Cache-Control':'no-store'});res.end();return;
 }
 let file;try{file=path.resolve(root,'.'+decodeURIComponent(url.pathname))}catch(_){res.writeHead(400);res.end();return}
 if(file===root)file=path.join(root,'demo-jelajah.html');
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return}
 res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
 if(file===path.join(root,'index.html')){
  res.end(fs.readFileSync(file,'utf8').replace('<head>','<head><script src="js/jelajah-landing-entry-v1.js"></script>'));return;
 }
 fs.createReadStream(file).pipe(res);
}).listen(4173,'127.0.0.1',()=>console.log('Development only: http://127.0.0.1:4173/demo-jelajah.html'));
