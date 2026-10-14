'use strict';
const assert=require('node:assert/strict');
global.window=global;
require('../js/kedai-kek-router.js');
require('../js/bengkel-ajaib-router.js');

const fractions=['D1.FRAC','D2.3.1','D2.3.3','D2.3.4','D3.FRAC','D4.FRAC','D5.FRAC','D6.FRAC'];
const measure=['D1.MEASURE','D2.6.1','D2.6.2','D2.6.3','D2.6.4','D3.MEASURE','D4.MEASURE','D5.MEASURE','D6.MEASURE'];
for(const skill of fractions){const p=PAKedaiKek.planFor({},skill);assert.ok(p?.start.length,`${skill} needs a Kedai Kek starter route`);assert.equal(p.grade,Number(skill.match(/^D(\d)/)[1]));}
for(const skill of measure){const p=PABengkelAjaib.planFor({},skill);assert.ok(p?.start.length,`${skill} needs a Bengkel Ajaib starter route`);assert.equal(p.grade,Number(skill.match(/^D(\d)/)[1]));}
assert.equal(PAKedaiKek.planFor({},'D2.3.2'),null,'Perpuluhan sahaja must not be labelled as Pecahan');
assert.deepEqual(PABengkelAjaib.locate(2,'length_read'),[{mode:'panjang',start:1}]);
assert.deepEqual(PABengkelAjaib.locate(2,'mass_read'),[{mode:'jisim',start:1}]);
assert.deepEqual(PABengkelAjaib.locate(2,'liquid_read'),[{mode:'isipadu',start:1}]);

const weak=PAKedaiKek.planFor({learnerReviewV1:{encounters:[
 {skillId:'D2.3.1',archetypeId:'bar_model',outcome:'corrected',mode:'practice'},
 {skillId:'D2.3.1',archetypeId:'bar_model',outcome:'assisted',mode:'practice'}
]}},'D2.3.1');
assert.deepEqual(weak.start,[{mode:'potong',start:0}]);
const length= PABengkelAjaib.planFor({learnerReviewV1:{encounters:[
 {skillId:'D2.6.1',archetypeId:'length_read',outcome:'corrected',mode:'practice'},
 {skillId:'D2.6.1',archetypeId:'length_read',outcome:'assisted',mode:'practice'}
]}},'D2.6.1');
assert.deepEqual(length.start,[{mode:'panjang',start:1}]);
console.log(`PASS: ${fractions.length} Pecahan tags + ${measure.length} Ukuran tags across D1–D6, with real-tag exclusion and weakness-level routing.`);
