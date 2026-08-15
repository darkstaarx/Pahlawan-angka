const fs=require('fs'),vm=require('vm');
const graphCode=fs.readFileSync('data/kssr/knowledge-graph.js','utf8');
const kbCode=fs.readFileSync('data/kssr/mastery-knowledge-v1.js','utf8');
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(graphCode,ctx);ctx.window.GRAPH=vm.runInContext('GRAPH',ctx);vm.runInContext(kbCode,ctx);
const graph=ctx.window.GRAPH,kb=ctx.window.PAMasteryKB;
const errors=[];
for(const skill of graph.skills){
 const p=kb.profiles[skill.id];if(!p)errors.push(`${skill.id}: missing profile`);
 else{
  if(!p.concepts.length)errors.push(`${skill.id}: no concepts`);
  if(!p.misconceptions.length)errors.push(`${skill.id}: no misconceptions`);
  for(const id of p.prerequisites)if(!graph.skills.some(x=>x.id===id))errors.push(`${skill.id}: unknown prerequisite ${id}`);
 }
}
if(Object.keys(kb.profiles).length!==graph.skills.length)errors.push('profile count mismatch');
const decide=ctx.window.masteryEvidenceDecision;
const hinted=decide('D1.N20',[{ok:true,hint:true,format:'visual|concept'},{ok:true,hint:false,format:'visual|procedure'},{ok:true,hint:false,format:'symbolic|application'}]);
if(hinted.secure)errors.push('hinted evidence incorrectly marked secure');
const repeated=decide('D1.N20',[{ok:true,hint:false,format:'symbolic|procedure'},{ok:true,hint:false,format:'symbolic|procedure'},{ok:true,hint:false,format:'symbolic|procedure'}]);
if(repeated.secure)errors.push('single-format evidence incorrectly marked secure');
const transfer=decide('D1.N20',[{ok:true,hint:false,format:'visual|concept'},{ok:true,hint:false,format:'symbolic|procedure'},{ok:true,hint:false,format:'story|application'}]);
if(!transfer.secure)errors.push('varied unassisted transfer evidence not marked secure');
const provisional=decide('D1.N20',[{ok:true,hint:false,format:'visual|procedure'},{ok:true,hint:false,format:'symbolic|procedure'},{ok:true,hint:false,format:'visual|procedure'},{ok:true,hint:false,format:'symbolic|procedure'},{ok:true,hint:false,format:'visual|procedure'}]);
if(!provisional.secure||provisional.status!=='provisional')errors.push('legacy content fallback not marked provisional');
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`PASS mastery KB ${kb.version}: ${graph.skills.length} profiles + mastery evidence rules valid`);
