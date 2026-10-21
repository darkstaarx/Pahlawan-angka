/* Pahlawan Angka — parent Ringkasan at a glance (docs/PA-DIAGNOSTIC-BRAIN.md §6).
   Two short cards on top of the parent tab:
   1) Aktiviti 7 hari: questions this week / today, active days, then praise
      first (effort, then what the child is good at).
   2) Perlu dikuatkan: up to 3 short labels from the Diagnostic Brain plan;
      the full findings stay in the Kemahiran tab (Ringkasan Cikgu Dimensi).
   Pure module; Node-testable. */
(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.PAParentGlance=api;
})(typeof window!=='undefined'?window:undefined,function(){
  'use strict';
  const DAY=864e5;
  const joinBM=xs=>xs.length<=1?String(xs[0]??''):xs.slice(0,-1).join(', ')+' dan '+xs[xs.length-1];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  // Short phrases for "semakin baik dalam ..." when a brain bug has cleared.
  const IMPROVED={smaller_from_larger:'tolak yang perlu meminjam',borrow_no_decrement:'tolak yang perlu meminjam',borrow_from_zero:'tolak melalui sifar',
    add_no_carry:'tambah yang perlu mengumpul semula',times_neighbour:'sifir',mul_no_placeholder:'darab bentuk lazim',
    wrong_operation:'memilih operasi',money_unit:'sen dan ringgit',place_value_shift:'nilai tempat'};

  /* Questions answered: brain log first (every mode), journey encounters as fallback. */
  function activity(times,now=Date.now()){
    const start=new Date(now);start.setHours(0,0,0,0);
    const today=start.getTime(),weekStart=today-6*DAY;
    const week=(times||[]).map(Number).filter(t=>t>=weekStart&&t<=now+6e4);
    const days=new Set(week.map(t=>new Date(t).toDateString())).size;
    return{week:week.length,today:week.filter(t=>t>=today).length,days};
  }

  /* Strong skills from the brain log: enough recent answers, nearly all right first time. */
  function strongSkills(log,skillTitle,now){
    const by=new Map();
    for(const r of log||[]){if(!r?.s||now-r.t>30*DAY)continue;const x=by.get(r.s)||{n:0,ok:0};x.n++;if(r.k===1&&!r.h)x.ok++;by.set(r.s,x)}
    return[...by].filter(([id,x])=>x.n>=8&&x.ok/x.n>=.9&&skillTitle(id)).sort((a,b)=>b[1].n-a[1].n).map(([id])=>id);
  }

  function compose({name,log,encounters,result,plan,strongIds=[],priorityTitles=[],skillTitle=()=>null,now=Date.now()}={}){
    const who=String(name||'').trim()||'Anak';
    const times=(log||[]).length?log.map(r=>r.t):(encounters||[]).map(e=>e.resolvedAt);
    const act=activity(times,now);
    const steps=plan?.steps||[],findings=result?.findings||[],strengths=result?.strengths||[];
    const rapid=findings.some(f=>f.id==='rapid_guess');

    // 2) Perlu dikuatkan
    let improve;
    if(steps.length||rapid){
      const items=[...(rapid?['Menjawab terlalu cepat']:[]),...steps.map(s=>s.card)].slice(0,3);
      improve={title:`${items.length} perkara untuk dilatih`,items,
        note:rapid?'Latihan khas sudah disediakan. Ajak anak baca soalan dahulu sebelum menekan jawapan.':'Latihan khas sudah disediakan dalam Kemahiran Fokus.',detail:true};
    }else if(priorityTitles.length){
      improve={title:`${Math.min(priorityTitles.length,3)} perkara untuk dilatih`,items:priorityTitles.slice(0,3),note:'Cikgu Dimensi akan beri latihan pendek untuk ini.',detail:true};
    }else if(result?.enough){
      improve={title:'Tiada yang membimbangkan',items:[],note:'Teruskan misi biasa. Cikgu Dimensi akan beritahu jika ada corak baharu.',detail:true};
    }else{
      improve={title:'Belum cukup bukti',items:[],note:`Cikgu Dimensi perlukan lebih banyak jawapan sebelum membuat rumusan (${result?.total||0}/20).`,detail:false};
    }

    // 1) Aktiviti + pujian
    const fluent=[...new Set([...strengths,...findings].flatMap(f=>f.id==='fact_fluency'||f.id==='fact_strength'?f.evidence?.fluent||[]:[]))].sort((a,b)=>a-b);
    const facts=strengths.flatMap(f=>f.id==='basic_strength'?f.evidence?.facts||[]:[]);
    const improved=[...new Set(strengths.filter(f=>/^improved_/.test(f.id)).map(f=>IMPROVED[f.id.slice(9)]).filter(Boolean))];
    const focusIds=new Set(steps.flatMap(s=>s.skills||[]));
    const comfy=[...new Set([...strongIds,...strongSkills(log,skillTitle,now)])].filter(id=>!focusIds.has(id)).map(skillTitle).filter(Boolean).slice(0,2).map(t=>t.charAt(0).toLowerCase()+t.slice(1));
    const good=[...(fluent.length?[`sifir ${joinBM(fluent.slice(0,4))}`]:[]),...facts];
    const parts=[];
    if(!act.week)parts.push('Belum ada latihan dalam 7 hari lepas. Satu misi pendek hari ini sudah cukup untuk mula.');
    else if(act.days>=5)parts.push(`${who} rajin berlatih: ${act.days} daripada 7 hari.`);
    else if(act.today)parts.push(`${who} sudah berlatih hari ini.`);
    else parts.push(`${who} berlatih ${act.days} hari minggu ini.`);
    if(act.week&&(good.length||comfy.length)){
      const lead=good.length?`Hebat dalam ${joinBM(good)}`:`Selesa dengan ${joinBM(comfy)}`;
      parts.push(`${lead}${good.length&&comfy.length?`, dan selesa dengan ${joinBM(comfy)}`:''}.`);
    }
    if(act.week&&improved.length)parts.push(`Semakin baik dalam ${joinBM(improved)}.`);
    return{name:who,title:act.week?`Syabas, ${who}!`:'Jom mula minggu ini',activity:act,praise:parts.join(' '),improve};
  }

  function markup(v,{grade,detailAction="tab('core')"}={}){
    const a=v.activity,i=v.improve;
    const stat=(b,s)=>`<div><b>${esc(b)}</b><small>${esc(s)}</small></div>`;
    return `<section class="card paGlance"><div class="paGlanceHead"><div><div class="eyebrow">AKTIVITI 7 HARI${grade?` · DARJAH ${esc(grade)}`:''}</div><h2>${esc(v.title)}</h2></div><img class="paGlanceCoach" src="assets/coach/cikgu-dimensi/parent-adviser-v2.webp" alt=""></div>
      <div class="paGlanceStats">${stat(a.week,'soalan, 7 hari')}${stat(a.today,'soalan hari ini')}${stat(`${a.days}/7`,'hari aktif')}</div>
      <p class="paGlanceNote">${esc(v.praise)}</p></section>
    <section class="card paImprove"><div class="eyebrow">PERLU DIKUATKAN</div><h3>${esc(i.title)}</h3>
      ${i.items.length?`<ul class="paImproveList">${i.items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}
      <p class="paGlanceNote">${esc(i.note)}</p>
      ${i.detail?`<button class="btn ghost small paImproveMore" type="button" onclick="${detailAction}">Lihat butiran →</button>`:''}</section>`;
  }

  return{activity,compose,markup,strongSkills};
});
