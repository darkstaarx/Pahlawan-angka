// Pahlawan Angka — Year 1 Curriculum Bank v2 runtime v3.62.6
(function(){
'use strict';
const VERSION='3.62.6',C=window.PAY1CompetencyV2;
if(!C)return;
const VH=window.PAKSSRDepth?.visualHelpers||{};
const Nq=(v,t)=>N(v,t),choose=a=>pick(a),rand=(a,b)=>R(a,b);
const sessRef=()=>{try{return typeof sess!=='undefined'?sess:window.sess}catch(_){return window.sess}};
const stage=s=>{
 const m=Number(s?.mastery||0),e=Number(s?.evidence||0),c=Number(s?.confidence||0),w=Number(s?.wrong||0);
 if(e<2||m<30)return 1;if(w>=2&&e<=4)return 1;if(e>=5&&m>=60&&c>=50)return 3;return 2;
};
const names=['Aina','Hakim','Siti','Kumar','Mei Ling','Arun','Izzah','Daniel'];
const foods=['karipap','pau','kuih lapis','roti canai','kuih seri muka'];
const fruits=['rambutan','pisang','jambu','mangga','limau'];
const places=['kantin sekolah','pasar pagi','kedai runcit','perpustakaan sekolah','perhentian bas'];
const name=()=>choose(names),food=()=>choose(foods),fruit=()=>choose(fruits),place=()=>choose(places);
const table=(h,rows)=>VH.miniTable?VH.miniTable(h,rows):'<table>'+rows.map(x=>'<tr>'+x.map(y=>'<td>'+y+'</td>').join('')+'</tr>').join('')+'</table>';
const pictograph=(labels,vals)=>VH.pictograph?VH.pictograph(labels,vals):table(['Item','Bilangan'],labels.map((x,i)=>[x,vals[i]]));
const numLine=(min,max,value,label='?')=>VH.numLine?VH.numLine(min,max,value,label):'<div class="kssrDiagram">'+Array.from({length:max-min+1},(_,i)=>min+i===value?label:min+i).join(' — ')+'</div>';
const fractionStrip=(n,d)=>VH.fractionStrip?VH.fractionStrip(n,d):'<div class="kssrDiagram">'+('■'.repeat(n)+'□'.repeat(Math.max(0,d-n)))+'</div>';
const fractionSet=(n,d)=>VH.fractionSet?VH.fractionSet(n,d):'<div class="kssrDiagram">'+('●'.repeat(n)+'○'.repeat(Math.max(0,d-n)))+'</div>';
function q(prompt,answer,wrong,hint,kind){return Q(prompt,answer,wrong,hint,kind,true,true)}
function recentFor(id){return (sessRef()?.questionHistory||[]).filter(x=>x.skillId===id).slice(-30)}
function chooseNode(id){
 const route=C.routes[id]||[];if(!route.length)return null;
 const seen=recentFor(id).map(x=>x.subcompetencyId||x.competencyId||x.curriculumNode||String(x.standardRef||'').split('/')[0]).filter(Boolean);
 const last=seen.at(-1),counts=Object.fromEntries(route.map(n=>[n,seen.filter(x=>x===n).length]));
 const pool=route.filter(n=>n!==last);
 return (pool.length?pool:route).sort((a,b)=>counts[a]-counts[b]||Math.random()-.5)[0];
}
function chooseMode(id,node,modes){
 const writtenModes={'2.2.1':'fact_direct','2.2.2':'add_two','2.3.1':'fact_direct','2.3.2':'sub_two'};
 const sessionHistory=sessRef()?.questionHistory||[];
 const history=recentFor(id).filter(item=>String(item.subcompetencyId||'')===node||String(item.archetypeId||'').startsWith('y1v2_'+node.replaceAll('.','_')+'_'));
 if(writtenModes[node]&&sessionHistory.length&&[0,3].includes(history.length%5))return writtenModes[node];
 const prefix='y1v2_'+node.replaceAll('.','_')+'_',full=modes.map(m=>prefix+m);
 const recent=recentFor(id).map(x=>String(x.archetypeId||'')),last=recent.at(-1),counts=Object.fromEntries(full.map(m=>[m,recent.filter(x=>x===m).length]));
 const pool=full.filter(m=>m!==last),chosen=(pool.length?pool:full).sort((a,b)=>counts[a]-counts[b]||Math.random()-.5)[0];
 return chosen.slice(prefix.length);
}
function bandModes(s,low,core,high){return stage(s)===1?low:stage(s)===3?high:core}
function mark(out,id,node,mode,rep,demand,s,targets=[]){
 if(!out)return out;const meta=C.byId[node];
 out.source='kssr-year1-curriculum-v2-v3.62.6';out.standardRef=node;out.competencyId=node;out.subcompetencyId=node;out.curriculumNode=node;
 out.curriculumUnit=meta?.unit;out.curriculumUnitTitle=meta?.unitTitle;out.competencyTitle=meta?.title;
 out.archetypeId='y1v2_'+node.replaceAll('.','_')+'_'+mode;out.representation=rep;out.demand=demand;
 if(['fact_direct','add_two','sub_two'].includes(mode)&&['2.2.1','2.2.2','2.3.1','2.3.2'].includes(node))out.writtenArithmeticMode='required';
 out.difficultyBand=stage(s)===3?4:stage(s)===2?3:1;out.misconceptionTargets=targets;out.kssrYear1V2Version=VERSION;
 return out;
}
function words(n){
 n=Number(n);if(n===0)return'sifar';if(n===100)return'seratus';
 const one=['','satu','dua','tiga','empat','lima','enam','tujuh','lapan','sembilan'];
 if(n<10)return one[n];if(n===10)return'sepuluh';if(n===11)return'sebelas';if(n<20)return one[n-10]+' belas';
 const t=Math.floor(n/10),o=n%10;return one[t]+' puluh'+(o?' '+one[o]:'');
}
function wrongNums(ans,step=1,tag='operation'){
 const vals=[ans+step,Math.max(0,ans-step),ans+step*2],seen=new Set([String(ans)]),out=[];
 for(const v of vals)if(!seen.has(String(v))){seen.add(String(v));out.push(Nq(v,tag))}
 let k=3;while(out.length<3){const v=Math.max(0,ans+k++);if(!seen.has(String(v))){seen.add(String(v));out.push(Nq(v,tag))}}
 return out.slice(0,3);
}
function dots(n){
 if(typeof countingObjects==='function')return countingObjects(n);
 const cols=5,rows=Math.ceil(n/cols),w=250,h=Math.max(70,rows*38+18);let s='';
 for(let i=0;i<n;i++){const x=35+(i%cols)*45,y=28+Math.floor(i/cols)*38;s+=`<circle cx="${x}" cy="${y}" r="10" class="kd-fill"/>`}
 return `<div class="kssrDiagram"><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${n} objek">${s}</svg></div>`;
}
function estimateCloud(n){
 const cols=7,rows=Math.ceil(n/cols),w=290,h=Math.max(80,rows*28+18);let s='';
 for(let i=0;i<n;i++){const x=25+(i%cols)*39+(i%2?4:0),y=24+Math.floor(i/cols)*28+(i%3);s+=`<circle cx="${x}" cy="${y}" r="7" class="kd-fill"/>`}
 return `<div class="kssrDiagram"><svg viewBox="0 0 ${w} ${h}" aria-label="sekumpulan objek untuk dianggar">${s}</svg></div>`;
}
// Unit bukan piawai: pemadam 2.5D disusun hujung ke hujung di bawah objek yang diukur.
// Objek pendek satu perkataan sahaja (pemadam), bukan klip kertas yang panjang.
function nonStandard(count,label='pemadam',object='buku'){
 const U=34,d=6,x0=22,top=50,h=20,L=count*U,W=x0*2+L+d+4,H=top+h+12,ink='#123158';
 const objects={
  buku:`<polygon points="${x0},24 ${x0+d},18 ${x0+L+d},18 ${x0+L},24" fill="#fff6dc" stroke="${ink}" stroke-width="1.6"/>`+
       `<polygon points="${x0+L},24 ${x0+L+d},18 ${x0+L+d},36 ${x0+L},42" fill="#f1e2b8" stroke="${ink}" stroke-width="1.6"/>`+
       `<rect x="${x0}" y="24" width="${L}" height="18" rx="2" fill="#4f83d1" stroke="${ink}" stroke-width="1.8"/>`+
       `<rect x="${x0}" y="24" width="8" height="18" fill="#3a66ad" stroke="${ink}" stroke-width="1.2"/>`,
  pensel:`<rect x="${x0}" y="26" width="10" height="14" rx="3" fill="#ff8fb1" stroke="${ink}" stroke-width="1.6"/>`+
       `<rect x="${x0+10}" y="26" width="6" height="14" fill="#c9ced8" stroke="${ink}" stroke-width="1.4"/>`+
       `<rect x="${x0+16}" y="26" width="${Math.max(8,L-34)}" height="14" fill="#ffd24b" stroke="${ink}" stroke-width="1.6"/>`+
       `<line x1="${x0+16}" y1="33" x2="${x0+L-18}" y2="33" stroke="#e0a91a" stroke-width="1.5"/>`+
       `<polygon points="${x0+L-18},26 ${x0+L},33 ${x0+L-18},40" fill="#f3c99a" stroke="${ink}" stroke-width="1.6"/>`+
       `<polygon points="${x0+L-6},30.7 ${x0+L},33 ${x0+L-6},35.3" fill="${ink}"/>`,
  reben:`<path d="M${x0} 26 Q${x0+L/4} 20 ${x0+L/2} 26 T${x0+L} 26 L${x0+L} 40 Q${x0+L*3/4} 46 ${x0+L/2} 40 T${x0} 40 Z" fill="#ff6b8a" stroke="${ink}" stroke-width="1.6"/>`
 };
 let ers='';
 for(let i=0;i<count;i++){
  const x=x0+i*U,body=i%2?'#fff3d6':'#f7a1b5',topc=i%2?'#fffaf0':'#fbc6d3',cut=x+1+(U-2)*0.58;
  ers+=`<g><polygon points="${x+1},${top} ${x+1+d},${top-d} ${x+U-1+d},${top-d} ${x+U-1},${top}" fill="${topc}" stroke="${ink}" stroke-width="1.4"/>`+
   `<polygon points="${x+U-1},${top} ${x+U-1+d},${top-d} ${x+U-1+d},${top+h-d} ${x+U-1},${top+h}" fill="#2f8fc4" stroke="${ink}" stroke-width="1.4"/>`+
   `<rect x="${x+1}" y="${top}" width="${(U-2)*0.58}" height="${h}" rx="3" fill="${body}" stroke="${ink}" stroke-width="1.6"/>`+
   `<rect x="${cut}" y="${top}" width="${(U-2)*0.42}" height="${h}" fill="#59c8ff" stroke="${ink}" stroke-width="1.6"/></g>`;
 }
 const guides=`<line x1="${x0}" y1="12" x2="${x0}" y2="${top+h+8}" stroke="#7b8aa3" stroke-width="1.5" stroke-dasharray="4 3"/>`+
  `<line x1="${x0+L}" y1="12" x2="${x0+L}" y2="${top+h+8}" stroke="#e8a400" stroke-width="2.5" stroke-dasharray="5 3"/>`;
 return `<div class="kssrDiagram"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${object} diukur dengan ${count} ${label} yang disusun hujung ke hujung" style="max-width:100%;height:auto">${guides}${objects[object]||objects.buku}${ers}</svg></div>`;
}
function tally(n){return '||||| '.repeat(Math.floor(n/5))+'|'.repeat(n%5)}
// Rajah asli untuk nombor puluh/sa dan perbandingan kuantiti Tahun 1.
function baseTenBlocks(tens,ones){
 const rod=Array.from({length:tens},(_,i)=>{const x=18+i*19;return `<g><rect x="${x}" y="15" width="15" height="90" rx="2" fill="#75b7ed" stroke="#315c85" stroke-width="1.3"/>${Array.from({length:9},(_,j)=>`<line x1="${x}" y1="${24+j*9}" x2="${x+15}" y2="${24+j*9}" stroke="#315c85" stroke-width=".6"/>`).join('')}</g>`}).join('');
 const cubes=Array.from({length:ones},(_,i)=>{const x=205+i%5*18,y=16+Math.floor(i/5)*20;return `<rect x="${x}" y="${y}" width="15" height="15" rx="1.5" fill="#97d5a1" stroke="#287446" stroke-width="1.2"/>`}).join('');
 return `<div class="kssrDiagram"><svg viewBox="0 0 315 138" role="img" aria-label="Blok puluh dan blok sa"><text x="90" y="127" text-anchor="middle" fill="#ccdafa" font-size="13" font-weight="700">Puluh</text><text x="250" y="127" text-anchor="middle" fill="#ccdafa" font-size="13" font-weight="700">Sa</text>${rod}${cubes}</svg></div>`;
}
function compareDots(a,b){
 const row=(n,y)=>Array.from({length:n},(_,i)=>`<circle cx="${93+i*21}" cy="${y}" r="7" fill="#79d2b6" stroke="#336b63" stroke-width="1.4"/>`).join('');
 return `<div class="kssrDiagram"><svg viewBox="0 0 315 89" role="img" aria-label="Dua kumpulan objek untuk dibandingkan"><text x="10" y="28" fill="#ccdafa" font-size="13">A</text><text x="10" y="70" fill="#ccdafa" font-size="13">B</text>${row(a,24)}${row(b,66)}</svg></div>`;
}
function shapePatternSvg(kinds){
 const one=(shape,x)=>{if(!shape)return `<rect x="${x}" y="13" width="46" height="46" rx="5" fill="none" stroke="#94a9c8" stroke-dasharray="5 3" stroke-width="2"/><text x="${x+23}" y="44" text-anchor="middle" font-size="24" fill="#eac76f">?</text>`;
 if(shape==='bulatan')return `<circle cx="${x+23}" cy="36" r="20" fill="#f4b949" stroke="#a36c17" stroke-width="2"/>`;
 if(shape==='segi tiga')return `<polygon points="${x+23},13 ${x+2},56 ${x+44},56" fill="#6dbda8" stroke="#367463" stroke-width="2"/>`;
 return `<rect x="${x+4}" y="17" width="38" height="38" fill="#7da7e4" stroke="#416499" stroke-width="2"/>`};
 return `<div class="kssrDiagram"><svg viewBox="0 0 332 77" role="img" aria-label="Pola bentuk dan satu tempat kosong">${kinds.map((v,i)=>one(v,6+i*55)).join('')}</svg></div>`;
}
// Gambar asli untuk pengukuran bukan piawai: jawapan dibaca daripada rajah.
function balanceBlocks(n){
 const blocks=Array.from({length:n},(_,i)=>{const x=188+(i%4)*22,y=72-Math.floor(i/4)*22;return `<rect x="${x}" y="${y}" width="19" height="19" rx="3" fill="#8fd3be" stroke="#377d65" stroke-width="1.3"/>`}).join('');
 return `<div class="kssrDiagram"><svg viewBox="0 0 310 140" role="img" aria-label="Neraca dengan sebuah beg dan beberapa blok"><line x1="30" y1="87" x2="284" y2="87" stroke="#aec6e3" stroke-width="4"/><polygon points="154,86 130,124 178,124" fill="#91a9cb"/><rect x="124" y="124" width="60" height="8" rx="3" fill="#6e89ae"/><path d="M55,83 L67,53 L108,53 L119,83 Z" fill="#f7bd78" stroke="#956035" stroke-width="2"/><path d="M76,56 Q85,29 99,56" fill="none" stroke="#956035" stroke-width="4"/><rect x="180" y="83" width="105" height="5" rx="2" fill="#6f93af"/>${blocks}</svg></div>`;
}
function capacityCups(n){
 // 1 jag bersamaan n cawan seragam; bukan perbandingan paras separuh penuh.
 const cups=Array.from({length:n},(_,i)=>{
  const x=128+(i%4)*40,y=n<=4?47:20+Math.floor(i/4)*51;
  return `<g class="paCapacityCup"><path d="M${x} ${y} h28 l-4 35 h-20 Z" fill="#eaf7ff" stroke="#347da5" stroke-width="2.2"/><path d="M${x+2} ${y+7} h24 l-4 25 h-16 Z" fill="#66b8dd"/><path d="M${x+2} ${y+7} h24" stroke="#2e8ab8" stroke-width="1.5"/></g>`;
 }).join("");
 return `<div class="kssrDiagram paCapacityCups"><svg viewBox="0 0 310 139" role="img" aria-label="Satu jag bersamaan dengan beberapa cawan air yang sama saiz. Kira bilangan cawan.">
 <path d="M14 24 H80 L73 110 Q51 129 25 110 Z" fill="#eaf7ff" stroke="#347da5" stroke-width="2.8"/>
 <path d="M79 42 Q101 40 92 69 L76 82" fill="none" stroke="#347da5" stroke-width="8" stroke-linecap="round"/>
 <path d="M18 41 H77 L71 108 Q51 124 27 108 Z" fill="#66b8dd"/>
 <path d="M18 41 H77" stroke="#2e8ab8" stroke-width="2"/>
 <path d="M103 65 H119 M103 78 H119" stroke="#406d91" stroke-width="4" stroke-linecap="round"/>
 ${cups}</svg></div>`;
}

function measureRopes(values){
 const max=Math.max(...values),bars=values.map((v,i)=>{
  const x=100,y=26+i*43,w=Math.round(v/max*215);
  return `<g class="paU6Rope"><text x="48" y="${y+5}">${'ABC'[i]}</text><path d="M${x} ${y+5} h${w}" stroke="#966331" stroke-width="16" stroke-linecap="round" opacity=".3"/><path d="M${x} ${y} h${w}" stroke="#bb8c4e" stroke-width="16" stroke-linecap="round"/><path d="M${x} ${y-3} h${w}" stroke="#f5ce87" stroke-width="6" stroke-linecap="round"/><path d="M${x} ${y-6} h${w}" stroke="#fff4d1" stroke-width="2" stroke-linecap="round"/></g>`;
 }).join('');
 return `<div class="kssrDiagram paU6Scene"><svg viewBox="0 0 340 144" role="img" aria-label="Tiga tali A B dan C untuk dibandingkan"><rect x="1" y="1" width="338" height="142" rx="15" fill="#f5f9ff" stroke="#d7e3f1"/>${bars}</svg></div>`;
}

function measureUnits(kind,values,labels){
 const h=values.length===3?165:140,step=kind==='cawan'?23:25,ys=values.length===3?[12,63,114]:[17,82];
 const rows=values.map((n,row)=>{
  const y=ys[row],units=Array.from({length:n},(_,i)=>{
   const x=95+i*step;
   if(kind==='cawan')return `<g class="paU6Unit"><path d="M${x} ${y} h20 l-3 29 h-14 Z" fill="#e3f5ff" stroke="#367b9d" stroke-width="1.7"/><path d="M${x+2} ${y+8} h16 l-3 18 h-10 Z" fill="#65bce4"/><path d="M${x+4} ${y+4} v12" stroke="#fff" stroke-width="2.2" opacity=".8"/></g>`;
   const light=kind==='jengkal'?'#ffd98b':'#91d8d4',dark=kind==='jengkal'?'#d79747':'#3b9f9a';
   return `<g class="paU6Unit"><polygon points="${x},${y+5} ${x+4},${y} ${x+step-2},${y} ${x+step-6},${y+5}" fill="#fff3ca" stroke="#55768a" stroke-width="1.1"/><rect x="${x}" y="${y+5}" width="${step-6}" height="24" rx="2" fill="${light}" stroke="#4d6c83" stroke-width="1.3"/><path d="M${x+step-6} ${y+5} l4 -5 v24 l-4 5Z" fill="${dark}" stroke="#4d6c83" stroke-width="1"/><path d="M${x+3} ${y+9} h${step-12}" stroke="#fff" stroke-width="2"/></g>`;
  }).join('');
  return `<g class="paU6Row"><text x="42" y="${y+18}">${labels[row]}</text><text x="82" y="${y+18}">=</text>${units}</g>`;
 }).join('');
 return `<div class="kssrDiagram paU6Scene"><svg viewBox="0 0 340 ${h}" role="img" aria-label="Baris perbandingan menggunakan unit ${kind} yang sama saiz"><rect x="1" y="1" width="338" height="${h-2}" rx="15" fill="#f5f9ff" stroke="#d7e3f1"/>${rows}</svg></div>`;
}

function measureBeakers(levels){
 const beakers=levels.map((f,i)=>{
  const x=38+i*101,y=12,w=62,h=91,lh=f*h;
  return `<g class="paU6Beaker"><path d="M${x} ${y} V${y+h} H${x+w} V${y}" fill="#e8f6fe" stroke="#406f8f" stroke-width="3"/><rect x="${x+3}" y="${y+h-lh}" width="${w-6}" height="${lh}" fill="#72c2ea"/><path d="M${x+3} ${y+h-lh} h${w-6}" stroke="#2686bd" stroke-width="2"/><path d="M${x+8} ${y+9} v${h-19}" stroke="#fff" stroke-width="4" opacity=".7"/><text x="${x+w/2}" y="128">${'ABC'[i]}</text></g>`;
 }).join('');
 return `<div class="kssrDiagram paU6Scene"><svg viewBox="0 0 340 145" role="img" aria-label="Tiga bekas sama saiz dengan aras air berbeza"><rect x="1" y="1" width="338" height="143" rx="15" fill="#f5f9ff" stroke="#d7e3f1"/>${beakers}</svg></div>`;
}

function measureBalance(heavy='A',blocks=0){
 const pan=(x,y)=>`<g><path d="M${x-34} ${y} Q${x} ${y+17} ${x+34} ${y}" stroke="#567b91" stroke-width="3" fill="none"/><path d="M${x-28} ${y} L${x} ${y-34} L${x+28} ${y}" stroke="#789ab3" stroke-width="1.6" fill="none"/></g>`;
 if(blocks>0){
  const cubes=Array.from({length:blocks},(_,i)=>{const x=221+i%4*18,y=110-Math.floor(i/4)*20;return `<g class="paU6Unit"><rect x="${x}" y="${y}" width="16" height="17" rx="2" fill="#86d7c9" stroke="#33776d" stroke-width="1.3"/><path d="M${x} ${y} l4 -4 h16 l-4 4Z" fill="#c8f5e8" stroke="#33776d" stroke-width=".8"/></g>`}).join('');
  return `<div class="kssrDiagram paU6Scene"><svg viewBox="0 0 340 155" role="img" aria-label="Neraca seimbang dengan beg di sebelah kiri dan beberapa blok di sebelah kanan"><rect x="1" y="1" width="338" height="153" rx="15" fill="#f5f9ff" stroke="#d7e3f1"/><path d="M170 52 L144 146 H196 Z" fill="#aebed1" stroke="#718ba4" stroke-width="2"/><path d="M66 55 H274" stroke="#536f91" stroke-width="7" stroke-linecap="round"/><circle cx="170" cy="55" r="8" fill="#ffcc77" stroke="#997343" stroke-width="2"/>${pan(65,128)}${pan(274,128)}<path d="M40 128 L48 93 H94 L100 128 Z" fill="#f2c48d" stroke="#9d6333" stroke-width="2"/><path d="M55 94 Q70 73 84 94" stroke="#9d6333" stroke-width="4" fill="none"/>${cubes}</svg></div>`;
 }
 const ly=heavy==='A'?88:61,ry=heavy==='A'?61:88;
 const box=(x,y,label)=>`<g><rect x="${x-19}" y="${y-30}" width="38" height="28" rx="3" fill="#f1bf82" stroke="#9c6230" stroke-width="2"/><path d="M${x-15} ${y-26} h30" stroke="#fff1d0" stroke-width="2"/><text x="${x}" y="${y-10}">${label}</text></g>`;
 return `<div class="kssrDiagram paU6Scene"><svg viewBox="0 0 340 163" role="img" aria-label="Neraca tidak seimbang dengan kotak A dan B"><rect x="1" y="1" width="338" height="161" rx="15" fill="#f5f9ff" stroke="#d7e3f1"/><path d="M170 72 L143 153 H197 Z" fill="#aebed1" stroke="#718ba4" stroke-width="2"/><path d="M66 ${ly-34} L274 ${ry-34}" stroke="#536f91" stroke-width="8" stroke-linecap="round"/><circle cx="170" cy="${(ly+ry)/2-34}" r="8" fill="#ffcc77" stroke="#997343" stroke-width="2"/>${pan(66,ly+20)}${pan(274,ry+20)}${box(66,ly+20,'A')}${box(274,ry+20,'B')}</svg></div>`;
}

function solid(kind){
 const common='class="kd-shape"';
 const map={
  kubus:`<polygon points="75,30 135,15 175,45 115,62" ${common}/><polygon points="75,30 115,62 115,125 75,92" ${common}/><polygon points="115,62 175,45 175,105 115,125" ${common}/>`,
  kuboid:`<polygon points="55,35 145,20 190,45 100,62" ${common}/><polygon points="55,35 100,62 100,120 55,93" ${common}/><polygon points="100,62 190,45 190,103 100,120" ${common}/>`,
  kon:`<path d="M115 18 L55 120 Q115 145 175 120 Z" ${common}/><ellipse cx="115" cy="120" rx="60" ry="18" ${common}/>`,
  silinder:`<ellipse cx="115" cy="35" rx="55" ry="18" ${common}/><rect x="60" y="35" width="110" height="85" ${common}/><ellipse cx="115" cy="120" rx="55" ry="18" ${common}/>`,
  sfera:`<circle cx="115" cy="78" r="58" ${common}/><ellipse cx="115" cy="78" rx="58" ry="18" fill="none" class="kd-line"/>`,
  piramid:`<polygon points="115,15 45,120 185,120" ${common}/><line x1="115" y1="15" x2="155" y2="95" class="kd-line"/><polygon points="45,120 155,95 185,120 75,140" ${common}/>`
 };
 return `<div class="kssrDiagram"><svg viewBox="0 0 230 155" role="img" aria-label="bentuk ${kind}">${map[kind]||''}</svg></div>`;
}
function clock(h,m){return typeof clockSvg==='function'?clockSvg(h,m):`<div class="kssrDiagram">Jam ${h}:${String(m).padStart(2,'0')}</div>`}
function moneyVis(c){return typeof moneyVisual==='function'?moneyVisual(c):`<div class="kssrDiagram">${c<100?c+' sen':'RM'+(c/100)}</div>`}
window.PAY1V2Runtime={version:VERSION,C,GEN:{},stage,Nq,choose,rand,q,recentFor,chooseNode,chooseMode,bandModes,mark,words,wrongNums,dots,estimateCloud,nonStandard,tally,baseTenBlocks,compareDots,shapePatternSvg,balanceBlocks,capacityCups,measureRopes,measureUnits,measureBeakers,measureBalance,solid,clock,moneyVis,table,pictograph,numLine,fractionStrip,fractionSet,name,food,fruit,place};
document.documentElement?.setAttribute('data-y1-v2-runtime',VERSION);
})();
