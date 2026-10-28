const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),out=path.join(root,'.production-publish-'+Date.now());fs.mkdirSync(out);
const files=cp.execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean);
for(const file of files){if(/^(?:\.github|audit|tools|docs|review|supabase|research)\//.test(file)||/(?:^|\/)\.env(?:\.|$)/.test(file)||/\.(?:md|cjs|py|ps1|toml|sql)$/.test(file))continue;const src=path.join(root,file);if(!fs.statSync(src).isFile())continue;const dest=path.join(out,file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(src,dest)}
for(const name of fs.readdirSync(path.join(root,'preview')).filter(x=>/^jelajah-game-.*\.html$/.test(x))){fs.mkdirSync(path.join(out,'preview'),{recursive:true});fs.copyFileSync(path.join(root,'preview',name),path.join(out,'preview',name))}
if(fs.readFileSync(path.join(out,'index.html'),'utf8')!==fs.readFileSync(path.join(root,'index.html'),'utf8'))throw Error('Production root mismatch');
fs.writeFileSync(path.join(root,'.production-stage-path'),out);console.log(out);
