const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const written=require('../js/written-arithmetic-v1.0.0.js');
global.N=(v,tag)=>({v,tag,label:v});
global.Q=(prompt,answer,wrong,hint,kind,diagnostic,formatShift)=>({prompt,answer,wrong,hint,kind,diagnostic,formatShift});

assert.deepEqual(written.directArithmetic('1,204 + 56 = ?'),{left:'1204',operator:'+',right:'56'});
assert.deepEqual(written.directArithmetic('48 + 7 = ?'),{left:'48',operator:'+',right:'7'});
assert.deepEqual(written.directArithmetic('905 − 18 = ?'),{left:'905',operator:'−',right:'18'});
assert.deepEqual(written.directArithmetic('12 × 6 = ?'),{left:'12',operator:'×',right:'6'});
assert.deepEqual(written.directArithmetic('156 ÷ 12 = ?'),{left:'156',operator:'÷',right:'12'});
assert.deepEqual(written.directArithmetic('<div class="qsv2-prompt">4638 − 1608 = ?</div>'),{left:'4638',operator:'−',right:'1608'});
assert.deepEqual(written.directArithmetic('<svg><text>2059</text></svg><div class="qsv2-prompt">2059 × 2 = ?</div>'),{left:'2059',operator:'×',right:'2'});
assert.deepEqual(written.directArithmetic('<b>7 × 10</b> = ?'),{left:'7',operator:'×',right:'10'});
assert.deepEqual(written.directArithmetic('<b>80 ÷ 10</b> = ?'),{left:'80',operator:'÷',right:'10'});
assert.deepEqual(written.directArithmetic('356 + 143 + 21 = ?'),{left:'356',operator:'+',right:'143',terms:['356','143','21']});
assert.equal(written.directArithmetic('15.6 ÷ 3 = ?'),null,'decimal long division stays in its existing representation');
assert.equal(written.directArithmetic('47 ÷ 26 = ?'),null,'non-exact division is not misrepresented as a whole-number long division');
assert.equal(written.directArithmetic('120 ÷ 3 ÷ 2 = ?'),null,'chained division is not a long-division question');
assert.equal(written.directArithmetic('120 ÷ 3 ÷ 0.5 = ?'),null,'chained decimal division is not a long-division question');
assert.equal(written.directArithmetic('Ali ada 12 guli.'),null,'word problems are untouched');

const session={};
const shown=[];
for(let index=0;index<10;index+=1){shown.push(written.planFor({prompt:`${10+index} + 2 = ?`},session).show)}
assert.deepEqual(shown,[true,false,false,true,false,true,false,false,true,false]);
assert.equal(shown.filter(Boolean).length,4,'two of every five eligible direct operations use written arithmetic');

const rendered=written.render({prompt:'408 − 79 = ?'},{});
assert.match(rendered,/paWrittenArithmetic--stack/);assert.match(rendered,/408/);
assert.match(rendered,/SELEPAS PECAH/,'subtraction includes an optional regrouping workspace');
assert.match(rendered,/paWaWorkInput/,'regrouping workspace is directly editable');
assert.match(rendered,/paWaDigitInput/,'the answer is entered in aligned place-value cells');
assert.match(rendered,/Bentuk lazim · kira dan isi jawapan/,'the prompt describes writing the result, not choosing an option');
// Regression: quotient input must accept an unlimited-length answer, and the
// action must stay beside the input when the mobile keyboard opens.
const year2Division=written.render({prompt:'21 ÷ 3 = ?',answer:7},{});
assert.match(year2Division,/paWaDivisionInput[^>]*enterkeyhint="done"/,'mobile keyboard Done is available');
assert.match(year2Division,/paWaDivisionSubmit/,'division submit button remains above the keyboard');
assert.match(fs.readFileSync('js/written-arithmetic-v1.0.0.js','utf8'),/field\.maxLength>0\?digits\.slice\(0,field\.maxLength\):digits/,'unbounded division input never loses its last digit');
const divided=written.render({prompt:'156 ÷ 12 = ?'},{});
assert.match(divided,/paWrittenArithmetic--division/);assert.match(divided,/>12 \)/);
assert.match(divided,/paWaDivisionInput/,'long division has an editable quotient directly in the bracket');
const threeTerm=written.render({prompt:'356 + 143 + 21 = ?'},{});
assert.match(threeTerm,/aria-label="Tambah: 356 \+ 143 \+ 21"/);
const byGrade=[
  ['Darjah 1','8 + 7 = ?'],['Darjah 2','356 + 143 + 21 = ?'],['Darjah 3','1,250 − 300 = ?'],
  ['Darjah 4','78 × 6 = ?'],['Darjah 5','1,200 ÷ 15 = ?'],['Darjah 6','3.45 + 0.55 = ?']
];
byGrade.forEach(([grade,prompt])=>assert.match(written.render({prompt},null),/paWrittenArithmetic/,`${grade} direct operation renders in written form`));
assert.match(written.render({prompt:'58817 + 14785 = ?',answer:73602},null),/Jawapan tempat sa/);
assert.match(fs.readFileSync('js/app.js','utf8'),/PAWrittenArithmetic\?\.bind/,'the normal battle binds the in-question answer surface');
assert.match(fs.readFileSync('js/segel-demo-v2.1.0.js','utf8'),/PAWrittenArithmetic\?\.bind/,'the Segel demo binds the in-question answer surface');
assert.equal(written.previewQuestion(1,'div'),null,'Darjah 1 preview does not expose division before its curriculum level');
const operationSession={};
const operationSlots=[];
for(let index=0;index<5;index+=1)operationSlots.push(written.inject({prompt:'soalan asal'},'D6.OPS',operationSession).writtenArithmeticMode);
assert.deepEqual(operationSlots,[undefined,undefined,undefined,undefined,undefined],'D6 competency questions are not replaced centrally');
[
  ['D2.2.3','Darjah 2'],['D3.DIV','Darjah 3'],['D4.SUB','Darjah 4'],['D5.MUL','Darjah 5']
].forEach(([skill,grade])=>{
  const q=written.inject({prompt:'soalan asal',archetypeId:'base'},skill,{});
  assert.equal(q.writtenArithmeticMode,'required',`${grade} operation has a forced written-form slot`);
  assert.match(written.render(q,{}),/paWrittenArithmetic/,`${grade} forced slot visibly renders`);
});
{
  // A swapped-in written question has new numbers, so the base question's focus tag must not ride along.
  const tagged=written.inject({prompt:'7 + 5 = ?',archetypeId:'base',focusDiagnosticV1:{schema:'pa.focus.question-tag.v1',arithmeticProfile:{operands:{addends:[7,5],sum:12}}}},'D4.SUB',{});
  assert.equal(tagged.writtenArithmeticMode,'required');
  const ops=tagged.focusDiagnosticV1?.arithmeticProfile?.operands;
  assert(!ops||(ops.minuend!==undefined&&ops.difference===tagged.answer),'written swap never keeps the original question tag');
}
assert.equal(written.inject({prompt:'asal',subcompetencyId:'2.2.2'},'D3.ADD10000',{}).prompt,'asal','competency-targeted questions keep their original task');
const y6Runtime={GEN:{},Nq:(v,t)=>({v,t}),choose:a=>a[0],rand:(a,b)=>a,stage:()=>2,q:(prompt,answer,wrong,hint,kind)=>({prompt,answer,wrong,hint,kind}),mark:(out,id,node,mode)=>Object.assign(out,{id,node,mode}),chooseMode:()=>{throw new Error('written slots must not depend on a fallback mode')},bandModes:()=>[],recentFor:()=>[]};
const y6Context={window:{PAY6V2Runtime:y6Runtime},document:{documentElement:{setAttribute:()=>{}}}};
vm.runInNewContext(fs.readFileSync('questions/kssr-year6-v2-unit1-v3.61.0.js','utf8'),y6Context);
const y6First=y6Runtime.GEN['1.2.1']('D6.OPS',{});
assert.equal(y6First.writtenArithmeticMode,'required','first D6 operation slot is a written-arithmetic question');
assert.match(y6First.prompt,/\+/, 'first D6 written slot is addition');
console.log('written-arithmetic: OK');
