// Independent coordinate maths and active-bank regression checks.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const base=fs.readFileSync(path.join(__dirname,'year6-curriculum-v2-v3.61.0.js'),'utf8').split("assert.equal(ctx.window.PAY6CompetencyV2")[0];
const ctx=new Function('require','__dirname',base+';return ctx;')(require,__dirname);
const RT=ctx.window.PAY6V2Runtime;
const states={low:{mastery:15,evidence:2,confidence:20,wrong:1},core:{mastery:55,evidence:4,confidence:55,wrong:0},high:{mastery:90,evidence:10,confidence:85,wrong:0}};
let samples=0;const seen=new Set(),variants=new Set();
for(const [level,state] of Object.entries(states)){
 ctx.sess.questionHistory=[];
 for(let i=0;i<1200;i++){
  const q=ctx.window.PAQuestionBanks.d6('D6.COORD',state,false);
  assert(q&&q.prompt&&!/undefined|NaN/.test(q.prompt));
  assert.equal(new Set([q.answer,...q.wrong.map(w=>w.v)].map(String)).size,4);
  if(level==='high')assert.equal(q.demand,'reasoning');
  const spec=q.coordMapSpec;
  if(spec){
   seen.add(spec.mode);variants.add(JSON.stringify(spec.points));
   assert.equal(q.standardRef,'7.1.1');assert(q.prompt.includes('<svg'));
   assert(spec.points.length>=5);assert.equal(new Set(spec.points.map(p=>p.x+','+p.y)).size,spec.points.length);
   for(const p of spec.points){assert(p.x>=0&&p.x<=8&&p.y>=0&&p.y<=8);assert(q.prompt.includes(p.name));}
   assert(spec.scale>0);
   const point=label=>{const p=spec.points.find(p=>p.label===label);assert(p,'missing point '+label);return p;};
   if(spec.mode==='map_coordinate'){
    const p=point(spec.target);assert.equal(q.answer,`(${p.x},${p.y})`);
    assert(!q.prompt.includes(String(q.answer)),'coordinate answer leaked');
   }else{
    const a=point(spec.from),b=point(spec.to),dx=b.x-a.x,dy=b.y-a.y;
    if(spec.mode==='map_distances')assert.equal(q.answer,`mengufuk ${Math.abs(dx)*spec.scale} km, mencancang ${Math.abs(dy)*spec.scale} km`);
    else {
     assert.equal(q.answer,b.name);
     const text=q.prompt.replace(/<svg[\s\S]*?<\/svg>/g,'').replace(/<[^>]*>/g,' ');
     const unit=spec.mode==='map_scaled_destination'?'km':'petak',factor=unit==='km'?spec.scale:1;
     const moves=text.match(new RegExp('bergerak (\\d+) '+unit+' ke (kiri|kanan) dan (\\d+) '+unit+' ke (bawah|atas)'));
     assert(moves,'movement not visible');
     assert.equal(Number(moves[1])*(moves[2]==='kiri'?-1:1)/factor,dx);
     assert.equal(Number(moves[3])*(moves[4]==='bawah'?-1:1)/factor,dy);
    }
   }
   assert(!q.wrong.some(w=>/^Pilihan /.test(String(w.v))),'generic generated distractor');
   if(spec.mode!=='map_coordinate')assert(q.prompt.includes('1 petak')||spec.mode==='map_destination','scale missing');
   samples++;
  }
  ctx.sess.questionHistory.push({skillId:'D6.COORD',competencyId:q.competencyId,archetypeId:q.archetypeId});ctx.sess.questionHistory=ctx.sess.questionHistory.slice(-60);
 }
}
for(const mode of ['map_coordinate','map_destination','map_distances','map_scaled_destination'])assert(seen.has(mode),'unreachable '+mode);
assert(variants.size>50,'map layouts lack variety');
let measurementSamples=0;const measurementModes=new Set();
for(const state of Object.values(states)){
 ctx.sess.questionHistory=[];
 for(let i=0;i<300;i++){
  const q=ctx.window.PAQuestionBanks.d6('D6.MEASURE',state,false);
  assert(!/berjisim\?|memerlukan\?|Jisim bagi 1 m\?|Penilaian\?/.test(q.prompt),'incomplete measurement wording');
  if(q.archetypeId.endsWith('_length_mass_direct')){
   const m=q.prompt.match(/panjangnya ([\d.]+) m dan jisimnya ([\d.]+) kg.*panjangnya ([\d.]+) m/)||q.prompt.match(/Kabel A: panjang ([\d.]+) m, jisim ([\d.]+) kg.*Kabel B: panjang ([\d.]+) m/);
   assert(m,'missing complete cable question');assert.equal(parseFloat(q.answer),Number((Number(m[2])*Number(m[3])/Number(m[1])).toFixed(2)));
  }
  measurementModes.add(q.archetypeId);measurementSamples++;
  ctx.sess.questionHistory.push({skillId:'D6.MEASURE',competencyId:q.competencyId,archetypeId:q.archetypeId});ctx.sess.questionHistory=ctx.sess.questionHistory.slice(-60);
 }
}
assert(measurementModes.size>=10);
console.log(JSON.stringify({status:'pass',samples,measurementSamples,modes:[...seen],layouts:variants.size}));

