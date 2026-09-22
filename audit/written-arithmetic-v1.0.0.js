const assert=require('node:assert/strict');
const written=require('../js/written-arithmetic-v1.0.0.js');

assert.equal(written.directArithmetic('1,204 + 56 = ?'),null,'commas are not silently parsed as a different numeric value');
assert.deepEqual(written.directArithmetic('48 + 7 = ?'),{left:'48',operator:'+',right:'7'});
assert.deepEqual(written.directArithmetic('905 − 18 = ?'),{left:'905',operator:'−',right:'18'});
assert.deepEqual(written.directArithmetic('12 × 6 = ?'),{left:'12',operator:'×',right:'6'});
assert.deepEqual(written.directArithmetic('156 ÷ 12 = ?'),{left:'156',operator:'÷',right:'12'});
assert.deepEqual(written.directArithmetic('<div class="qsv2-prompt">4638 − 1608 = ?</div>'),{left:'4638',operator:'−',right:'1608'});
assert.deepEqual(written.directArithmetic('<svg><text>2059</text></svg><div class="qsv2-prompt">2059 × 2 = ?</div>'),{left:'2059',operator:'×',right:'2'});
assert.deepEqual(written.directArithmetic('<b>7 × 10</b> = ?'),{left:'7',operator:'×',right:'10'});
assert.deepEqual(written.directArithmetic('<b>80 ÷ 10</b> = ?'),{left:'80',operator:'÷',right:'10'});
assert.equal(written.directArithmetic('15.6 ÷ 3 = ?'),null,'decimal long division stays in its existing representation');
assert.equal(written.directArithmetic('Ali ada 12 guli.'),null,'word problems are untouched');

const session={};
const shown=[];
for(let index=0;index<10;index+=1){shown.push(written.planFor({prompt:`${10+index} + 2 = ?`},session).show)}
assert.deepEqual(shown,[true,false,false,true,false,true,false,false,true,false]);
assert.equal(shown.filter(Boolean).length,4,'two of every five eligible direct operations use written arithmetic');

const rendered=written.render({prompt:'408 − 79 = ?'},{});
assert.match(rendered,/paWrittenArithmetic--stack/);assert.match(rendered,/408/);
const divided=written.render({prompt:'156 ÷ 12 = ?'},{});
assert.match(divided,/paWrittenArithmetic--division/);assert.match(divided,/>12</);
console.log('written-arithmetic: OK');
