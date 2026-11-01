// QA — Kedai Kek top-down fraction models

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync('kedai-kek.html','utf8');
const extract=(begin,end)=>{
 const i=source.indexOf(begin),j=source.indexOf(end,i+begin.length);
 assert.ok(i>=0&&j>i,'Expected rendering boundary not found: '+begin);
 return source.slice(i,j);
};
const functions=extract('const P2=(r,a)=>','function drawShelf(lit){');
const js=functions+'\nreturn {roundSVG,barSVG,barsSVG,bottleSVG,modelSVG,cakeIcon,stateOf};';
const ctx={
 range:k=>Array.from({length:k},(_,i)=>i),
 shuffle:a=>a,
 FLS:[{n:'pandan',c:'#8fd16a',k:'#4f8f35'}],
 q:{cut:null},cutN:10,shadeSet:new Set(),
 PINK:'#ff8fb1',CHOC:'#7a4426',PINK_K:'#d24f7c',
};
const fn=new Function(...Object.keys(ctx),js);
const art=fn(...Object.values(ctx));
const fl=ctx.FLS[0];
const states=sh=>({sh:new Set(Array.from({length:sh},(_,i)=>i)),sh2:new Set(),eat:new Set()});

test('rectangular cake is overhead with 10 equal accessible interactive pieces',()=>{
 const svg=art.barSVG({t:'bar',n:10,fl},states(3));
 assert.match(svg,/viewBox="0 0 220 62"/);
 assert.match(svg,/Kek pandangan atas, 10 potongan sama besar/);
 assert.equal((svg.match(/data-i="/g)||[]).length,10);
 assert.equal((svg.match(/fill="#ff8fb1"/g)||[]).length,3);
 assert.equal((svg.match(/fill="#8fd16a"/g)||[]).length,8); // 7 untopped parts + full cake base
 assert.doesNotMatch(svg,/y0\+12\+L\*8\.5/);
 const indexes=[...svg.matchAll(/data-i="(\d+)"/g)].map(x=>Number(x[1]));
 assert.deepEqual(indexes,[0,1,2,3,4,5,6,7,8,9]);
 const widths=[...svg.matchAll(/data-i="\d+" x="[^"]+" y="[^"]+" width="([^"]+)"/g)].map(x=>Number(x[1]));
 assert.equal(widths.length,10);
 assert.ok(widths.every(x=>Math.abs(x-widths[0])<.00001));
});

test('top-down model keeps empty, shaded, secondary and eaten parts distinct',()=>{
 const st={sh:new Set([1,2]),sh2:new Set([3]),eat:new Set([0])};
 const svg=art.barSVG({t:'bar',n:5,fl},st);
 assert.equal((svg.match(/fill="#eee4ce"/g)||[]).length,1);
 assert.equal((svg.match(/fill="#ff8fb1"/g)||[]).length,2);
 assert.equal((svg.match(/fill="#7a4426"/g)||[]).length,1);
 assert.equal((svg.match(/fill="#8fd16a"/g)||[]).length,2); // base + 1 untopped part
 assert.equal((svg.match(/data-i="/g)||[]).length,5);
});

test('live shade state still passes through the same fraction interaction API',()=>{
 ctx.shadeSet=new Set([0,2,4]);
 const html=art.barSVG({t:'bar',n:8,fl},states(3));
 assert.ok(html.includes('data-i="0"'));
 assert.ok(html.includes('data-i="7"'));
 // No answer semantics were changed: the existing input touches data-i, not a new numeric answer.
 assert.match(source,/shadeSet\.has\(i\)\?shadeSet\.delete\(i\):shadeSet\.add\(i\)/);
 assert.match(source,/ok=\(!q\.need\.n\|\|n===q\.need\.n\)&&shadeSet\.size===q\.need\.k/);
});

test('mixed and improper numbers still show correct full and partial cake counts',()=>{
 const full=art.barsSVG({t:'bars',w:2,n:3,d:4,fl});
 assert.match(full,/Kek-kek dilihat dari atas/);
 assert.equal((full.match(/data-i="/g)||[]).length,12);
 assert.equal((full.match(/fill="#ff8fb1"/g)||[]).length,11);
 const partial=art.barsSVG({t:'bars',w:0,n:2,d:5,fl});
 assert.equal((partial.match(/data-i="/g)||[]).length,5);
 assert.equal((partial.match(/fill="#ff8fb1"/g)||[]).length,2);
});

test('round cake is already overhead; bottle remains a side-view level measurement',()=>{
 const round=art.roundSVG({t:'round',n:4,fl},states(2));
 assert.match(round,/Kek dilihat dari atas, 4 potongan sama besar/);
 assert.equal((round.match(/data-i="/g)||[]).length,4);
 const bottle=art.bottleSVG({t:'bottle',n:10,sh:3});
 assert.match(bottle,/Botol jus/);
 assert.equal((bottle.match(/fill="#ffad3b"/g)||[]).length,3);
 const icon=art.cakeIcon(fl);
 assert.match(icon,/<rect x="7" y="17" width="26" height="17"/);
 assert.doesNotMatch(icon,/Kek dilihat dari atas/);
});

test('real screenshot-inspired Darjah 2 cake question retains dual decimal/fraction answer logic',()=>{
 assert.match(source,/arch:'coloured_card'[\s\S]*?form:TENTH\(n\)/);
 assert.match(source,/arch:'remaining_part'[\s\S]*?form:TENTH\(10-n\)/);
 const correct="3/10",decimal="0.3";
 assert.equal(Number(correct.split('/')[0])/Number(correct.split('/')[1]),Number(decimal));
});

test('bakery props stay in the original side/front view while the fraction model is overhead',()=>{
 const prop=art.cakeIcon(fl),tray=art.barSVG({t:'bar',n:3,fl},states(1));
 assert.match(prop,/rect x="7" y="17" width="26" height="17"/);
 assert.match(prop,/M7 21v-3/);
 assert.doesNotMatch(prop,/Kek pandangan atas/);
 assert.match(tray,/Kek pandangan atas, 3 potongan sama besar/);
 assert.equal((tray.match(/data-i="/g)||[]).length,3);
 assert.equal((tray.match(/fill="#ff8fb1"/g)||[]).length,1);
 assert.match(tray,/Bahagian 1 daripada 3/);
 assert.match(tray,/stroke="#d4ad73"/);
});

test('all five flavours render as the same 2.5D family, not flat cake recolours',()=>{
 const flavours=[
  {n:'coklat',c:'#9a5634',k:'#5e2f17'},
  {n:'pandan',c:'#8fd16a',k:'#4f8f35'},
  {n:'vanila',c:'#f6d28b',k:'#c9963f'},
  {n:'keladi',c:'#c3a3ec',k:'#8059b8'},
  {n:'oren',c:'#ffb760',k:'#d0782a'},
 ];
 const round=new Set(),bar=new Set(),shelf=new Set();
 for(const flavour of flavours){
  const r=art.roundSVG({t:'round',n:4,fl:flavour},states(2));
  const b=art.barSVG({t:'bar',n:5,fl:flavour},states(2));
  const tiny=art.barSVG({t:'bar',n:10,fl:flavour},states(3));
  const icon=art.cakeIcon(flavour);
  assert.equal((r.match(/data-i="/g)||[]).length,4);
  assert.equal((b.match(/data-i="/g)||[]).length,5);
  assert.equal((tiny.match(/data-i="/g)||[]).length,10);
  assert.equal((tiny.match(/fill="#ff8fb1"/g)||[]).length,3);
  assert.match(r,/ellipse cx="50" cy="56"/,'2.5D plate under round cake');
  assert.match(b,/ellipse cx="110"/,'same plate+shadow convention for tray');
  assert.match(r,/Kek dilihat dari atas/);
  assert.match(icon,/hiasan kedai, pandangan sisi/,'decorative art retains original viewing angle');
  assert.match(r,/pointer-events="none"/);
  assert.match(b,/pointer-events="none"/);
  assert.match(r,/transform="translate\(/,'flavour toppings are drawn on round cake');
  assert.match(b,/transform="translate\(/,'flavour toppings are drawn on tray');
  assert.match(icon,/transform="translate\(/,'matching flavour topping is present on prop');
  round.add(r);bar.add(b);shelf.add(icon);
 }
 assert.equal(round.size,5,'every flavour has unique art');
 assert.equal(bar.size,5,'every flavour has unique cake colouring and decorations');
 assert.equal(shelf.size,5,'every flavour has a distinct bakery decoration');
 assert.equal((source.match(/flOrder=shuffle\(FLS\)/g)||[]).length,1,'the five flavours still rotate normally');
});

test('visual-only flavour details cannot create new answer targets',()=>{
 const all=[
 {n:'coklat',c:'#9a5634',k:'#5e2f17'},
 {n:'pandan',c:'#8fd16a',k:'#4f8f35'},
 {n:'vanila',c:'#f6d28b',k:'#c9963f'},
 {n:'keladi',c:'#c3a3ec',k:'#8059b8'},
 {n:'oren',c:'#ffb760',k:'#d0782a'}
 ];
 for(const fl of all){
  for(const n of [2,3,4,5,8,10]){
   const st={sh:new Set([0]),sh2:new Set(),eat:new Set()};
   const shapes=[art.roundSVG({t:'round',n,fl},st),art.barSVG({t:'bar',n,fl},st)];
   for(const svg of shapes){
    const parts=[...svg.matchAll(/data-i="(\d+)"/g)].map(m=>Number(m[1]));
    assert.deepEqual(parts,Array.from({length:n},(_,i)=>i));
    assert.doesNotMatch(svg,/<(?:path|circle|line)[^>]*data-i="(\d+)"[^>]*pointer-events="none"/);
   }
  }
 }
});
