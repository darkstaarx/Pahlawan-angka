/* Pahlawan Angka — Adaptive Learner Review v1 (shadow mode).
 *
 * This observer never changes question selection, scoring, rewards, mastery,
 * unlocks or intervention decisions. It turns answer attempts into one logical
 * encounter and exposes conservative, parent-friendly learning summaries.
 */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.PALearnerReview=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const VERSION='1.0.0',SCHEMA=1,MAX_ENCOUNTERS=600;
  const FAST_SECONDS=1.15;
  let active=null;

  const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
  const text=v=>String(v??'').trim();
  const cleanPrompt=v=>text(v).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().slice(0,280);
  function hash(value){let h=2166136261;for(const ch of text(value)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return (h>>>0).toString(36)}
  function storeFor(db){
    if(!db||typeof db!=='object')return null;
    const old=db.learnerReviewV1;
    if(!old||old.schema!==SCHEMA||!Array.isArray(old.encounters))db.learnerReviewV1={schema:SCHEMA,encounters:[],updatedAt:0};
    return db.learnerReviewV1;
  }
  function questionKey(q){
    const prompt=cleanPrompt(q?.prompt);
    return text(q?.itemId||q?.questionId||q?.qsv2AttemptId)||`${text(q?.skill)}:${text(q?.archetypeId||'legacy')}:${hash(prompt)}`;
  }
  function beginQuestion(q,context={}){
    if(!q||context.demoMode||context.devMode){active=null;return null}
    active={
      encounterId:`e-${num(context.now,Date.now()).toString(36)}-${hash(`${q.token||''}:${Math.random()}`)}`,
      questionKey:questionKey(q),token:text(q.token),skillId:text(q.skill),grade:num(context.grade),
      startedAt:num(context.now,Date.now()),mode:text(context.mode||'practice'),selectionReason:text(context.selectionReason),
      archetypeId:text(q.archetypeId||'legacy'),representation:text(q.representation||'symbolic'),
      demand:text(q.demand||'procedure'),difficultyBand:num(q.difficultyBand,2),formatShift:!!q.formatShift,
      firstWrong:null,hintUsed:false,hintLevel:0
    };
    return {...active};
  }
  function firstWrong(q,answer={}){
    if(!active||text(q?.token)!==active.token||active.firstWrong)return false;
    active.firstWrong={tag:text(answer.tag||'generic'),value:text(answer.value),seconds:num(answer.seconds),at:num(answer.now,Date.now())};
    return true;
  }
  function hintUsed(q,level=1){
    if(!active||text(q?.token)!==active.token)return false;
    active.hintUsed=true;active.hintLevel=Math.max(active.hintLevel,num(level,1));return true;
  }
  function resolve(q,result={},db){
    if(!active||text(q?.token)!==active.token)return null;
    const hadWrong=!!active.firstWrong,usedHint=active.hintUsed||!!result.usedHint,correct=!!result.correct;
    const outcome=correct?(usedHint?'assisted':(hadWrong?'corrected':'independent')):'unresolved';
    const encounter={
      schema:SCHEMA,...active,outcome,correct,usedHint,hintLevel:Math.max(active.hintLevel,num(result.hintLevel)),
      firstSeconds:hadWrong?active.firstWrong.seconds:num(result.seconds),totalSeconds:num(result.seconds),
      misconceptionTag:hadWrong?active.firstWrong.tag:(correct?'':text(result.tag||'generic')),
      resolvedAt:num(result.now,Date.now())
    };
    delete encounter.firstWrong;
    const store=storeFor(db);
    if(store){store.encounters.push(encounter);store.encounters=store.encounters.slice(-MAX_ENCOUNTERS);store.updatedAt=encounter.resolvedAt}
    active=null;
    return encounter;
  }
  function abandon(q){if(active&&(!q||text(q.token)===active.token))active=null}
  function encounters(db,opts={}){
    const rows=storeFor(db)?.encounters||[];
    return rows.filter(e=>(!opts.grade||num(e.grade)===num(opts.grade))&&(!opts.skillId||e.skillId===opts.skillId));
  }
  function count(rows,outcome){return rows.filter(e=>e.outcome===outcome).length}
  function groupBy(rows,key){return rows.reduce((out,row)=>{const k=row[key]||'unknown';(out[k]??=[]).push(row);return out},{})}
  function confidence(level,evidence,reason){return {level,evidence,reason}}
  function analyse(rows){
    const total=rows.length,independent=count(rows,'independent'),corrected=count(rows,'corrected'),assisted=count(rows,'assisted'),unresolved=count(rows,'unresolved');
    const wrong=rows.filter(e=>e.outcome!=='independent'),fastWrong=wrong.filter(e=>e.firstSeconds>0&&e.firstSeconds<FAST_SECONDS);
    const patterns=[];
    if(total>=8&&fastWrong.length>=3&&fastWrong.length/Math.max(1,wrong.length)>=.35){
      patterns.push({id:'fast_answering',status:fastWrong.length>=5?'clear':'emerging',...confidence(fastWrong.length>=5?'high':'medium',fastWrong.length,`${fastWrong.length} jawapan sukar dipilih dengan sangat cepat`)});
    }
    const tagGroups=groupBy(rows.filter(e=>e.misconceptionTag&&e.misconceptionTag!=='generic'),'misconceptionTag');
    Object.entries(tagGroups).forEach(([tag,items])=>{
      const keys=new Set(items.map(e=>e.questionKey)),skills=new Set(items.map(e=>e.skillId));
      if(items.length>=3&&keys.size>=2)patterns.push({id:'repeated_misconception',tag,status:items.length>=5&&keys.size>=3?'clear':'emerging',skills:[...skills],...confidence(items.length>=5&&keys.size>=3?'high':'medium',items.length,`${items.length} kesilapan berkaitan muncul dalam ${keys.size} bentuk soalan`)});
    });
    const recent=rows.slice(-8),recentAssisted=count(recent,'assisted'),recentIndependent=count(recent,'independent');
    if(recent.length>=6&&recentAssisted>=3&&recentIndependent/recent.length<.5)patterns.push({id:'help_dependency',status:recentAssisted>=5?'clear':'emerging',...confidence(recentAssisted>=5?'high':'medium',recentAssisted,`${recentAssisted} daripada ${recent.length} soalan terkini memerlukan petunjuk`)});
    return {total,independent,corrected,assisted,unresolved,patterns};
  }
  function skillTitle(id,meta){return text(meta?.[id]?.title||id||'kemahiran ini')}
  function skillReviews(rows,meta={}){
    return Object.entries(groupBy(rows,'skillId')).map(([skillId,items])=>{
      const a=analyse(items),independentRate=a.total?a.independent/a.total:0,successRate=a.total?(a.total-a.unresolved)/a.total:0;
      let state='exploring';
      if(a.total>=5&&independentRate>=.8&&a.assisted===0)state='strong';
      else if(a.total>=4&&a.unresolved>=Math.ceil(a.total*.5))state='foundation';
      else if(a.total>=4&&(a.corrected+a.assisted)>=Math.ceil(a.total*.4))state='developing';
      return {skillId,title:skillTitle(skillId,meta),...a,independentRate,successRate,state};
    }).sort((a,b)=>({foundation:0,developing:1,exploring:2,strong:3}[a.state]-({foundation:0,developing:1,exploring:2,strong:3}[b.state])||b.total-a.total));
  }
  const tagCopy={
    operation:'memilih operasi yang sesuai',unit:'membaca unit dengan teliti',place:'menentukan nilai tempat',digit_value:'membezakan digit dengan nilainya',
    fraction:'memahami bahagian pecahan',decimal:'membaca nilai perpuluhan',time:'menghubungkan waktu dengan tempoh',area:'membezakan panjang, luas dan isi padu',
    coord:'membaca koordinat mengikut urutan',percent:'menghubungkan peratus dengan satu keseluruhan',ratio:'membandingkan kuantiti mengikut urutan'
  };
  function parentSummary(db,meta={},opts={}){
    const name=text(opts.name||db?.name||'Anak anda'),rows=encounters(db,{grade:opts.grade||db?.schoolGrade}),a=analyse(rows),skills=skillReviews(rows,meta);
    if(rows.length<5)return {schema:SCHEMA,ready:false,name,headline:`Cikgu Dimensi sedang mengenali cara ${name} belajar`,intro:'Selesaikan beberapa cabaran lagi supaya ulasan ini berdasarkan corak yang betul, bukan satu atau dua jawapan sahaja.',strengths:[],learning:[],learningStyle:'Belum cukup bukti untuk membuat rumusan.',nextSteps:['Teruskan beberapa misi biasa.'],evidence:{encounters:rows.length}};
    const strong=skills.filter(s=>s.state==='strong').slice(0,3);
    const focus=skills.filter(s=>s.state==='foundation'||s.state==='developing').slice(0,3);
    const fast=a.patterns.find(p=>p.id==='fast_answering');
    const help=a.patterns.find(p=>p.id==='help_dependency');
    const repeated=a.patterns.filter(p=>p.id==='repeated_misconception');
    let learningStyle=`${name} biasanya mengambil masa untuk mencuba soalan dan belum menunjukkan corak meneka yang jelas.`;
    if(fast)learningStyle=`Beberapa jawapan nampak dipilih terlalu cepat. Apabila soalan sukar, ${name} akan dibimbing untuk berhenti, baca semula dan semak jawapan.`;
    else if(help)learningStyle=`${name} boleh maju apabila diberi petunjuk, tetapi masih perlu membina keyakinan untuk menjawab sendiri.`;
    let scoreMeaning='Pencapaian semasa menggabungkan jawapan sendiri, cubaan semula dan bantuan Cikgu Dimensi.';
    if(fast)scoreMeaning='Pencapaian semasa mungkin lebih rendah daripada kefahaman sebenar kerana beberapa jawapan dipilih terlalu cepat.';
    else if(help)scoreMeaning='Banyak jawapan berjaya dengan petunjuk. Kefahaman sedang terbina, tetapi belum semuanya dapat dibuat sendiri.';
    else if(a.independent/a.total>=.8)scoreMeaning='Kebanyakan jawapan dibuat sendiri pada percubaan pertama. Ini petanda kefahaman yang baik dalam sesi semasa.';
    const learning=focus.map(s=>{
      if(s.state==='foundation')return `${s.title} masih mencabar. Latihan akan kembali kepada asas dan menggunakan contoh yang lebih mudah.`;
      if(s.assisted>s.corrected)return `${s.title} semakin difahami apabila diberi petunjuk. Langkah seterusnya ialah mencuba soalan baharu tanpa bantuan.`;
      return `${s.title} sedang berkembang. ${name} kerap berjaya selepas mencuba semula.`;
    });
    repeated.slice(0,1).forEach(p=>{const label=tagCopy[p.tag];if(label)learning.push(`Corak yang sedang diperhatikan: ${label}. Cikgu Dimensi akan semak dengan bentuk soalan berbeza.`)});
    const nextSteps=[];
    if(focus[0])nextSteps.push(`Kukuhkan ${focus[0].title} dengan langkah ringkas dan contoh visual.`);
    if(help)nextSteps.push('Selepas bantuan, beri satu soalan baharu untuk dicuba sendiri.');
    else nextSteps.push('Gunakan bentuk soalan berbeza untuk memastikan kefahaman, bukan hafalan.');
    nextSteps.push('Semak semula pada sesi lain untuk memastikan kefahaman kekal.');
    const promisingStart=!strong.length&&!focus.length&&a.total>=5&&a.independent/a.total>=.8;
    return {
      schema:SCHEMA,ready:true,name,headline:strong.length?`Asas ${name} semakin terbina`:(promisingStart?`Permulaan ${name} sangat baik`:`${name} sedang membina asas Matematik`),
      intro:focus.length?'Beberapa kemahiran sudah kelihatan, dan latihan seterusnya akan memberi perhatian pada bahagian yang paling membantu.':(promisingStart?'Kebanyakan soalan dijawab sendiri. Cikgu Dimensi masih mengumpul bukti untuk memastikan kemahiran mana yang benar-benar kukuh.':'Corak pembelajaran setakat ini kelihatan seimbang. Teruskan latihan supaya kekuatan ini menjadi lebih konsisten.'),
      strengths:strong.map(s=>`${s.title} menunjukkan kefahaman yang baik dalam sesi semasa.`),learning:learning.slice(0,4),learningStyle,scoreMeaning,nextSteps:nextSteps.slice(0,3),
      evidence:{encounters:rows.length,independent:a.independent,corrected:a.corrected,assisted:a.assisted,unresolved:a.unresolved}
    };
  }
  return {VERSION,SCHEMA,beginQuestion,firstWrong,hintUsed,resolve,abandon,encounters,analyse,skillReviews,parentSummary,_test:{questionKey,hash,storeFor}};
});
