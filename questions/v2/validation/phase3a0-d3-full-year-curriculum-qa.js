#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path');
const repo=path.resolve(process.argv[2]||process.cwd());
let passed=0,failed=0;const failures=[];
function ok(v,m,c){if(v){passed++;return true;}failed++;if(failures.length<80)failures.push({message:m,context:c||null});return false}
function eq(a,b,m){return ok(JSON.stringify(a)===JSON.stringify(b),m,{actual:a,expected:b})}
function readJson(rel){return JSON.parse(fs.readFileSync(path.join(repo,rel),'utf8'))}

const doc=readJson('questions/v2/curriculum/kssr-e3-2024/d3.json');
const oracle=readJson('questions/v2/validation/fixtures/d3-full-year-canonical-map-v1.json');
const records=doc.standards||[];
const byStd=new Map(records.map(r=>[r.standardId,r]));

ok(doc.curriculumVersion==='KSSR-E3-2024','curriculum version unchanged');
ok(doc.grade===3,'registry remains Darjah 3');
ok(doc.importedSpCount===50&&doc.declaredSpCount===50,'declared/imported SP count remains 50');
ok(doc.competencyReviewVersion==='D3-FULL-YEAR-CANONICAL-v1','full-year review version recorded');
ok(records.length===50,'exactly 50 D3 standards');
ok(new Set(records.map(r=>r.standardId)).size===50,'all standard IDs unique');
ok(new Set(records.map(r=>r.competencyId)).size===50,'all canonical competency IDs unique');
ok(records.every(r=>r.competencyIdStatus==='canonical'),'all 50 D3 records canonical');
ok(records.every(r=>/^[a-z0-9_-]+$/.test(r.competencyId)),'all canonical IDs satisfy schema token contract');
ok(records.filter(r=>r.status==='mapped').length===44,'44 records remain mapped');
ok(records.filter(r=>r.status==='enabled').length===6,'6 records remain enabled');
ok(records.filter(r=>r.status==='enabled').every(r=>r.topicId==='D3.T7'),'only Topic 7 remains enabled');

const expectedTopicCounts={'D3.T1':6,'D3.T2':3,'D3.T3':10,'D3.T4':5,'D3.T5':5,'D3.T6':9,'D3.T7':6,'D3.T8':3,'D3.T9':3};
for(const [topic,n] of Object.entries(expectedTopicCounts))ok(records.filter(r=>r.topicId===topic).length===n,`${topic} SP count remains ${n}`);

const t7={
 '7.1.1':'identify_prism',
 '7.1.2':'describe_prism_features',
 '7.1.3':'classify_prism_vs_non_prism',
 '7.2.1':'identify_regular_polygon',
 '7.2.2':'create_regular_polygon_pattern',
 '7.3.1':'identify_and_draw_symmetry_axis'
};
for(const [std,id] of Object.entries(t7)){
 const r=byStd.get(std);ok(!!r,`Topic 7 ${std} exists`);if(r){ok(r.topicId==='D3.T7',`${std} remains Topic 7`);ok(r.status==='enabled',`${std} remains enabled`);ok(r.competencyId===id,`${std} canonical competency unchanged`);}
}

ok(oracle.schema==='pa.qsv2.d3-canonical-map.v1','independent canonical oracle schema');
ok(oracle.reviewVersion==='D3-FULL-YEAR-CANONICAL-v1','oracle review version');
ok(Array.isArray(oracle.records)&&oracle.records.length===44,'oracle covers exactly 44 non-Topic-7 SPs');
ok(new Set(oracle.records.map(x=>x.standardId)).size===44,'oracle standard IDs unique');
ok(oracle.records.filter(x=>x.legacyCoverage==='partial').length===9,'legacy audit identifies 9 partial standards');
ok(oracle.records.filter(x=>x.legacyCoverage==='missing').length===35,'legacy audit identifies 35 missing standards');
ok(oracle.records.every(x=>['REWRITE','EXPAND'].includes(x.action)),'all remaining standards require rewrite/expand before enablement');

for(const x of oracle.records){
 const r=byStd.get(x.standardId);
 ok(!!r,`reviewed SP ${x.standardId} exists`);if(!r)continue;
 ok(r.topicId===x.topicId,`${x.standardId} topic matches reviewed oracle`,{got:r.topicId,expected:x.topicId});
 ok(r.competencyId===x.canonicalCompetencyId,`${x.standardId} canonical competency locked`,{got:r.competencyId,expected:x.canonicalCompetencyId});
 ok(r.competencyIdStatus==='canonical',`${x.standardId} marked canonical`);
 ok(r.status==='mapped',`${x.standardId} remains mapped / not silently enabled`);
 ok(r.competencyIdReviewVersion==='D3-FULL-YEAR-CANONICAL-v1',`${x.standardId} carries review version`);
 ok(Array.isArray(r.legacySkills)&&r.legacySkills.length>=1,`${x.standardId} retains legacy compatibility mapping`);
}

const nonT7=records.filter(r=>r.topicId!=='D3.T7');
ok(nonT7.length===44,'exactly 44 non-Topic-7 records');
ok(nonT7.every(r=>r.status==='mapped'),'all non-Topic-7 records remain SHADOW-ineligible mapped records');
ok(!records.some(r=>r.competencyIdStatus==='provisional'),'zero provisional competency IDs remain');

if(failures.length)console.error(JSON.stringify(failures,null,2));
console.log(JSON.stringify({status:failed?'fail':'pass',checks:passed+failed,passed,failed,totalStandards:records.length,canonical:records.filter(r=>r.competencyIdStatus==='canonical').length,mapped:records.filter(r=>r.status==='mapped').length,enabled:records.filter(r=>r.status==='enabled').length,topic7Enabled:records.filter(r=>r.topicId==='D3.T7'&&r.status==='enabled').length,legacyAudit:{partial:9,missing:35}},null,2));
process.exit(failed?1:0);
