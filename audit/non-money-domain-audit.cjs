#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {runtime}=require('./grade-depth-runtime.cjs');
const {ctx}=runtime();

const domains=new Set(['Masa','Ukuran','Ruang','Data','Kedudukan','Koordinat']);
const skills=ctx.auditSkills.filter(x=>domains.has(x.domain));
const states=[
  {name:'beginner',mastery:20,evidence:1,confidence:25,correct:1,wrong:0},
  {name:'core',mastery:55,evidence:4,confidence:55,correct:3,wrong:1},
  {name:'secure',mastery:85,evidence:20,confidence:80,correct:18,wrong:2}
];
const plain=s=>String(s??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const finiteAnswer=v=>{
  const s=plain(v).replace(/,/g,'');
  if(/^(?:NaN|[-+]?Infinity|undefined|null)$/i.test(s))return false;
  return true;
};
const numericTokens=s=>[...plain(s).matchAll(/(?<![A-Za-z])\d+(?:\.\d+)?/g)].map(x=>Number(x[0])).filter(Number.isFinite);
const invalidClock=s=>{
  const bad=[];
  for(const m of plain(s).matchAll(/\b(\d{1,2}):(\d{2})\b/g))if(+m[2]>59||+m[1]>23)bad.push(m[0]);
  return bad;
};
const rows=[];let total=0;
for(const skill of skills){
  const row={id:skill.id,grade:skill.grade,domain:skill.domain,title:skill.title,samples:0,states:{},archetypes:new Set(),representations:new Set(),maxPromptNumber:0,invalidClocks:[],malformed:[],fallbacks:0};
  for(const state of states){
    ctx.sess.questionHistory=[];ctx.sess.questionFingerprints=[];
    const stateModes=new Set();let stateMax=0;
    for(let i=0;i<250;i++){
      const q=ctx.auditGenerate(skill.id,state);total++;row.samples++;
      assert(q&&q.prompt!=null&&q.answer!=null,skill.id+' missing question');
      const mode=q.archetypeId||'legacy';stateModes.add(mode);row.archetypes.add(mode);row.representations.add(q.representation||'unspecified');
      if(q.kind==='Fallback'||plain(q.prompt)==='2 + 2 = ?')row.fallbacks++;
      const choices=[q.answer,...(q.wrong||[]).map(x=>x.v)];
      if(choices.length!==4||new Set(choices.map(x=>ctx.semanticChoiceKey?.(x)||String(x))).size!==4)row.malformed.push({kind:'choices',mode,prompt:plain(q.prompt)});
      if(!choices.every(finiteAnswer))row.malformed.push({kind:'nonfinite',mode,prompt:plain(q.prompt),choices});
      const nums=numericTokens(q.prompt);const mx=nums.length?Math.max(...nums):0;stateMax=Math.max(stateMax,mx);row.maxPromptNumber=Math.max(row.maxPromptNumber,mx);
      const clocks=invalidClock(q.prompt+' '+q.answer+' '+choices.join(' '));if(clocks.length)row.invalidClocks.push({mode,clocks,prompt:plain(q.prompt)});
    }
    row.states[state.name]={archetypes:[...stateModes].sort(),maxPromptNumber:stateMax};
  }
  row.archetypes=[...row.archetypes].sort();row.representations=[...row.representations].sort();rows.push(row);
}
const report={status:rows.every(x=>!x.malformed.length&&!x.invalidClocks.length&&!x.fallbacks)?'pass':'findings',generatedAt:'2026-10-12',samples:total,skills:rows};
fs.writeFileSync('audit/non-money-domain-audit-report.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,samples:total,skills:rows.length,malformed:rows.reduce((n,x)=>n+x.malformed.length,0),invalidClocks:rows.reduce((n,x)=>n+x.invalidClocks.length,0),fallbacks:rows.reduce((n,x)=>n+x.fallbacks,0)},null,2));
