/* Written arithmetic presentation — preserves the existing question contract.
   It only decorates direct numeric sentences; answers, distractors, evidence,
   and adaptive routing remain owned by the normal question pipeline. */
(function(root){
  'use strict';

  const sessionPlans=new WeakMap();
  const operationPlans=new WeakMap();
  const CYCLE_LENGTH=5;
  const DISPLAY_SLOTS=new Set([0,3]);

  function escapeHtml(value){
    return String(value).replace(/[&<>"']/g,char=>({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[char]);
  }

  function normaliseOperand(value){
    const compact=String(value).replace(/,/g,'');
    return /^\d+(?:\.\d+)?$/.test(compact)?compact:null;
  }

  function directArithmetic(prompt){
    if(typeof prompt!=='string')return null;
    // QSv2 may add an instructional SVG before its text prompt. The final
    // qsv2-prompt node is still the approved direct arithmetic sentence; when
    // it matches, this written form intentionally replaces that duplicate SVG.
    const wrapped=prompt.trim().match(/<div\b[^>]*\bqsv2-prompt\b[^>]*>([^<>]*)<\/div>\s*$/i);
    let sentence=wrapped?wrapped[1]:prompt.trim();
    // A few legacy direct-operation banks bold only the equation. Accept that
    // exact, closed form, but do not strip markup from a broader question.
    const boldEquation=sentence.match(/^<b>\s*(.+?)\s*<\/b>\s*=\s*\?\s*$/i);
    if(boldEquation)sentence=`${boldEquation[1]} = ?`;
    if(/<\/?[a-z][^>]*>/i.test(sentence))return null;
    const match=sentence.match(/^([\d,]+(?:\.\d+)?)\s*([+−×÷])\s*([\d,]+(?:\.\d+)?)(?:\s*\2\s*([\d,]+(?:\.\d+)?))?\s*=\s*\?\s*$/);
    if(!match)return null;
    const [,rawLeft,operator,rawRight,rawThird]=match;
    const terms=[rawLeft,rawRight,rawThird].filter(Boolean).map(normaliseOperand);
    if(terms.some(term=>term===null))return null;
    const [left,right]=terms;
    // A long-division bracket with a decimal divisor is not an appropriate
    // written form for this first pass. Other decimal operations still align
    // their decimal places correctly in the column layout.
    if(operator==='÷'&&(terms.length!==2||terms.some(term=>term.includes('.'))))return null;
    const arithmetic={left,operator,right};
    if(terms.length===3)arithmetic.terms=terms;
    return arithmetic;
  }

  function planFor(question,session){
    const arithmetic=directArithmetic(question&&question.prompt);
    if(!arithmetic)return null;
    if(!session||typeof session!=='object')return {arithmetic,show:true};
    let plan=sessionPlans.get(session);
    if(!plan){plan={eligible:0,decisions:new WeakMap()};sessionPlans.set(session,plan)}
    const cached=plan.decisions.get(question);
    if(cached)return cached;
    const display=DISPLAY_SLOTS.has(plan.eligible%CYCLE_LENGTH);
    plan.eligible+=1;
    const decision={arithmetic,show:display};
    plan.decisions.set(question,decision);
    return decision;
  }

  function operationFor(skillId){
    const id=String(skillId||'');
    if(/^D2\.2\.[1-4]$/.test(id))return ['add','sub','mul','div'][Number(id.at(-1))-1];
    if(/^D3\.(?:ADD10000|SUB10000|MUL|DIV)$/.test(id))return id.includes('ADD')?'add':id.includes('SUB')?'sub':id.includes('MUL')?'mul':'div';
    if(/^D4\.(?:ADD|SUB|MUL|DIV)$/.test(id))return id.slice(3).toLowerCase();
    if(/^D5\.(?:ADD|SUB|MUL|DIV)$/.test(id))return id.slice(3).toLowerCase();
    return null;
  }

  function maximumFor(skillId){
    const id=String(skillId||'');
    if(id.includes('20'))return 20;
    if(id.startsWith('D1.'))return 100;
    if(id.startsWith('D2.'))return 1000;
    if(id.startsWith('D3.'))return 10000;
    if(id.startsWith('D4.'))return 100000;
    return 1000000;
  }

  function randomInt(min,max){return Math.floor(Math.random()*(max-min+1))+min}

  function operationSlotFor(skillId,session){
    if(!operationFor(skillId))return false;
    if(!session||typeof session!=='object')return true;
    let plan=operationPlans.get(session);
    if(!plan){plan={counts:Object.create(null)};operationPlans.set(session,plan)}
    const index=plan.counts[skillId]||0;
    plan.counts[skillId]=index+1;
    return DISPLAY_SLOTS.has(index%CYCLE_LENGTH);
  }

  function operationQuestion(skillId,baseQuestion){
    const op=operationFor(skillId),maximum=maximumFor(skillId);
    if(!op||typeof root.Q!=='function'||typeof root.N!=='function')return null;
    let left,right,answer,symbol;
    if(op==='add'){
      left=randomInt(Math.max(1,Math.floor(maximum*.12)),Math.floor(maximum*.6));
      right=randomInt(1,Math.max(1,maximum-left));answer=left+right;symbol='+';
    }else if(op==='sub'){
      left=randomInt(Math.max(2,Math.floor(maximum*.35)),maximum);
      right=randomInt(1,left-1);answer=left-right;symbol='−';
    }else if(op==='mul'){
      if(String(skillId).startsWith('D2.')){left=randomInt(2,9);right=randomInt(2,9)}
      else if(String(skillId).startsWith('D3.')){left=randomInt(2,12);right=randomInt(2,12)}
      else if(String(skillId).startsWith('D4.')){left=randomInt(12,99);right=randomInt(3,9)}
      else{left=randomInt(20,99);right=randomInt(11,25)}
      answer=left*right;symbol='×';
    }else{
      if(String(skillId).startsWith('D2.')){right=randomInt(2,9);answer=randomInt(2,9)}
      else if(String(skillId).startsWith('D3.')){right=randomInt(2,12);answer=randomInt(2,12)}
      else if(String(skillId).startsWith('D4.')){right=[3,4,5,6,8,9][randomInt(0,5)];answer=randomInt(12,60)}
      else{right=[12,15,20,25][randomInt(0,3)];answer=randomInt(12,40)}
      left=right*answer;symbol='÷';
    }
    const delta=Math.max(1,op==='mul'||op==='div'?right:Math.pow(10,Math.max(0,String(Math.floor(answer)).length-2)));
    const question=root.Q(`${left} ${symbol} ${right} = ?`,answer,[
      root.N(op==='add'?Math.max(0,left-right):op==='sub'?left+right:op==='mul'?left+right:right,'operation'),
      root.N(answer+delta,op==='div'?'division':'place'),root.N(Math.max(0,answer-delta),op==='mul'?'fact':'place')
    ],'Gunakan bentuk lazim dan semak nilai tempat.','Bentuk lazim · operasi',true,true);
    return Object.assign({},baseQuestion,question,{
      competencyId:baseQuestion?.competencyId||skillId,standardRef:baseQuestion?.standardRef||skillId,
      archetypeId:`${baseQuestion?.archetypeId||skillId}_written`,representation:'symbolic',demand:'procedure',contextId:'written-arithmetic',
      writtenArithmeticMode:'required',writtenArithmeticSkill:skillId
    });
  }

  /* Pratonton DEV mesti boleh membuka satu bentuk lazim terus, tanpa bergantung
     pada giliran adaptive atau kemajuan murid. Contoh ini hanya untuk memeriksa
     paparan; ia tidak dihantar kepada enjin bukti pembelajaran. */
  function previewQuestion(grade,operation){
    const g=Math.min(6,Math.max(1,Number(grade)||1));
    const examples={
      1:{add:[47,26],sub:[83,41]},
      2:{add:[368,247],sub:[704,286],mul:[7,8],div:[72,8]},
      3:{add:[4729,1568],sub:[8304,2679],mul:[36,7],div:[864,9]},
      4:{add:[47829,23017],sub:[80426,37158],mul:[48,6],div:[432,8]},
      5:{add:[247829,130176],sub:[604321,278954],mul:[36,24],div:[720,15]},
      6:{add:[247829,130176],sub:[604321,278954],mul:[48,25],div:[960,24]}
    };
    const op=['add','sub','mul','div'].includes(operation)?operation:'add';
    const values=examples[g][op]||examples[g].add;
    const symbols={add:'+',sub:'−',mul:'×',div:'÷'};
    const answer=op==='add'?values[0]+values[1]:op==='sub'?values[0]-values[1]:op==='mul'?values[0]*values[1]:values[0]/values[1];
    const skillByOperation={
      1:{add:'D1.ADD100',sub:'D1.SUB100'},
      2:{add:'D2.2.1',sub:'D2.2.2',mul:'D2.2.3',div:'D2.2.4'},
      3:{add:'D3.ADD10000',sub:'D3.SUB10000',mul:'D3.MUL',div:'D3.DIV'},
      4:{add:'D4.ADD',sub:'D4.SUB',mul:'D4.MUL',div:'D4.DIV'},
      5:{add:'D5.ADD',sub:'D5.SUB',mul:'D5.MUL',div:'D5.DIV'},
      6:{add:'D6.OPS',sub:'D6.OPS',mul:'D6.OPS',div:'D6.OPS'}
    };
    const delta=Math.max(1,Math.pow(10,Math.max(0,String(answer).length-2)));
    return {
      prompt:`${values[0]} ${symbols[op]} ${values[1]} = ?`,answer,
      wrong:[
        {v:answer+delta,label:answer+delta,tag:'place'},
        {v:Math.max(0,answer-delta),label:Math.max(0,answer-delta),tag:'place'},
        {v:op==='add'?Math.abs(values[0]-values[1]):op==='sub'?values[0]+values[1]:values[1],label:op==='add'?Math.abs(values[0]-values[1]):op==='sub'?values[0]+values[1]:values[1],tag:'operation'}
      ],
      hint:'Ini pratonton paparan sahaja. Semak penjajaran nilai tempat.',
      title:`Pratonton Bentuk Lazim ${({add:'Tambah',sub:'Tolak',mul:'Darab',div:'Bahagi'})[op]}`,
      skill:skillByOperation[g][op]||skillByOperation[g].add,
      writtenArithmeticMode:'required',writtenArithmeticPreview:true
    };
  }

  function inject(question,skillId,session){
    if(!operationFor(skillId)||!question)return question;
    if(question.qsv2Live||question.subcompetencyId||(question.competencyId&&question.competencyId!==skillId))return question;
    if(!operationSlotFor(skillId,session))return Object.assign({},question,{writtenArithmeticMode:'operation-flow'});
    return operationQuestion(skillId,question)||question;
  }

  function metrics(terms){
    const split=value=>String(value).split('.');
    const values=terms.map(split);
    return {
      whole:Math.max(...values.map(([whole])=>whole.length)),
      decimal:Math.max(...values.map(([,decimal=''])=>decimal.length))
    };
  }

  function cells(value,layout){
    const [whole,decimal='']=String(value).split('.');
    const wholeCells=`${' '.repeat(layout.whole-whole.length)}${whole}`.split('').map(char=>
      `<span class="paWaCell${char===' ' ? ' isBlank' : ''}"${char===' ' ? ' aria-hidden="true"' : ''}>${char===' ' ? '' : escapeHtml(char)}</span>`
    );
    if(!layout.decimal)return wholeCells.join('');
    const decimalCells=`${decimal}${' '.repeat(layout.decimal-decimal.length)}`.split('').map(char=>
      `<span class="paWaCell${char===' ' ? ' isBlank' : ''}"${char===' ' ? ' aria-hidden="true"' : ''}>${char===' ' ? '' : escapeHtml(char)}</span>`
    );
    return `${wholeCells.join('')}<span class="paWaDecimal">.</span>${decimalCells.join('')}`;
  }

  function answerCells(layout){
    const count=layout.whole+layout.decimal+(layout.decimal?1:0);
    return `<span class="paWaAnswerMark" style="grid-column:${count}">?</span>`;
  }

  function stackedMarkup(arithmetic){
    const terms=arithmetic.terms||[arithmetic.left,arithmetic.right];
    const layout=metrics(terms);
    const cellCount=layout.whole+layout.decimal+(layout.decimal?1:0);
    const label={'+':'Tambah','−':'Tolak','×':'Darab'}[arithmetic.operator]||'Pengiraan';
    const expression=terms.join(` ${arithmetic.operator} `);
    return `<section class="paWrittenArithmetic paWrittenArithmetic--stack" aria-label="${label}: ${escapeHtml(expression)}">
      <div class="paWaKicker">Bentuk lazim · pilih jawapan yang betul</div>
      <div class="paWaStack" style="--pa-wa-cells:${cellCount}">
        ${terms.map((term,index)=>`<span class="paWaOperator" aria-hidden="true">${index ? escapeHtml(arithmetic.operator) : ''}</span><span class="paWaNumber">${cells(term,layout)}</span>`).join('')}
        <span class="paWaRule" aria-hidden="true"></span>
        <span class="paWaAnswer">${answerCells(layout)}</span>
      </div>
    </section>`;
  }

  function divisionMarkup(arithmetic){
    return `<section class="paWrittenArithmetic paWrittenArithmetic--division" aria-label="Bahagi: ${escapeHtml(arithmetic.left)} dibahagi ${escapeHtml(arithmetic.right)}">
      <div class="paWaKicker">Bahagi panjang · pilih jawapan yang betul</div>
      <div class="paWaDivision" aria-hidden="true">
        <span class="paWaQuotient">?</span>
        <span class="paWaDivisor">${escapeHtml(arithmetic.right)}</span>
        <span class="paWaDividend">${escapeHtml(arithmetic.left)}</span>
      </div>
    </section>`;
  }

  function render(question,session){
    if(question?.writtenArithmeticMode==='operation-flow')return null;
    if(question?.writtenArithmeticMode==='required'){
      const arithmetic=directArithmetic(question.prompt);
      if(!arithmetic)return null;
      return arithmetic.operator==='÷'?divisionMarkup(arithmetic):stackedMarkup(arithmetic);
    }
    const decision=planFor(question,session);
    if(!decision||!decision.show)return null;
    return decision.arithmetic.operator==='÷'
      ? divisionMarkup(decision.arithmetic)
      : stackedMarkup(decision.arithmetic);
  }

  const api={CYCLE_LENGTH,DISPLAY_SLOTS,directArithmetic,planFor,operationFor,operationSlotFor,operationQuestion,previewQuestion,inject,render};
  root.PAWrittenArithmetic=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
