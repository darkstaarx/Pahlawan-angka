// Pahlawan Angka v3.23.0 — Tahun 6 KSSR Space + Data curriculum repair.
// Loaded after v3.18.1 integrity and v3.22.0 depth. It migrates the active
// graph before gameplay starts, extends mastery/integrity contracts, and
// replaces only the affected Tahun 6 question paths.
(function(){
'use strict';

const VERSION='3.23.0';
const RETIRED=['D6.AREA','D6.DATA'];
const ACTIVE_NEW=['D6.ANGLE','D6.CIRCLE','D6.SPACE_PROBLEM','D6.PIE','D6.DATA_PROBLEM'];
const MANAGED=[...ACTIVE_NEW,'D6.PROB','D6.COORD'];
const banks=window.PAQuestionBanks=window.PAQuestionBanks||{};
const previousD6=banks.d6;

const sessionRef=()=>{try{return typeof sess!=='undefined'?sess:window.sess}catch(_){return window.sess}};
const recentModes=id=>(sessionRef()?.questionHistory||[]).filter(x=>x.skillId===id).slice(-8).map(x=>String(x.archetypeId||'').replace(/^y6gap_/,''));
function rotate(id,modes){
  const recent=recentModes(id),last=recent.at(-1),counts=Object.fromEntries(modes.map(x=>[x,recent.filter(y=>y===x).length]));
  const pool=modes.filter(x=>x!==last);
  return (pool.length?pool:modes).sort((a,b)=>counts[a]-counts[b]||Math.random()-.5)[0];
}
function mark(q,id,mode,rep='symbolic',demand='procedure',targets=[]){
  if(!q)return q;
  q.familyKey=id;
  q.competencyId=mode;
  q.archetypeId=`y6gap_${mode}`;
  q.representation=rep;
  q.demand=demand;
  q.contextId=`kssr-y6:${id}:${mode}`;
  q.difficultyBand=demand==='reasoning'?4:demand==='application'?3:demand==='procedure'?2:1;
  q.misconceptionTargets=targets.length?targets:[q.wrong?.[0]?.tag||'generated'];
  q.kssrGapVersion=VERSION;
  return q;
}
const nchoice=(v,tag)=>N(v,tag);
const uniquePick=(arr,count,exclude=[])=>{
  const pool=arr.filter(x=>!exclude.includes(x)),out=[];
  while(out.length<count&&pool.length){const i=R(0,pool.length-1);out.push(pool.splice(i,1)[0]);}
  return out;
};
const polar=(cx,cy,r,deg)=>{
  const a=deg*Math.PI/180;
  return [cx+r*Math.cos(a),cy-r*Math.sin(a)];
};
const fmt=(n,dp=2)=>Number.isInteger(Number(n))?String(Number(n)):String(Number(Number(n).toFixed(dp)));

// ---------- Curriculum graph migration ----------
const oldMeta={};
for(const id of RETIRED){
  if(typeof META!=='undefined'&&META[id])oldMeta[id]={...META[id]};
}
if(typeof GRAPH!=='undefined'&&Array.isArray(GRAPH.skills)){
  GRAPH.skills=GRAPH.skills.filter(s=>!RETIRED.includes(s.id));
}
if(typeof META!=='undefined'){
  RETIRED.forEach(id=>{try{delete META[id]}catch(_){ }});
}
if(typeof REC!=='undefined')RETIRED.forEach(id=>{try{delete REC[id]}catch(_){ }});
if(typeof STR!=='undefined'){
  Object.keys(STR).forEach(k=>{if(RETIRED.includes(STR[k]))delete STR[k]});
}

const skillDefs=[
 {
  id:'D6.ANGLE',grade:6,chapter:'7',domain:'Ruang',title:'Sudut dan poligon sekata',prereq:[],role:'core',
  kssrStandards:['6.1.1','6.1.2'],
  masterySpec:{
   concepts:['sudut pedalaman poligon sekata','mengukur sudut hingga 180°','membentuk sudut berdasarkan nilai diberi'],
   misconceptions:['angle_measure','angle_construct','polygon_angle'],
   recovery:['labelled_angle','protractor','guided_construction'],
   demands:['concept','procedure','application']
  }
 },
 {
  id:'D6.CIRCLE',grade:6,chapter:'7',domain:'Ruang',title:'Pusat, jejari dan diameter bulatan',prereq:[],role:'core',
  kssrStandards:['6.2.1','6.2.2'],
  masterySpec:{
   concepts:['pusat bulatan','jejari','diameter','melukis bulatan berdasarkan jejari'],
   misconceptions:['circle_part','radius_diameter','circle_draw'],
   recovery:['labelled_circle','radius_model','compass_setup'],
   demands:['concept','procedure','application']
  }
 },
 {
  id:'D6.SPACE_PROBLEM',grade:6,chapter:'7',domain:'Ruang',title:'Masalah harian melibatkan ruang',prereq:['D6.ANGLE','D6.CIRCLE'],role:'core',
  kssrStandards:['6.3.1'],
  masterySpec:{
   concepts:['memilih maklumat geometri','menghubungkan sudut dan ciri bulatan','menyelesaikan masalah ruang'],
   misconceptions:['space_reason','angle_measure','radius_diameter'],
   recovery:['diagram','identify_knowns','guided_problem'],
   demands:['application','reasoning','transfer']
  }
 },
 {
  id:'D6.PIE',grade:6,chapter:'8',domain:'Data',title:'Carta pai 45°, 90° dan 180°',prereq:['D5.DATA'],role:'core',
  kssrStandards:['8.1.1'],
  masterySpec:{
   concepts:['sudut sektor carta pai','hubungan sudut dengan kuantiti','mentafsir carta pai'],
   misconceptions:['pie_angle','pie_quantity','data'],
   recovery:['table','fraction_of_whole','pie_model'],
   demands:['concept','procedure','application']
  }
 },
 {
  id:'D6.DATA_PROBLEM',grade:6,chapter:'8',domain:'Data',title:'Masalah data dan kebolehjadian',prereq:['D6.PIE','D6.PROB'],role:'core',
  kssrStandards:['8.3.1'],
  masterySpec:{
   concepts:['mentafsir data dalam situasi harian','membuat keputusan daripada carta pai','menaakul kebolehjadian daripada data'],
   misconceptions:['data_reason','pie_quantity','chance_reason'],
   recovery:['table','pie_model','event_reasoning'],
   demands:['application','reasoning','transfer']
  }
 }
];

function alignSkill(s,unit,title){
  s.gameplayChapter=String(s.chapter);
  s.textbookUnit=unit;
  s.textbookUnitTitle=title;
  s.mappingConfidence='verified-standard-v3.23.0';
  s.coverage='explicit';
  return s;
}
const unitTitle={6:'Ruang',7:'Koordinat, Nisbah dan Kadaran',8:'Pengurusan Data dan Kebolehjadian'};
for(const raw of skillDefs){
  const s=alignSkill(raw,raw.id.startsWith('D6.PIE')||raw.id.startsWith('D6.DATA_')?8:6,raw.id.startsWith('D6.PIE')||raw.id.startsWith('D6.DATA_')?unitTitle[8]:unitTitle[6]);
  if(typeof META!=='undefined'&&!META[s.id]){
    GRAPH.skills.push(s);
    META[s.id]=s;
  }else if(typeof META!=='undefined'){
    Object.assign(META[s.id],s);
  }
}

// Existing D6.PROB is a valid graph node, but its old content was numeric/fractional.
// KSSR Tahun 6 requires qualitative chance language plus a reasonable reason.
if(typeof META!=='undefined'&&META['D6.PROB']){
  Object.assign(META['D6.PROB'],alignSkill({
    ...META['D6.PROB'],
    chapter:'8',domain:'Kebolehjadian',title:'Kebolehjadian dan sebab munasabah',
    kssrStandards:['8.2.1','8.2.2'],
    masterySpec:{
      concepts:['mungkin atau tidak mungkin berlaku','mustahil hingga pasti','memberi sebab munasabah'],
      misconceptions:['chance_category','chance_reason','data'],
      recovery:['experiment','event_list','qualitative_scale'],
      demands:['concept','application','reasoning']
    }
  },8,unitTitle[8]));
}

// Existing D6.COORD belongs to textbook Unit 7, not the Ruang mastery bucket.
if(typeof META!=='undefined'&&META['D6.COORD']){
  Object.assign(META['D6.COORD'],alignSkill({
    ...META['D6.COORD'],
    domain:'Koordinat',title:'Koordinat dan jarak berskala',
    kssrStandards:['7.1.1'],
    masterySpec:{
      concepts:['jarak mengufuk','jarak mencancang','skala lokasi'],
      misconceptions:['coord','scale_read','direction'],
      recovery:['labelled_grid','scale_bar','guided_route'],
      demands:['concept','application','reasoning']
    }
  },7,unitTitle[7]));
}

// Repair recovery/stretch pointers after v3.18.1 may have restored legacy targets.
if(typeof REC!=='undefined'){
  Object.assign(REC,{
    'D6.ANGLE':[],
    'D6.CIRCLE':[],
    'D6.SPACE_PROBLEM':[],
    'D6.PIE':['D5.DATA'],
    'D6.PROB':['D5.DATA'],
    'D6.DATA_PROBLEM':['D5.DATA'],
    'D6.COORD':['D5.COORD']
  });
  RETIRED.forEach(id=>delete REC[id]);
}
if(typeof STR!=='undefined'){
  Object.keys(STR).forEach(k=>{if(RETIRED.includes(STR[k]))delete STR[k]});
  Object.assign(STR,{'D5.AREA':'D6.ANGLE','D5.DATA':'D6.PIE','D5.COORD':'D6.COORD'});
}

// Archive old learner state for auditability but never transfer it to the new skills.
try{
  if(typeof db!=='undefined'&&db?.skills){
    db.legacySkills=db.legacySkills||{};
    for(const id of RETIRED){
      if(db.skills[id]&&!db.legacySkills[id])db.legacySkills[id]={...db.skills[id],retiredBy:VERSION,reason:'KSSR Tahun 6 curriculum graph repair'};
    }
    db.curriculumMigrations=db.curriculumMigrations||{};
    db.curriculumMigrations.year6SpaceData=VERSION;
    for(const id of ACTIVE_NEW){
      if(typeof initSkill==='function'&&!db.skills[id])initSkill(id);
    }
    if(typeof save==='function')save();
  }
}catch(_){}

// ---------- Mastery profile repair ----------
const extraLabels={
  angle_measure:'mengukur sudut',
  angle_construct:'membentuk sudut',
  polygon_angle:'sudut pedalaman poligon',
  circle_part:'bahagian bulatan',
  radius_diameter:'jejari dan diameter',
  circle_draw:'melukis bulatan daripada jejari',
  space_reason:'penaakulan ruang',
  pie_angle:'sudut sektor carta pai',
  pie_quantity:'kuantiti dalam carta pai',
  chance_category:'tahap kebolehjadian',
  chance_reason:'sebab kebolehjadian',
  data_reason:'penaakulan data',
  scale_read:'membaca skala',
  direction:'arah dan jarak'
};
const oldMasteryProfile=window.masteryProfile;
const oldMasteryDecision=window.masteryEvidenceDecision;
const oldMisLabel=window.masteryMisconceptionLabel;

function buildManagedProfile(skill){
  const spec=skill.masterySpec||{};
  return{
    id:skill.id,grade:skill.grade,chapter:String(skill.chapter),domain:skill.domain,title:skill.title,
    sources:{curriculum:'curriculum-backed',misconceptions:'research-backed',masteryThreshold:'hypothesis-to-calibrate'},
    prerequisites:[...(skill.prereq||[])],
    concepts:[...(spec.concepts||[skill.title])],
    misconceptions:[...(spec.misconceptions||['generated'])],
    recoverySequence:[...(spec.recovery||['diagram','guided','independent'])],
    evidence:{requiredClean:3,requiredRepresentations:2,requireUnassisted:true,requireTransfer:true,delayedChecksHours:[24,168,720],demands:[...(spec.demands||['concept','procedure','application'])]},
    thresholds:{emerging:40,developing:60,secure:80,retained:85},
    kssrStandards:[...(skill.kssrStandards||[])]
  };
}
const managedProfiles={};
if(window.PAMasteryKB?.profiles&&typeof META!=='undefined'){
  RETIRED.forEach(id=>delete PAMasteryKB.profiles[id]);
  for(const id of MANAGED){
    if(META[id]){
      managedProfiles[id]=buildManagedProfile(META[id]);
      PAMasteryKB.profiles[id]=managedProfiles[id];
    }
  }
  Object.assign(PAMasteryKB.labels||{},extraLabels);
}
window.masteryProfile=function(id){
  return managedProfiles[id]||oldMasteryProfile?.(id)||window.PAMasteryKB?.profiles?.[id]||null;
};
window.masteryMisconceptionLabel=function(tag){
  return extraLabels[tag]||oldMisLabel?.(tag)||'bahagian ini';
};
function managedDecision(skillId,history=[]){
  const p=managedProfiles[skillId];
  if(!p)return oldMasteryDecision?.(skillId,history)||{status:'unknown',secure:false,reasons:['Tiada profil kemahiran']};
  const clean=history.filter(x=>x.ok&&!x.hint);
  const formats=new Set(clean.map(x=>x.format).filter(Boolean));
  const transfer=clean.some(x=>x.transfer||/application|reasoning/.test(String(x.format||'')));
  const full=clean.length>=p.evidence.requiredClean&&formats.size>=p.evidence.requiredRepresentations&&transfer;
  const provisional=!transfer&&clean.length>=5&&formats.size>=p.evidence.requiredRepresentations;
  let secure=full||provisional,status=full?'secure':provisional?'provisional':clean.length?'developing':'unproven';
  const reasons=[];
  if(clean.length<p.evidence.requiredClean)reasons.push(`Perlu ${p.evidence.requiredClean-clean.length} lagi jawapan betul tanpa bantuan`);
  if(formats.size<p.evidence.requiredRepresentations)reasons.push('Perlu bukti dalam bentuk soalan berbeza');
  if(!transfer)reasons.push('Perlu satu soalan aplikasi atau penaakulan');
  const bucket=typeof scoreState==='function'?scoreState(skillId)?.competencies:null;
  const reqStatus=window.PAContentIntegrity?.requirementStatus?.(skillId,bucket);
  if(reqStatus&&!reqStatus.ok){
    secure=false;status=clean.length?'developing':'unproven';
    reasons.push(`Belum cukup bukti competency: ${reqStatus.missing.map(g=>g.join(' / ')).join('; ')}`);
  }
  return{status,secure,provisional:secure&&provisional,reasons,clean:clean.length,formats:formats.size,transfer};
}
window.masteryEvidenceDecision=function(skillId,history=[]){
  return managedProfiles[skillId]?managedDecision(skillId,history):(oldMasteryDecision?.(skillId,history)||{status:'unknown',secure:false,reasons:['Tiada profil kemahiran']});
};

// ---------- Mandatory competency contracts ----------
if(window.PAContentIntegrity?.requirements){
  const req=PAContentIntegrity.requirements;
  RETIRED.forEach(id=>delete req[id]);
  Object.assign(req,{
    'D6.ANGLE':[['angle_measure_protractor'],['angle_construct_identify'],['polygon_regular_measure']],
    'D6.CIRCLE':[['circle_parts'],['circle_draw_radius','radius_diameter']],
    'D6.SPACE_PROBLEM':[['space_problem_angle'],['space_problem_circle']],
    'D6.PIE':[['pie_complete_angle'],['pie_complete_quantity'],['pie_interpret']],
    'D6.PROB':[['chance_possible_reason'],['chance_scale_reason']],
    'D6.DATA_PROBLEM':[['data_problem_pie'],['data_problem_chance']],
    'D6.COORD':[['scaled_distance','route'],['direction','missing_point']]
  });
}

// Make contract accounting describe the actual active graph instead of the old 102-id snapshot.
if(window.PAKSSRDepth?.contractStatus&&typeof GRAPH!=='undefined'&&Array.isArray(GRAPH.skills)){
  const status=PAKSSRDepth.contractStatus;
  RETIRED.forEach(id=>delete status[id]);
  for(const s of GRAPH.skills){
    if(MANAGED.includes(s.id))status[s.id]=`year6-gap-v${VERSION}`;
    else if(!status[s.id])status[s.id]='integrity-v3.18.1';
  }
}

// ---------- KSSR-style visual helpers ----------
function diagramWrap(svg,caption=''){
  return `<div class="y6kDiagram">${svg}${caption?`<small>${caption}</small>`:''}</div>`;
}
function protractorSvg(deg){
  const cx=160,cy=158,r=112;
  let ticks='',labels='';
  for(let a=0;a<=180;a+=15){
    const [x1,y1]=polar(cx,cy,r,a),[x2,y2]=polar(cx,cy,a%45===0?r-13:r-8,a);
    ticks+=`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="y6-tick"/>`;
    if(a%45===0){
      const [tx,ty]=polar(cx,cy,r-27,a);
      labels+=`<text x="${tx.toFixed(1)}" y="${(ty+4).toFixed(1)}">${a}°</text>`;
    }
  }
  const [rx,ry]=polar(cx,cy,92,deg);
  const [ax,ay]=polar(cx,cy,34,deg);
  const large=deg>180?1:0;
  return diagramWrap(`<svg viewBox="0 0 320 185" aria-label="rajah protraktor dan sudut">
   <path d="M 48 158 A 112 112 0 0 1 272 158" class="y6-guide"/>
   ${ticks}${labels}
   <line x1="${cx}" y1="${cy}" x2="276" y2="${cy}" class="y6-ray"/>
   <line x1="${cx}" y1="${cy}" x2="${rx.toFixed(1)}" y2="${ry.toFixed(1)}" class="y6-ray y6-accent-stroke"/>
   <path d="M ${cx+34} ${cy} A 34 34 0 ${large} 1 ${ax.toFixed(1)} ${ay.toFixed(1)}" class="y6-angle-arc"/>
   <circle cx="${cx}" cy="${cy}" r="4" class="y6-accent"/>
  </svg>`);
}
function regularPolygonSvg(n){
  const cx=160,cy=110,r=78,pts=[];
  for(let i=0;i<n;i++){
    const a=-90+i*360/n, [x,y]=polar(cx,cy,r,-a); // screen polar with clockwise conversion
    pts.push([x,y]);
  }
  const points=pts.map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' ');
  const top=pts[0];
  return diagramWrap(`<svg viewBox="0 0 320 220" aria-label="poligon sekata ${n} sisi">
   <polygon points="${points}" class="y6-shape"/>
   <circle cx="${top[0].toFixed(1)}" cy="${top[1].toFixed(1)}" r="5" class="y6-accent"/>
   <text x="${top[0].toFixed(1)}" y="${(top[1]+29).toFixed(1)}" class="y6-qmark">?°</text>
   <text x="160" y="207">${n} sisi sama panjang</text>
  </svg>`);
}
function miniAngle(deg,label,x,y){
  const cx=x+42,cy=y+60,len=43,[rx,ry]=polar(cx,cy,len,deg);
  return `<g><rect x="${x}" y="${y}" width="84" height="78" rx="9" class="y6-mini-bg"/>
   <line x1="${cx}" y1="${cy}" x2="${cx+len}" y2="${cy}" class="y6-mini-ray"/>
   <line x1="${cx}" y1="${cy}" x2="${rx.toFixed(1)}" y2="${ry.toFixed(1)}" class="y6-mini-ray y6-accent-stroke"/>
   <text x="${x+12}" y="${y+18}" class="y6-mini-label">${label}</text></g>`;
}
function angleChoicePanel(target){
  const pool=uniquePick([30,45,60,75,90,105,120,135,150,165,180],3,[target]);
  const vals=[target,...pool].sort(()=>Math.random()-.5);
  const letters=['A','B','C','D'];
  const positions=[[18,10],[116,10],[18,102],[116,102]];
  let body='';
  vals.forEach((d,i)=>body+=miniAngle(d,letters[i],positions[i][0],positions[i][1]));
  const answer=letters[vals.indexOf(target)];
  return {html:diagramWrap(`<svg viewBox="0 0 220 194" aria-label="empat rajah sudut">${body}</svg>`),answer,vals};
}
function circleSvg(mode='parts',value=5){
  const cx=160,cy=105,r=72;
  if(mode==='parts'){
    return diagramWrap(`<svg viewBox="0 0 320 210" aria-label="bahagian bulatan">
      <circle cx="${cx}" cy="${cy}" r="${r}" class="y6-circle"/>
      <line x1="${cx-r}" y1="${cy}" x2="${cx+r}" y2="${cy}" class="y6-diameter"/>
      <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy-r}" class="y6-radius"/>
      <circle cx="${cx}" cy="${cy}" r="5" class="y6-accent"/>
      <text x="${cx}" y="${cy+20}">O</text><text x="${cx-r-10}" y="${cy-8}">A</text><text x="${cx+r+10}" y="${cy-8}">B</text><text x="${cx+12}" y="${cy-r-7}">C</text>
    </svg>`);
  }
  return diagramWrap(`<svg viewBox="0 0 320 210" aria-label="bulatan berjari-jari ${value} sentimeter">
    <circle cx="${cx}" cy="${cy}" r="${r}" class="y6-circle"/>
    <line x1="${cx}" y1="${cy}" x2="${cx+r}" y2="${cy}" class="y6-radius y6-accent-stroke"/>
    <circle cx="${cx}" cy="${cy}" r="5" class="y6-accent"/>
    <text x="${cx+36}" y="${cy-9}">${value} cm</text><text x="${cx}" y="${cy+20}">O</text>
  </svg>`);
}
function circleHighlight(part){
  const cx=160,cy=105,r=72;
  const radiusClass=part==='jejari'?'y6-highlight':'y6-muted-line';
  const diamClass=part==='diameter'?'y6-highlight':'y6-muted-line';
  const centerClass=part==='pusat'?'y6-accent':'y6-muted-dot';
  return diagramWrap(`<svg viewBox="0 0 320 210" aria-label="rajah bulatan dengan satu bahagian diserlahkan">
   <circle cx="${cx}" cy="${cy}" r="${r}" class="y6-circle"/>
   <line x1="${cx-r}" y1="${cy}" x2="${cx+r}" y2="${cy}" class="${diamClass}"/>
   <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy-r}" class="${radiusClass}"/>
   <circle cx="${cx}" cy="${cy}" r="6" class="${centerClass}"/>
  </svg>`);
}
function sectorPath(cx,cy,r,start,angle){
  if(angle>=359.999)return `M ${cx-r} ${cy} A ${r} ${r} 0 1 0 ${cx+r} ${cy} A ${r} ${r} 0 1 0 ${cx-r} ${cy} Z`;
  const [x1,y1]=polar(cx,cy,r,start),[x2,y2]=polar(cx,cy,r,start+angle),large=angle>180?1:0;
  return `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 0 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
}
function pieSvg(sectors,{hideAngle=-1,showValues=false}={}){
  const cx=150,cy=112,r=86,classes=['y6-pie-a','y6-pie-b','y6-pie-c','y6-pie-d'];
  let start=0,paths='',texts='';
  sectors.forEach((s,i)=>{
    paths+=`<path d="${sectorPath(cx,cy,r,start,s.angle)}" class="${classes[i%classes.length]}"/>`;
    const mid=start+s.angle/2,[tx,ty]=polar(cx,cy,r*.58,mid);
    const line1=s.label;
    const line2=showValues?String(s.value):(i===hideAngle?'?°':`${s.angle}°`);
    texts+=`<text x="${tx.toFixed(1)}" y="${(ty-3).toFixed(1)}" class="y6-pie-label">${line1}</text><text x="${tx.toFixed(1)}" y="${(ty+13).toFixed(1)}" class="y6-pie-value">${line2}</text>`;
    start+=s.angle;
  });
  return diagramWrap(`<svg viewBox="0 0 300 230" aria-label="carta pai">${paths}<circle cx="${cx}" cy="${cy}" r="3.5" class="y6-accent"/>${texts}</svg>`);
}
function dataTable(headers,rows){
  return `<div class="y6kDiagram"><table class="y6-table"><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function bagVisual(red,blue,green=0){
  let dots='',idx=0;
  const draw=(count,cls,label)=>{
    for(let i=0;i<count;i++){
      const c=idx%5,row=Math.floor(idx/5);idx++;
      dots+=`<circle cx="${72+c*37}" cy="${55+row*36}" r="11" class="${cls}"/>`;
    }
  };
  draw(red,'y6-ball-red','R');draw(blue,'y6-ball-blue','B');draw(green,'y6-ball-green','G');
  return diagramWrap(`<svg viewBox="0 0 330 ${Math.max(120,80+Math.ceil(idx/5)*36)}" aria-label="beg guli">
    <path d="M45 28 Q165 4 285 28 L270 ${65+Math.ceil(idx/5)*36} Q165 ${98+Math.ceil(idx/5)*36} 60 ${65+Math.ceil(idx/5)*36} Z" class="y6-bag"/>
    ${dots}
  </svg>`,`Merah ${red} · Biru ${blue}${green?` · Hijau ${green}`:''}`);
}

// ---------- Question generators ----------
function angleQuestion(id,s,shift){
  const mode=rotate(id,['polygon_regular_measure','angle_construct_identify','angle_measure_protractor']);
  if(mode==='polygon_regular_measure'){
    const pair=pick([[3,60],[4,90],[6,120],[8,135]]),n=pair[0],deg=pair[1];
    return mark(Q(`${regularPolygonSvg(n)}${protractorSvg(deg)}Sudut pedalaman yang ditanda pada poligon sekata ${n} sisi diukur menggunakan protraktor seperti rajah. Berapakah ukurannya?`,`${deg}°`,
      uniquePick([45,60,75,90,105,120,135,150,165,180],3,[deg]).map(v=>nchoice(`${v}°`,'polygon_angle')),
      'Baca protraktor dari 0° pada garis dasar hingga sinar kedua. Semua sudut pedalaman poligon sekata yang sama jenis adalah sama besar.','Tahun 6 · Poligon Sekata dan Sudut',true,true),
      id,mode,'visual','procedure',['angle_measure','polygon_angle']);
  }
  if(mode==='angle_construct_identify'){
    const target=pick([45,60,75,90,105,120,135,150,180]),panel=angleChoicePanel(target);
    return mark(Q(`${panel.html}Rajah manakah menunjukkan sudut yang paling hampir dengan <b>${target}°</b>?`,panel.answer,
      ['A','B','C','D'].filter(x=>x!==panel.answer).map(x=>nchoice(x,'angle_construct')),
      'Banding bukaan sudut dengan 90° dan 180° sebagai rujukan.','Tahun 6 · Membentuk Sudut',true,true),
      id,mode,'visual','concept',['angle_construct']);
  }
  const deg=pick([45,60,75,90,105,120,135,150,165,180]);
  return mark(Q(`${protractorSvg(deg)}Berapakah ukuran sudut yang ditunjukkan?`,`${deg}°`,
    uniquePick([30,45,60,75,90,105,120,135,150,165,180],3,[deg]).map(v=>nchoice(`${v}°`,'angle_measure')),
    'Mula pada 0° di garis dasar dan baca skala pada sinar kedua.','Tahun 6 · Ukur Sudut',true,true),
    id,mode,'visual','procedure',['angle_measure']);
}
function circleQuestion(id,s,shift){
  const mode=rotate(id,['circle_parts','circle_draw_radius','radius_diameter']);
  if(mode==='circle_parts'){
    const part=pick(['pusat','jejari','diameter']);
    return mark(Q(`${circleHighlight(part)}Bahagian yang diserlahkan ialah?`,part,
      ['pusat','jejari','diameter','lengkok'].filter(x=>x!==part).slice(0,3).map(x=>nchoice(x,'circle_part')),
      'Jejari dari pusat ke lilitan; diameter merentasi pusat dari satu sisi ke sisi yang lain.','Tahun 6 · Bahagian Bulatan',true,true),
      id,mode,'visual','concept',['circle_part']);
  }
  if(mode==='circle_draw_radius'){
    const r=pick([2,3,4,5,6,7]);
    return mark(Q(`${circleSvg('radius',r)}Untuk melukis bulatan berjari-jari <b>${r} cm</b> menggunakan jangka lukis, bukaan jangka perlu?`,`${r} cm`,
      [r*2,Math.max(1,r-1),r+1].map(v=>nchoice(`${v} cm`,'circle_draw')),
      'Bukaan jangka dari mata pusat ke pensel sama dengan jejari.','Tahun 6 · Melukis Bulatan',true,true),
      id,mode,'visual','procedure',['circle_draw']);
  }
  const r=pick([2,3,4,5,6,7,8,9]),ans=r*2;
  return mark(Q(`${circleSvg('radius',r)}Jejari bulatan ialah ${r} cm. Berapakah diameternya?`,`${ans} cm`,
    [r,ans+r,Math.max(1,ans-2)].map(v=>nchoice(`${v} cm`,'radius_diameter')),
    'Diameter melalui pusat dan panjangnya dua kali jejari.','Tahun 6 · Jejari dan Diameter',true,true),
    id,mode,'visual','application',['radius_diameter']);
}
function spaceProblemQuestion(id,s,shift){
  const mode=rotate(id,['space_problem_angle','space_problem_circle']);
  if(mode==='space_problem_angle'){
    const startAngle=pick([45,60,75,90,105,120,135]),increase=pick([15,20,30]);
    const ans=startAngle+increase;
    if(ans>180)return spaceProblemQuestion(id,s,shift);
    return mark(Q(`${protractorSvg(startAngle)}Sebuah papan tanda dibuka pada sudut <b>${startAngle}°</b>. Sudut itu dibesarkan lagi <b>${increase}°</b>. Berapakah sudut baharu?`,`${ans}°`,
      uniquePick([startAngle,Math.max(0,startAngle-increase),Math.min(180,ans+increase),180],3,[ans]).map(v=>nchoice(`${v}°`,'angle_measure')),
      'Tambah perubahan sudut kepada ukuran asal dan pastikan jawapan tidak melebihi 180°.','Tahun 6 · Masalah Sudut Harian',true,true),
      id,mode,'visual','reasoning',['space_reason','angle_measure']);
  }
  const diameter=pick([8,10,12,14,16,18,20]),radius=diameter/2;
  return mark(Q(`${circleSvg('parts')}Sebuah taman berbentuk bulatan mempunyai diameter <b>${diameter} m</b>. Jarak lurus dari pusat taman ke tepinya ialah?`,`${radius} m`,
    [diameter,diameter*2,Math.max(1,radius-1)].map(v=>nchoice(`${v} m`,'radius_diameter')),
    'Jarak dari pusat ke tepi bulatan ialah jejari, iaitu separuh diameter.','Tahun 6 · Masalah Bulatan',true,true),
    id,mode,'visual','application',['space_reason','radius_diameter']);
}
function makePie(){
  const labels=['Bas','Kereta','Berjalan','Basikal'].sort(()=>Math.random()-.5);
  const angles=[180,90,45,45].sort(()=>Math.random()-.5);
  const total=pick([40,80,120,160,200]);
  return labels.map((label,i)=>({label,angle:angles[i],value:total*angles[i]/360,total}));
}
function pieQuestion(id,s,shift){
  const mode=rotate(id,['pie_complete_angle','pie_complete_quantity','pie_interpret']);
  const sectors=makePie(),target=R(0,sectors.length-1),t=sectors[target],total=t.total;
  if(mode==='pie_complete_angle'){
    return mark(Q(`${pieSvg(sectors,{hideAngle:target})}${dataTable(['Kategori','Kuantiti'],sectors.map(x=>[x.label,x.value]))}Sudut sektor <b>${t.label}</b> yang hilang ialah?`,`${t.angle}°`,
      [45,90,180].filter(x=>x!==t.angle).map(v=>nchoice(`${v}°`,'pie_angle')).concat([nchoice('360°','pie_angle')]).slice(0,3),
      'Banding kuantiti kategori dengan jumlah. 45° = 1/8 bulatan, 90° = 1/4, 180° = 1/2.','Tahun 6 · Lengkapkan Carta Pai',true,true),
      id,mode,'visual','procedure',['pie_angle','pie_quantity']);
  }
  if(mode==='pie_complete_quantity'){
    return mark(Q(`${pieSvg(sectors)}Jumlah data ialah <b>${total}</b>. Berapakah kuantiti bagi sektor <b>${t.label}</b> (${t.angle}°)?`,t.value,
      [total-t.value,Math.max(1,t.value+total/8),Math.max(1,t.value-total/8)].map(v=>nchoice(v,'pie_quantity')),
      'Kuantiti sektor = sudut sektor ÷ 360° × jumlah.','Tahun 6 · Kuantiti Carta Pai',true,true),
      id,mode,'visual','application',['pie_quantity']);
  }
  const largest=sectors.find(x=>x.angle===180);
  return mark(Q(`${pieSvg(sectors,{showValues:true})}Kategori manakah mempunyai kuantiti paling besar?`,largest.label,
    sectors.filter(x=>x.label!==largest.label).slice(0,3).map(x=>nchoice(x.label,'data')),
    'Sektor yang paling besar mewakili kuantiti paling besar.','Tahun 6 · Tafsir Carta Pai',true,true),
    id,mode,'visual','concept',['data','pie_angle']);
}
function chanceScale(red,blue){
  if(red===0)return'mustahil';
  if(blue===0)return'pasti';
  if(red===blue)return'sama kemungkinan';
  return red<blue?'kecil kemungkinan':'besar kemungkinan';
}
function chanceReasonText(cat,red,blue){
  if(cat==='mustahil')return'mustahil kerana tiada guli merah';
  if(cat==='pasti')return'pasti kerana semua guli ialah merah';
  if(cat==='sama kemungkinan')return'sama kemungkinan kerana bilangan merah sama dengan bukan merah';
  if(cat==='kecil kemungkinan')return'kecil kemungkinan kerana guli merah lebih sedikit daripada bukan merah';
  return'besar kemungkinan kerana guli merah lebih banyak daripada bukan merah';
}
function probabilityQuestion(id,s,shift){
  const mode=rotate(id,['chance_possible_reason','chance_scale_reason','chance_everyday_reason']);
  if(mode==='chance_possible_reason'){
    const hasGreen=Math.random()<.5,red=pick([3,4,5]),blue=pick([3,4,5]),green=hasGreen?pick([1,2,3]):0;
    const ans=hasGreen?'mungkin berlaku kerana terdapat guli hijau':'tidak mungkin berlaku kerana tiada guli hijau';
    return mark(Q(`${bagVisual(red,blue,green)}Satu guli dipilih tanpa melihat. Adakah memilih <b>guli hijau</b> mungkin berlaku? Pilih jawapan dengan sebab yang munasabah.`,ans,
      [
       nchoice(hasGreen?'tidak mungkin berlaku kerana guli hijau sedikit':'mungkin berlaku walaupun tiada guli hijau','chance_reason'),
       nchoice('pasti berlaku kerana semua warna mempunyai peluang yang sama','chance_reason'),
       nchoice('tidak boleh ditentukan walaupun kandungan beg diketahui','chance_reason')
      ],
      'Periksa dahulu sama ada hasil yang ditanya wujud dalam beg.','Tahun 6 · Mungkin atau Tidak Mungkin',true,true),
      id,mode,'visual','reasoning',['chance_reason','chance_category']);
  }
  if(mode==='chance_everyday_reason'){
    const event=pick([
      ['mendapat nombor 7 apabila membaling satu dadu biasa','mustahil kerana dadu biasa hanya mempunyai nombor 1 hingga 6'],
      ['mendapat kepala apabila melambung syiling adil','sama kemungkinan kerana hanya ada dua hasil yang seimbang'],
      ['matahari terbit pada waktu pagi esok','pasti berdasarkan kejadian harian biasa']
    ]);
    return mark(Q(`Nilai peristiwa berikut:<br><b>${event[0]}</b><br>Apakah kebolehjadian dan sebab yang paling munasabah?`,event[1],
      [
       nchoice('kecil kemungkinan kerana hasil itu jarang','chance_reason'),
       nchoice('besar kemungkinan kerana hasil itu kerap','chance_reason'),
       nchoice('tidak boleh dinilai tanpa membuat 100 percubaan','chance_reason')
      ].filter(x=>x.v!==event[1]),
      'Gunakan maklumat tentang hasil yang mungkin dan situasi harian.','Tahun 6 · Penaakulan Kebolehjadian',true,true),
      id,'chance_scale_reason','story','reasoning',['chance_reason','chance_category']);
  }
  const cfg=pick([[0,10],[2,8],[5,5],[8,2],[10,0]]),red=cfg[0],blue=cfg[1],cat=chanceScale(red,blue),ans=chanceReasonText(cat,red,blue);
  const wrongCats=['mustahil','kecil kemungkinan','sama kemungkinan','besar kemungkinan','pasti'].filter(x=>x!==cat);
  return mark(Q(`${bagVisual(red,blue)}Apakah kebolehjadian memilih <b>guli merah</b>? Pilih kategori bersama sebab yang munasabah.`,ans,
    uniquePick(wrongCats,3).map(c=>nchoice(
      c==='mustahil'?'mustahil kerana hasil merah tidak boleh berlaku':
      c==='pasti'?'pasti kerana hasil merah mesti berlaku':
      c==='sama kemungkinan'?'sama kemungkinan kerana kedua-dua hasil dianggap sama':
      c==='kecil kemungkinan'?'kecil kemungkinan kerana merah dianggap lebih sedikit':
      'besar kemungkinan kerana merah dianggap lebih banyak','chance_reason')),
    'Banding bilangan hasil merah dengan semua hasil bukan merah, kemudian pilih istilah kebolehjadian yang sesuai.','Tahun 6 · Skala Kebolehjadian',true,true),
    id,mode,'visual','application',['chance_category','chance_reason']);
}
function dataProblemQuestion(id,s,shift){
  const mode=rotate(id,['data_problem_pie','data_problem_chance']);
  const sectors=makePie(),total=sectors[0].total;
  if(mode==='data_problem_pie'){
    const hi=sectors.find(x=>x.angle===180),lo=sectors.find(x=>x.angle===45),ans=hi.value-lo.value;
    return mark(Q(`${pieSvg(sectors)}Carta pai menunjukkan pilihan <b>${total}</b> murid. Berapa lebih murid memilih <b>${hi.label}</b> berbanding <b>${lo.label}</b>?`,ans,
      [hi.value,lo.value,ans+total/8].map(v=>nchoice(v,'pie_quantity')),
      'Tukar kedua-dua sudut sektor kepada kuantiti, kemudian cari beza.','Tahun 6 · Masalah Carta Pai',true,true),
      id,mode,'visual','reasoning',['data_reason','pie_quantity']);
  }
  const target=sectors.find(x=>x.angle===45),notValue=total-target.value;
  const ans=`besar kemungkinan kerana ${notValue} daripada ${total} rekod bukan ${target.label}`;
  return mark(Q(`${pieSvg(sectors,{showValues:true})}Satu rekod dipilih secara rawak. Bagaimanakah kebolehjadian memilih rekod yang <b>bukan ${target.label}</b>?`,ans,
    [
      nchoice(`kecil kemungkinan kerana hanya ${target.value} rekod ialah ${target.label}`,'chance_reason'),
      nchoice(`sama kemungkinan kerana carta pai mempunyai beberapa sektor`,'chance_reason'),
      nchoice(`mustahil kerana ${target.label} masih wujud dalam data`,'chance_reason')
    ],
    'Sektor 45° mewakili bahagian kecil carta. Semua sektor lain bersama-sama mewakili kebanyakan data, jadi nilai kebolehjadian secara kualitatif.','Tahun 6 · Data dan Kebolehjadian',true,true),
    id,mode,'visual','reasoning',['data_reason','chance_reason']);
}

function y6GapQuestion(id,s,shift){
  if(id==='D6.ANGLE')return angleQuestion(id,s,shift);
  if(id==='D6.CIRCLE')return circleQuestion(id,s,shift);
  if(id==='D6.SPACE_PROBLEM')return spaceProblemQuestion(id,s,shift);
  if(id==='D6.PIE')return pieQuestion(id,s,shift);
  if(id==='D6.PROB')return probabilityQuestion(id,s,shift);
  if(id==='D6.DATA_PROBLEM')return dataProblemQuestion(id,s,shift);
  return null;
}
banks.d6=function(id,s,shift){
  const q=y6GapQuestion(id,s,shift);
  return q||previousD6?.(id,s,shift)||null;
};

window.PAY6KSSRRepair={
  version:VERSION,
  retired:[...RETIRED],
  active:[...ACTIVE_NEW,'D6.PROB'],
  corrected:['D6.COORD'],
  standards:{
    'D6.ANGLE':['6.1.1','6.1.2'],
    'D6.CIRCLE':['6.2.1','6.2.2'],
    'D6.SPACE_PROBLEM':['6.3.1'],
    'D6.PIE':['8.1.1'],
    'D6.PROB':['8.2.1','8.2.2'],
    'D6.DATA_PROBLEM':['8.3.1'],
    'D6.COORD':['7.1.1']
  },
  helpers:{protractorSvg,regularPolygonSvg,circleSvg,pieSvg,bagVisual},
  question:y6GapQuestion,
  legacyMeta:oldMeta
};
document.documentElement?.setAttribute('data-y6-kssr-repair',VERSION);
const v=document.querySelector?.('.loginVersion');
if(v)v.textContent=`Pahlawan Angka · v${VERSION}`;
})();