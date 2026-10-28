const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),bridge=path.join(root,'js','jelajah-minigame-v2.js');
test('mini-game bridge exposes production mapping and scoped mount',()=>{
 const src=fs.readFileSync(bridge,'utf8');for(const s of ['PAJelajahMiniGame','pa_focus_live','onComplete','onExit','successes>=3','questionKey','isActiveFrame','workedRounds'])assert.ok(src.includes(s));assert.doesNotMatch(src,/window\.parent\.postMessage\s*=/);
 const api=require(bridge);assert.equal(api.defaultMapping[1].page,'preview/jelajah-game-gudang-harta.html');assert.equal(api.defaultMapping[6].hash,'d6-nisbah@0');
});
test('builder copies real pages with isolation before game scripts',()=>{cp.execFileSync(process.execPath,['tools/build-jelajah-minigames.cjs'],{cwd:root});const made=[];try{for(const name of ['gudang-harta','kedai-kek','bengkel-ajaib','lombong-permata','dapur-ramuan']){const p=path.join(root,'preview','jelajah-game-'+name+'.html');made.push(p);assert.ok(fs.existsSync(p));const s=fs.readFileSync(p,'utf8');assert.ok(s.includes('jelajah-isolation-v1.js'));assert.ok(s.includes('<base href="../">'));assert.ok(s.includes('data-jelajah-production'));assert.doesNotMatch(s,/window\.parent\.postMessage\s*=/);}}finally{/* Generated pages are shipped for GitHub Pages as well as Netlify. */}}
);
