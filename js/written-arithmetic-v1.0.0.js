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
    // Darjah 4–6 group digits as UASA does (91 368); spaces and commas are only separators.
    const compact=String(value).replace(/[\s,]/g,'');
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
    const operand='((?:\\d{1,3}(?:[ ,]\\d{3})+|\\d+)(?:\\.\\d+)?)';
    const match=sentence.match(new RegExp(`^${operand}\\s*([+−×÷])\\s*${operand}(?:\\s*\\2\\s*${operand})?\\s*=\\s*\\?\\s*$`));
    if(!match)return null;
    const [,rawLeft,operator,rawRight,rawThird]=match;
    const terms=[rawLeft,rawRight,rawThird].filter(Boolean).map(normaliseOperand);
    if(terms.some(term=>term===null))return null;
    const [left,right]=terms;
    // A long-division bracket with a decimal divisor is not an appropriate
    // written form for this first pass. Other decimal operations still align
    // their decimal places correctly in the column layout.
    if(operator==='÷'){
      if(terms.length!==2||terms.some(term=>term.includes('.')))return null;
      /* Bentuk bahagi panjang dalam tahap sekolah rendah ini hanya dipaparkan
         untuk bahagi tepat. Soalan baki/perpuluhan kekal dalam format asalnya,
         bukannya memberi gambaran salah bahawa jawapan mesti nombor bulat. */
      if(Number(left)%Number(right)!==0)return null;
    }
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
      // Subtracting instead of adding is the operation mistake; Math.abs keeps it from collapsing to 0.
      root.N(op==='add'?(Math.abs(left-right)||answer+2*delta):op==='sub'?left+right:op==='mul'?left+right:right,'operation'),
      root.N(answer+delta,op==='div'?'division':'place'),root.N(Math.max(0,answer-delta),op==='mul'?'fact':'place')
    ],'Gunakan bentuk lazim dan semak nilai tempat.','Bentuk lazim · operasi',true,true);
    const out=Object.assign({},baseQuestion,question,{
      competencyId:baseQuestion?.competencyId||skillId,standardRef:baseQuestion?.standardRef||skillId,
      archetypeId:`${baseQuestion?.archetypeId||skillId}_written`,representation:'symbolic',demand:'procedure',contextId:'written-arithmetic',
      writtenArithmeticMode:'required',writtenArithmeticSkill:skillId
    });
    // The base question's focus tag describes different numbers: never carry it over.
    delete out.focusDiagnosticV1;
    if((op==='add'||op==='sub')&&typeof root.attachAddSubFocusTag==='function')
      root.attachAddSubFocusTag(out,skillId,op==='add'?'addition':'subtraction',[left,right],answer,'written-arithmetic-v1');
    return out;
  }

  /* Pratonton DEV mesti boleh membuka satu bentuk lazim terus, tanpa bergantung
     pada giliran adaptive atau kemajuan murid. Contoh ini hanya untuk memeriksa
     paparan; ia tidak dihantar kepada enjin bukti pembelajaran. */
  function previewQuestion(grade,operation){
    const g=Math.min(6,Math.max(1,Number(grade)||1));
    if(g===1&&['mul','div'].includes(operation))return null;
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

  const WHOLE_PLACES=['sa','puluh','ratus','ribu','puluh ribu','ratus ribu','juta','puluh juta','ratus juta'];
  const DECIMAL_PLACES=['persepuluh','perseratus','perseribu','persepuluh ribu','perseratus ribu'];

  function resultFor(arithmetic){
    const terms=(arithmetic.terms||[arithmetic.left,arithmetic.right]).map(Number);
    if(arithmetic.operator==='+')return terms.reduce((sum,value)=>sum+value,0);
    if(arithmetic.operator==='−')return terms.slice(1).reduce((value,next)=>value-next,terms[0]);
    if(arithmetic.operator==='×')return terms.reduce((product,value)=>product*value,1);
    if(arithmetic.operator==='÷')return terms.slice(1).reduce((value,next)=>value/next,terms[0]);
    return NaN;
  }

  function columnsFor(layout){
    const columns=[];
    for(let place=layout.whole-1;place>=0;place--)columns.push({kind:'whole',index:layout.whole-place-1,name:WHOLE_PLACES[place]||`tempat ${place+1}`});
    if(layout.decimal){columns.push({kind:'decimal',name:'.'});for(let place=0;place<layout.decimal;place++)columns.push({kind:'fraction',index:place,name:DECIMAL_PLACES[place]||`perpuluhan ${place+1}`});}
    return columns;
  }

  function valueParts(value,layout){
    const [whole='0',decimal='']=String(value).split('.');
    return [...`${' '.repeat(Math.max(0,layout.whole-whole.length))}${whole}`.split(''),...(layout.decimal?['.',...`${decimal}${' '.repeat(Math.max(0,layout.decimal-decimal.length))}`.slice(0,layout.decimal).split('')]:[])];
  }

  function valueCells(value,layout){
    return valueParts(value,layout).map((char,index)=>char==='.'
      ? '<span class="paWaDecimal" aria-hidden="true">.</span>'
      : `<span class="paWaCell${char===' '?' isBlank':''}"${char===' '?' aria-hidden="true"':''}>${char===' '?'' : escapeHtml(char)}</span>`
    ).join('');
  }

  function entryCells(layout,kind){
    return columnsFor(layout).map((column,index)=>{
      if(column.kind==='decimal')return '<span class="paWaDecimal" aria-hidden="true">.</span>';
      const label=`${kind==='work'?'Catatan kerja':'Jawapan'} tempat ${column.name}`;
      if(kind==='work')return `<input class="paWaWorkInput" type="text" inputmode="numeric" maxlength="2" aria-label="${escapeHtml(label)}" autocomplete="off">`;
      const group=column.kind==='whole'?'whole':'fraction';
      return `<input class="paWaDigitInput" type="text" inputmode="numeric" maxlength="1" data-group="${group}" aria-label="${escapeHtml(label)}" autocomplete="off">`;
    }).join('');
  }

  function labelledRow(layout,label,content,className=''){
    return `<div class="paWaRow ${className}" style="--pa-wa-cols:${layout.whole+layout.decimal+(layout.decimal?1:0)}"><span class="paWaRowLabel">${label}</span>${content}</div>`;
  }

  function numberRow(term,operator,index,layout){
    const op=index?escapeHtml(operator):'';
    return labelledRow(layout,`<span class="paWaOperator" aria-hidden="true">${op}</span>`,valueCells(term,layout),'paWaNumberRow');
  }

  function answerRow(layout){
    return labelledRow(layout,'Jawapan',entryCells(layout,'answer'),'paWaAnswerRow');
  }

  function stackedMarkup(arithmetic,suppliedAnswer){
    const terms=arithmetic.terms||[arithmetic.left,arithmetic.right];
    const answer=Number.isFinite(numericValue(suppliedAnswer))?numericValue(suppliedAnswer):resultFor(arithmetic);
    const layout=metrics([...terms,String(answer)]);
    const cellCount=layout.whole+layout.decimal+(layout.decimal?1:0);
    const label={'+':'Tambah','−':'Tolak','×':'Darab'}[arithmetic.operator]||'Pengiraan';
    const expression=terms.join(` ${arithmetic.operator} `);
    const workLabel=arithmetic.operator==='−'?'SELEPAS PECAH':'SELEPAS BAWA';
    const workRow=['+','−','×'].includes(arithmetic.operator)
      ? labelledRow(layout,workLabel,entryCells(layout,'work'),'paWaWorkRow') : '';
    return `<section class="paWrittenArithmetic paWrittenArithmetic--stack" aria-label="${label}: ${escapeHtml(expression)}">
      <div class="paWaKicker">Bentuk lazim · kira dan isi jawapan</div>
      <form class="paWaForm" autocomplete="off">
        <div class="paWaStack" style="--pa-wa-cells:${cellCount}">
          ${labelledRow(layout,'',columnsFor(layout).map(column=>`<span class="paWaPlace">${column.kind==='decimal'?'':escapeHtml(column.name)}</span>`).join(''),'paWaPlaceRow')}
          ${workRow}
          ${terms.map((term,index)=>numberRow(term,arithmetic.operator,index,layout)).join('')}
          ${labelledRow(layout,'',`<span class="paWaRule" aria-hidden="true"></span>`,'paWaRuleRow')}
          ${answerRow(layout)}
        </div>
        <button type="submit" class="paWaSubmit">Semak jawapan</button>
        <small class="paWaStatus" aria-live="polite">Isi digit jawapan dalam lajur nilai tempat.</small>
      </form>
    </section>`;
  }

  function divisionMarkup(arithmetic){
    return `<section class="paWrittenArithmetic paWrittenArithmetic--division" aria-label="Bahagi: ${escapeHtml(arithmetic.left)} dibahagi ${escapeHtml(arithmetic.right)}">
      <div class="paWaKicker">Bahagi panjang · tulis hasil bahagi</div>
      <form class="paWaForm paWaDivisionForm" autocomplete="off">
        <div class="paWaDivision">
          <label class="paWaQuotient">${escapeHtml(arithmetic.right)} ) <input class="paWaDivisionInput" type="text" inputmode="numeric" enterkeyhint="done" aria-label="Jawapan hasil bahagi" autocomplete="off"></label>
          <button type="submit" class="paWaSubmit paWaDivisionSubmit">Jawab</button>
          <span class="paWaDividend">${escapeHtml(arithmetic.left)}</span>
        </div>
        <small class="paWaStatus" aria-live="polite">Taip hasil bahagi dan tekan Jawab.</small>
      </form>
    </section>`;
  }

  function numericValue(raw){
    const text=String(raw??'').trim().replace(/[\s,]/g,'');
    return /^\d+(?:\.\d+)?$/.test(text)?Number(text):NaN;
  }

  function collectAnswer(form){
    const division=form.querySelector('.paWaDivisionInput');
    if(division)return division.value.trim();
    const groups=['whole','fraction'].map(group=>[...form.querySelectorAll(`.paWaDigitInput[data-group="${group}"]`)]).filter(fields=>fields.length);
    for(const fields of groups){
      const first=fields.findIndex(field=>field.value.trim()!=='');
      if(first<0){fields.at(-1)?.focus();return null;}
      const gap=fields.slice(first).find(field=>field.value.trim()==='');
      if(gap){gap.focus();return null;}
    }
    const whole=groups.find((_,index)=>index===0)?.map(field=>field.value.trim()).join('')||'0';
    const fraction=groups[1]?.map(field=>field.value.trim()).join('')||'';
    return fraction?`${whole}.${fraction}`:whole;
  }

  function bind(container,question,respond){
    const form=container?.querySelector?.('.paWaForm');
    if(!form||form.dataset.bound==='1')return !!form;
    form.dataset.bound='1';
    const fields=[...form.querySelectorAll('.paWaDigitInput,.paWaDivisionInput')];
    const button=form.querySelector('.paWaSubmit');
    const status=form.querySelector('.paWaStatus');
    fields.forEach((field,index)=>{
      field.addEventListener('input',()=>{
        // Inputs without maxlength return -1. Never pass that to slice(0, -1):
        // it removes the final typed digit (including the only digit in 21 ÷ 3).
        const digits=field.value.replace(/[^0-9]/g,'');
        field.value=field.maxLength>0?digits.slice(0,field.maxLength):digits;
        if(field.classList.contains('paWaDigitInput')&&field.value&&field.maxLength===1)fields[index+1]?.focus();
        if(status)status.textContent=field.classList.contains('paWaDivisionInput')?'Tekan Jawab untuk semak hasil bahagi.':'Isi digit jawapan dalam lajur nilai tempat.';
      });
      field.addEventListener('keydown',event=>{
        if(event.key==='Enter'&&!event.isComposing){
          event.preventDefault();
          form.requestSubmit?.();
          return;
        }
        if(event.key==='Backspace'&&!field.value)fields[index-1]?.focus();
        if(event.key==='ArrowLeft')fields[index-1]?.focus();
        if(event.key==='ArrowRight')fields[index+1]?.focus();
      });
    });
    form.querySelectorAll('.paWaWorkInput').forEach(field=>field.addEventListener('input',()=>{
      field.value=field.value.replace(/[^0-9]/g,'').slice(0,2);
    }));
    form.addEventListener('submit',event=>{
      event.preventDefault();
      if(button?.disabled)return;
      const raw=collectAnswer(form);
      if(raw===null||raw===''){if(status)status.textContent='Lengkapkan digit jawapan dahulu.';return;}
      const value=numericValue(raw),expected=numericValue(question?.answer);
      if(!Number.isFinite(value)){if(status)status.textContent='Taip nombor sahaja.';return;}
      const matched=(question?.wrong||[]).find(option=>numericValue(option.v)===value);
      const option=Number.isFinite(expected)&&value===expected
        ? {v:question.answer,tag:'correct',label:raw}
        : matched||{v:raw,tag:(question?.wrong?.[0]?.tag||'place'),label:raw};
      if(button){button.dataset.questionToken=String(question?.token??'');button.disabled=true;}
      fields.forEach(field=>{field.disabled=true;});
      respond?.(option,button);
    });
    return true;
  }

  function retry(target,clearValue=true){
    const form=target?.matches?.('.paWaForm')?target:target?.closest?.('.paWaForm');
    if(!form)return false;
    form.querySelectorAll('.paWaDigitInput,.paWaDivisionInput,.paWaWorkInput').forEach(field=>{field.disabled=false;if(clearValue)field.value='';});
    const button=form.querySelector('.paWaSubmit');
    if(button){button.disabled=false;button.classList.remove('no','ok');}
    form.querySelector('.paWaStatus')?.replaceChildren(document.createTextNode(clearValue?'Cuba kira semula dan isi digit jawapan.':'Semak semula kiraan kamu dan betulkan digit jika perlu.'));
    form.querySelector('.paWaDigitInput:last-of-type,.paWaDivisionInput')?.focus();
    return true;
  }

  function setDisabled(target,disabled=true){
    const form=target?.matches?.('.paWaForm')?target:target?.closest?.('.paWaForm')||target?.querySelector?.('.paWaForm');
    if(!form)return false;
    form.querySelectorAll('input,button').forEach(control=>{control.disabled=disabled;});
    return true;
  }

  function render(question,session){
    if(question?.writtenArithmeticMode==='operation-flow')return null;
    if(question?.writtenArithmeticMode==='required'){
      const arithmetic=directArithmetic(question.prompt);
      if(!arithmetic)return null;
      return arithmetic.operator==='÷'?divisionMarkup(arithmetic):stackedMarkup(arithmetic,question?.answer);
    }
    const decision=planFor(question,session);
    if(!decision||!decision.show)return null;
    return decision.arithmetic.operator==='÷'
      ? divisionMarkup(decision.arithmetic)
      : stackedMarkup(decision.arithmetic,question?.answer);
  }

  const api={CYCLE_LENGTH,DISPLAY_SLOTS,directArithmetic,planFor,operationFor,operationSlotFor,operationQuestion,previewQuestion,inject,render,bind,retry,setDisabled,resultFor,columnsFor};
  root.PAWrittenArithmetic=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
