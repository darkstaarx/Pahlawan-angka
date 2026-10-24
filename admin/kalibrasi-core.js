/* Kalibrasi otak diagnostik (phase 5, docs/PA-DIAGNOSTIC-BRAIN.md §8a).
   Pure: cloud rows from admin_calibration_rows() → one rebuilt diagLog per child
   (PADiagnostic.fromCloudRows) → the same PADiagnostic.analyze() the app runs →
   counts per finding, so thresholds are tuned on what the brain really sees. */
(function(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.PACalibrationCore=api;
})(typeof window!=='undefined'?window:undefined,function(root){
  'use strict';
  const B=()=>root?.PADiagnostic||(typeof require==='function'?require('../js/engine/diagnostic-brain-v1.js'):null);
  const DAY=864e5,WINDOW=30;
  const median=xs=>{if(!xs.length)return null;const s=[...xs].sort((a,b)=>a-b),m=s.length>>1;return s.length%2?s[m]:(s[m-1]+s[m])/2};

  /* rows: [{c,mine,g,s,q,k,h,ms,b,m,t,f}] (admin_calibration_rows). */
  function summarize(rows,opts={}){
    const brain=B(),now=opts.now||Date.now(),withMine=!!opts.includeMine;
    const list=(Array.isArray(rows)?rows:[]).filter(r=>r&&r.c&&(withMine||!r.mine));
    const kids=new Map();
    for(const r of list){if(!kids.has(r.c))kids.set(r.c,{code:r.c,grade:r.g,rows:[]});const k=kids.get(r.c);k.grade=r.g;k.rows.push(r)}
    const children=[],byFinding=new Map();
    let withFacets=0,recent=0;
    for(const kid of kids.values()){
      const cloud=kid.rows.map(r=>({t:Number(r.t),question_id:r.q,skill_id:r.s,is_correct:!!r.k,used_hint:!!r.h,response_ms:r.ms,facets:r.f}));
      const log=brain.fromCloudRows(cloud);
      const last30=log.filter(e=>now-e.t<=WINDOW*DAY);
      const rich=last30.filter(e=>e.o||e.f||e.c);
      withFacets+=kid.rows.filter(r=>r.f).length;recent+=last30.length;
      const a=brain.analyze(log,{now,name:'Anak'});
      const ids=a.findings.map(f=>f.id);
      children.push({code:kid.code,grade:kid.grade,answers:kid.rows.length,recent:last30.length,richPct:last30.length?Math.round(rich.length/last30.length*100):0,enough:!!a.enough,findings:ids});
      if(!a.enough)continue;
      for(const f of a.findings){
        if(!byFinding.has(f.id))byFinding.set(f.id,{id:f.id,lens:f.lens||'',kids:0,high:0,example:f.text||'',evidence:{}});
        const g=byFinding.get(f.id);g.kids++;if(f.confidence==='tinggi')g.high++;
        for(const [k,v] of Object.entries(f.evidence||{}))if(typeof v==='number'&&Number.isFinite(v))(g.evidence[k]=g.evidence[k]||[]).push(v);
      }
    }
    const eligible=children.filter(c=>c.enough).length;
    const findings=[...byFinding.values()].map(g=>({...g,pct:eligible?Math.round(g.kids/eligible*100):0,
      evidence:Object.fromEntries(Object.entries(g.evidence).map(([k,v])=>[k,median(v)]))})).sort((a,b)=>b.kids-a.kids||a.id.localeCompare(b.id));
    children.sort((a,b)=>b.findings.length-a.findings.length||b.recent-a.recent);
    return{answers:list.length,withFacets,facetsPct:list.length?Math.round(withFacets/list.length*100):0,children:children.length,eligible,recent,findings,list:children};
  }
  function csv(rows,opts={}){
    const list=(Array.isArray(rows)?rows:[]).filter(r=>opts.includeMine||!r.mine);
    const esc=v=>{const s=v==null?'':typeof v==='object'?JSON.stringify(v):String(v);return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s};
    const head=['murid','darjah','skill','betul','petunjuk','ms','jenis','tag','masa','facets'];
    return [head.join(','),...list.map(r=>[r.c,r.g,r.s,r.k?1:0,r.h?1:0,r.ms,r.b,r.m,new Date(Number(r.t)).toISOString(),r.f].map(esc).join(','))].join('\n');
  }
  return{summarize,csv};
});
