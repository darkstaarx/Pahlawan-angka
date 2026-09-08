// Integration audit — D1–D6 game-native KSSR/PBD/UASA response engine.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync('js/game-question-interactions-v3.62.2.js','utf8');
const attrs={};
const ctx={console,Math,document:{documentElement:{setAttribute(k,v){attrs[k]=v}}}};ctx.window=ctx;
vm.createContext(ctx);vm.runInContext(source,ctx,{filename:'game-question-interactions-v3.62.2.js'});
const api=ctx.PAGameQuestionInteractions;
assert.equal(api.version,'3.62.2');assert.equal(attrs['data-game-question-interactions'],'3.62.2');

const cases=[
 ['D1.ADD20',12,'rune_entry'],
 ['D2.4.2','RM12.50','rune_entry'],
 ['D3.FRAC','3/4','fraction_build'],
 ['D4.TIME','14:30','time_dial'],
 ['D5.COORD','(3,4)','coordinate_plot'],
 ['D6.NUMBERS','12, 18, 24','sequence_build'],
 ['D6.ANGLE','120°','angle_build',{competencyId:'6.1.2'}],
  ['D6.CIRCLE','6 cm','circle_build',{competencyId:'6.2.2',misconceptionTargets:['circle_draw']}],
 ['D6.DATA_PROBLEM','pilih A, kerana nilainya dua kali B','claim_reason',{demand:'reasoning',wrong:[{v:'pilih B, kerana nilainya paling kecil',tag:'reason'},{v:'pilih A, kerana nilainya sama dengan B',tag:'reason'},{v:'tidak pilih A, kerana tiada data',tag:'reason'}]}],
  ['D6.PROB','pasti','sigil_select']
];
for(const [id,answer,type,extra={}] of cases){
 const q={answer,wrong:[{v:'x',tag:'test'}],...extra};api.prepare(q,{skillId:id,meta:{grade:Number(id[1])}});
 assert.equal(q.responseType,'interactive',id);assert.equal(q.responseMode,'game',id);assert.equal(q.interaction.type,type,id);
 assert.equal(q.assessmentAlignment.framework,Number(id[1])<=3?'KSSR_PBD':'KSSR_UASA_2025',id);
 assert.equal(q.assessmentAlignment.uasaItemClass,Number(id[1])<=3?null:'SRT_OR_SRTb',id);
}

const angleCases=[
 [{answer:'protraktor',wrong:[{v:'jangka lukis',tag:'tool'},{v:'pembaris sahaja',tag:'tool'},{v:'pemadam',tag:'tool'}],competencyId:'6.1.2',archetypeId:'y6v2_6_1_2_tool'},'tool_select'],
 [{answer:'lukis sinar asas → letak pusat protraktor → tanda 120° → lukis sinar kedua',wrong:[{v:'x',tag:'tool'}],competencyId:'6.1.2',archetypeId:'y6v2_6_1_2_sequence',demand:'reasoning'},'step_sequence'],
 [{prompt:'Murid mahu membentuk 140° tetapi menanda 40° pada skala yang salah. Pembetulan?',answer:'gunakan skala yang bermula pada 0° dan tanda 140°',wrong:[{v:'kekalkan tanda 40°',tag:'angle_construct'}],competencyId:'6.1.2',archetypeId:'y6v2_6_1_2_construct_error',demand:'reasoning'},'angle_build'],
 [{answer:'betul',wrong:[{v:'salah',tag:'angle_construct'}],competencyId:'6.1.2',archetypeId:'y6v2_6_1_2_claim',demand:'reasoning'},'judgement_gate']
];
for(const [q,type] of angleCases){api.prepare(q,{skillId:'D6.ANGLE',meta:{grade:6}});assert.equal(q.interaction.type,type,'D6.ANGLE '+q.archetypeId);}
const angleDiagnostic={answer:'70°',wrong:[{v:'110°',tag:'angle_construct'},{v:'80°',tag:'angle_construct'}],competencyId:'6.1.2',archetypeId:'y6v2_6_1_2_target'};
api.prepare(angleDiagnostic,{skillId:'D6.ANGLE',meta:{grade:6}});
assert.equal(api.diagnoseWrongTag(angleDiagnostic,'75°'),'angle_precision','near angle should record precision evidence');
assert.equal(api.diagnoseWrongTag(angleDiagnostic,'110°'),'angle_construct','exact distractor tag must remain authoritative');

const circleCases=[
 [{answer:'ukur bukaan jangka 5 cm → tetapkan pusat → putar jangka satu pusingan',wrong:[{v:'x',tag:'circle_draw'}],competencyId:'6.2.2',archetypeId:'y6v2_6_2_2_steps',demand:'reasoning'},'step_sequence'],
 [{prompt:'Murid mahu diameter 18 cm tetapi membuka jangka 18 cm. Pembetulan?',answer:'buka jangka 9 cm',wrong:[{v:'kekal 18 cm',tag:'circle_draw'}],competencyId:'6.2.2',archetypeId:'y6v2_6_2_2_construction_error',demand:'reasoning',misconceptionTargets:['circle_draw']},'circle_build'],
 [{prompt:'Reka bentuk A perlukan jejari 4 cm; B perlukan diameter 10 cm. Yang memerlukan bukaan jangka lebih besar?',answer:'B, 5 cm',wrong:[{v:'A, 8 cm',tag:'circle_draw'}],competencyId:'6.2.2',archetypeId:'y6v2_6_2_2_design_compare',demand:'reasoning'},'circle_compare'],
 [{prompt:'Murid berkata bulatan diameter 12 cm boleh dilukis dengan jangka 12 cm jika pusat ditanda betul. Penilaian?',answer:'salah, bukaan jangka mesti 6 cm',wrong:[{v:'betul',tag:'circle_draw'}],competencyId:'6.2.2',archetypeId:'y6v2_6_2_2_claim',demand:'reasoning'},'circle_claim']
];
for(const [q,type] of circleCases){api.prepare(q,{skillId:'D6.CIRCLE',meta:{grade:6}});assert.equal(q.interaction.type,type,'D6.CIRCLE '+q.archetypeId);}
const circleDiagnostic={answer:'6 cm',wrong:[{v:'12 cm',tag:'circle_draw'}],competencyId:'6.2.2',archetypeId:'y6v2_6_2_2_radius_setting',misconceptionTargets:['circle_draw']};
api.prepare(circleDiagnostic,{skillId:'D6.CIRCLE',meta:{grade:6}});
assert.equal(api.diagnoseWrongTag(circleDiagnostic,'6.5 cm'),'circle_precision','near circle opening should record precision evidence');
assert.equal(api.diagnoseWrongTag(circleDiagnostic,'3 cm'),'radius_diameter','half/double opening should record radius-diameter evidence');

const graphCtx={};vm.createContext(graphCtx);vm.runInContext(fs.readFileSync('data/kssr/knowledge-graph.js','utf8'),graphCtx);
const baseSkills=vm.runInContext('GRAPH.skills',graphCtx);
const y6Ctx={document:{documentElement:{setAttribute(){}}}};y6Ctx.window=y6Ctx;vm.createContext(y6Ctx);vm.runInContext(fs.readFileSync('data/kssr/year6-competencies-v2.js','utf8'),y6Ctx);
const skills=baseSkills.filter(x=>x.grade!==6).concat(y6Ctx.PAY6CompetencyV2.activeSkills.map(id=>({id,grade:6}))),gradeCounts={};
for(const meta of skills){
 const q={answer:42,wrong:[{v:41,tag:'near'},{v:43,tag:'near'},{v:44,tag:'near'}]};api.prepare(q,{skillId:meta.id,meta});
 assert.equal(q.responseType,'interactive',meta.id);assert(q.interaction?.type,meta.id+' missing interaction');
 gradeCounts[meta.grade]=(gradeCounts[meta.grade]||0)+1;
}
for(let grade=1;grade<=6;grade++)assert(gradeCounts[grade]>0,'grade '+grade+' absent');

const app=fs.readFileSync('js/app.js','utf8'),dispatcher=fs.readFileSync('questions/index.js','utf8'),battle=fs.readFileSync('js/battle.js','utf8');
const pwa=fs.readFileSync('js/pwa.js','utf8'),sw=fs.readFileSync('sw.js','utf8'),html=fs.readFileSync('index.html','utf8'),version=fs.readFileSync('js/version.js','utf8'),css=fs.readFileSync('css/game-question-interactions-v3.62.2.css','utf8'),typed=fs.readFileSync('js/dev-experiments-v3.21.2.js','utf8');
assert(/PAGameQuestionInteractions\?\.render/.test(app),'nextQ renderer hook missing');
assert(/PAGameQuestionInteractions\?\.prepare/.test(dispatcher),'dispatcher prepare hook missing');
assert(/responseType:q\.responseType/.test(dispatcher)&&/interactionType:q\.interaction/.test(dispatcher),'question history interaction evidence missing');
assert(/PAGameQuestionInteractions\?\.lock/.test(battle)&&/unlockRetry/.test(battle)&&/retryCopy/.test(battle),'battle lifecycle hooks incomplete');
assert(/responseMode==='game'.*PAGameQuestionInteractions/.test(typed),'legacy boss typed renderer can still replace game-native controls');
assert(/GAME_QUESTION_VERSION='3\.62\.2'/.test(pwa),'PWA version missing');
assert(pwa.indexOf('typed-answer-ui-v${TYPED_UI_VERSION}.js')<pwa.indexOf('game-question-interactions-v${GAME_QUESTION_VERSION}.js'),'parser load order wrong');
assert(/loadTyped=.*loadGameQuestions/.test(pwa),'async typed -> game interaction order missing');
assert(/gameQuestions:GAME_QUESTION_VERSION/.test(pwa),'release metadata missing');
assert(sw.includes("'./js/game-question-interactions-v3.62.2.js'")&&sw.includes("'./css/game-question-interactions-v3.62.2.css'"),'offline shell assets missing');
assert(/PA_APP_VERSION='3\.62\.2'/.test(version),'release version stale');
assert(/js\/version\.js\?v=3\.62\.2/.test(html)&&/js\/pwa\.js\?v=3\.62\.2/.test(html),'HTML cache bust stale');
assert(!/upper-alpha|counter\(/i.test(css),'new interaction UI reintroduced A/B/C/D labels');

console.log(JSON.stringify({status:'PASS',version:api.version,skills:skills.length,gradeCounts,interactionFamilies:[...new Set(cases.map(x=>x[2]).concat(angleCases.map(x=>x[1]),circleCases.map(x=>x[1])))],assessment:{D1_D3:'KSSR_PBD',D4_D6:'KSSR_UASA_2025'},battleLifecycle:'PASS',offlineShell:'PASS'},null,2));
