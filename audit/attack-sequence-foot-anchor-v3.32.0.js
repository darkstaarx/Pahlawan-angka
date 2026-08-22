const fs=require('fs');
const battle=fs.readFileSync('js/battle.js','utf8');
const action=fs.readFileSync('js/action-variety-v3.30.0.js','utf8');
const css=fs.readFileSync('css/action-variety-v3.30.0.css','utf8');
const html=fs.readFileSync('index.html','utf8');
const failures=[];
const check=(ok,msg)=>{if(!ok)failures.push(msg)};
check(/phase-anticipation/.test(battle),'stance phase missing');
check(/phase-movement/.test(battle),'movement phase missing');
check(/phase-contact/.test(battle),'actual attack phase missing');
check(/phase-movement"\)\},heroLead\+140[\s\S]*phase-contact"\)\},heroLead\+320[\s\S]*phase-recover"\)\},heroLead\+620/.test(battle),'regular sequence is not stance -> movement -> actual attack');
check(/hero-frame-strike/.test(action)&&/attack\.src=chosen\.asset/.test(action)===false,'variant asset incorrectly replaces movement frame');
check(/strike\.src=chosen\.asset/.test(action),'variant asset is not assigned to strike frame');
check(/phase-movement \.hero-frame-anticipation\{opacity:0/.test(css),'stance frame remains visible during movement');
check(/phase-movement \.hero-frame-follow-through\{[^}]*opacity:1/.test(css),'movement does not use frame 4 / follow-through asset');
check(/phase-movement \.hero-frame-attack\{opacity:0/.test(css),'original actual attack leaks into movement');
check(/phase-contact:not\(\.charging-finisher\) \.hero-frame-strike\{[^}]*visibility:visible!important;opacity:1!important/.test(css),'strike frame is hidden by legacy battle visibility rules');
check(/charging-finisher\.phase-contact \.hero-frame-attack/.test(css),'finisher frame preservation missing');
check(/Attack Lab/.test(action)&&/attackLabStep/.test(action)&&/playAttackLab/.test(action),'DEV Attack Lab missing');
check(/step==='movement'\?h\.followThrough/.test(action),'Attack Lab movement does not use frame 4');
check(!/attackLabStep\('follow'\)/.test(action),'Attack Lab incorrectly exposes a fourth sequence step');
check((action.match(/<b>[123]<\/b>/g)||[]).length===3,'Attack Lab does not show exactly three sequence steps');
check((action.match(/bodyScale:/g)||[]).length===8&&(action.match(/footShiftX:/g)||[]).length===8,'eight contact attacks do not carry body/foot anchors');
const scales=[...action.matchAll(/bodyScale:([\d.]+)/g)].map(x=>Number(x[1])),shifts=[...action.matchAll(/footShiftX:([\d.-]+)/g)].map(x=>Number(x[1]));
check(scales.length===8&&scales.every(x=>x>=1.00&&x<=2.10),'contact body scale escapes the 1.00-2.10 safety range');
const expectedScale={
  "id:'original',label:'Tebasan Ais Asal'":1.48,
  "id:'dash',label:'Tikaman Pantas'":1.85,
  "id:'arc',label:'Lengkung Nombor'":1.78,
  "id:'pulse',label:'Gelombang Operasi'":2.05,
  "id:'original',label:'Serangan Flora Asal'":1.55,
  "id:'sweep',label:'Sapuan Flora'":1.35,
  "id:'spiral',label:'Pusaran Pecahan'":1.25,
  "id:'thorn',label:'Tusukan Mekar'":1.40
};
for(const key in expectedScale){
  const re=new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+".*?bodyScale:([\\d.]+)");
  const m=action.match(re);
  check(!!m&&Number(m[1])===expectedScale[key],'exact scale mismatch for '+key+' (expected '+expectedScale[key]+')');
}
check(shifts.length===8&&shifts.every(x=>x>=0&&x<=42),'contact foot anchor escapes safe horizontal bounds');
/* Approximate mobile clipping check: uses the narrowest documented breakpoint
   (max-width:370px, --pa-hero-h:106px from css/battle-scene-v3.8.28.css) and each
   asset's known intrinsic aspect ratio to estimate rendered on-screen width at
   each variant's bodyScale. This is a static approximation (rendered width vs the
   raw 370px viewport itself), not a full arena-relative layout/collision
   simulation, since that requires a real browser to resolve exactly. It still
   catches gross overflow: any variant whose art would render wider than the
   phone screen itself at the smallest supported viewport. */
const REF_VIEWPORT=370,REF_HERO_H=106;
const intrinsicRatio={
  "id:'original',label:'Tebasan Ais Asal'":512/305,
  "id:'dash',label:'Tikaman Pantas'":1000/667,
  "id:'arc',label:'Lengkung Nombor'":1000/969,
  "id:'pulse',label:'Gelombang Operasi'":1000/636,
  "id:'original',label:'Serangan Flora Asal'":720/493,
  "id:'sweep',label:'Sapuan Flora'":1000/621,
  "id:'spiral',label:'Pusaran Pecahan'":1000/767,
  "id:'thorn',label:'Tusukan Mekar'":1000/643
};
for(const key in expectedScale){
  const renderedWidth=intrinsicRatio[key]*REF_HERO_H*expectedScale[key];
  check(renderedWidth<REF_VIEWPORT,'contact art for '+key+' would render wider ('+renderedWidth.toFixed(1)+'px) than the '+REF_VIEWPORT+'px mobile reference viewport, risking clipping');
}
check(/--pa-contact-scale/.test(action)&&/--pa-contact-shift-x/.test(action),'contact anchor metadata is not applied');
check(/bottom:0!important/.test(css)&&/scale\(var\(--pa-contact-scale,1\)\)/.test(css),'single foot-anchored transform is missing');
check(!/pa-attack-(?:original|dash|arc|pulse|sweep|spiral|thorn) \.hero-frame-strike/.test(css),'unsafe per-class transform overrides remain');
check(/v=3\.31\.7/.test(html),'action assets are not cache-busted to the foot-anchor revision');
console.log(JSON.stringify({status:failures.length?'fail':'pass',failures},null,2));
process.exitCode=failures.length?1:0;
