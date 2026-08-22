const fs=require('fs');
const action=fs.readFileSync('js/action-variety-v3.30.0.js','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const expected=[
 'assets/heroes/wira/frames/attack-dash-v2.webp',
 'assets/heroes/wira/frames/attack-arc-v2.webp',
 'assets/heroes/wira/frames/attack-pulse-v2.webp',
 'assets/heroes/bunga/frames/attack-sweep-v2.webp',
 'assets/heroes/bunga/frames/attack-spiral-v2.webp',
 'assets/heroes/bunga/frames/attack-original-aura-v3.webp',
 'assets/heroes/bunga/frames/attack-thorn-summon-v3.webp'
];
const failures=[];
for(const file of expected){
 if(!fs.existsSync(file))failures.push('missing '+file);
 else if(fs.statSync(file).size<50000)failures.push('suspiciously small '+file);
 if(!action.includes(file))failures.push('not wired '+file);
 if(!sw.includes(file))failures.push('not cached '+file);
}
if((action.match(/asset:'assets\/heroes\//g)||[]).length!==8)failures.push('contact attack count is not eight (four per hero)');
for(const original of ['assets/heroes/wira/attack.webp']){
 if(!action.includes(original))failures.push('original contact attack not wired '+original);
 if(!sw.includes(original))failures.push('original contact attack not cached '+original);
}
if(!/if\(finisher\)return/.test(action))failures.push('finisher exclusion missing');
if(!/strike\.src=chosen\.asset/.test(action))failures.push('selected asset is not applied to the strike frame');
console.log(JSON.stringify({status:failures.length?'fail':'pass',assets:expected.length,failures},null,2));
process.exitCode=failures.length?1:0;
