#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const {runtime}=require('./grade-depth-runtime.cjs');
const {ctx}=runtime();
const states={beginner:{mastery:20,evidence:1,confidence:20},core:{mastery:55,evidence:5,confidence:55},secure:{mastery:85,evidence:20,confidence:80}};
const skills=['D4.MEASURE','D4.DATA','D5.TIME','D5.MEASURE','D5.AREA','D5.DATA'];
const seen={};let samples=0;
for(const id of skills){seen[id]={};for(const [name,state] of Object.entries(states)){const modes=new Set();for(let i=0;i<500;i++){const q=ctx.auditGenerate(id,state);samples++;assert(q&&q.prompt&&q.answer!=null,id+' missing question');const choices=[q.answer,...q.wrong.map(x=>x.v)];assert.equal(choices.length,4,id+' four choices');assert.equal(new Set(choices.map(x=>ctx.semanticChoiceKey?.(x)||String(x))).size,4,id+' unique choices');if(id.startsWith('D5.'))assert(['kssr-year5-v3.86.0','d5-completion-v1'].includes(q.source),id+' production wrapper');modes.add(q.archetypeId)}seen[id][name]=[...modes].sort()}}
const has=(id,state,pattern)=>assert(seen[id][state].some(x=>pattern.test(x)),`${id}/${state} missing ${pattern}`);
for(const type of ['panjang','jisim','isi padu cecair']){has('D4.MEASURE','beginner',new RegExp(type+'_convert'));has('D4.MEASURE','core',new RegExp(type+'_multiply'));has('D4.MEASURE','secure',new RegExp(type+'_divide'));has('D5.MEASURE','beginner',new RegExp(type));has('D5.MEASURE','core',new RegExp('multiply_'+type));has('D5.MEASURE','secure',new RegExp('divide_'+type))}
has('D4.DATA','beginner',/pictograph_read/);has('D4.DATA','core',/pictograph_total/);has('D4.DATA','secure',/pictograph_claim/);
for(const p of [/mode/,/median/,/range/,/pie_read/])has('D5.DATA','beginner',p);for(const p of [/mean/,/pie_quantity/])has('D5.DATA','core',p);for(const p of [/missing_mean/,/pie_claim/,/stat_claim/])has('D5.DATA','secure',p);
for(const p of [/polygon_name/,/polygon_angle/,/perimeter/])has('D5.AREA','beginner',p);for(const p of [/triangle_area/,/composite_area/,/composite_volume/])has('D5.AREA','core',p);for(const p of [/missing_angle/,/perimeter_claim/,/volume_claim/])has('D5.AREA','secure',p);
for(const p of [/fraction_day/,/decimal_year/,/decade_year/])has('D5.TIME','beginner',p);for(const p of [/add_hours/,/subtract_days/,/century_year/])has('D5.TIME','core',p);for(const p of [/missing_duration/,/compare_duration/,/time_claim/])has('D5.TIME','secure',p);
console.log(JSON.stringify({status:'pass',samples,skills:skills.length,coverage:seen},null,2));
