const fs=require('fs');
const path=require('path');

const repo=process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const file=path.join(repo,'index.html');
if(!fs.existsSync(file)){
  console.error('FAIL: index.html not found at',file);
  process.exit(1);
}
let html=fs.readFileSync(file,'utf8');
const before=html;
const rePwa=/js\/pwa\.js\?v=[^"'<>]+/g;
const matches=html.match(rePwa)||[];
if(!matches.length){
  console.error('FAIL: js/pwa.js?v=... reference not found in index.html');
  process.exit(1);
}
html=html.replace(rePwa,'js/pwa.js?v=3.24.1');
if(html===before && matches.every(x=>x==='js/pwa.js?v=3.24.1')){
  console.log('PASS: index already uses pwa.js?v=3.24.1');
  process.exit(0);
}
fs.writeFileSync(file,html,'utf8');
console.log('PASS: index cache key -> js/pwa.js?v=3.24.1');
