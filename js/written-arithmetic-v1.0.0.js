/* Written arithmetic presentation — preserves the existing question contract.
   It only decorates direct numeric sentences; answers, distractors, evidence,
   and adaptive routing remain owned by the normal question pipeline. */
(function(root){
  'use strict';

  const sessionPlans=new WeakMap();
  const CYCLE_LENGTH=5;
  const DISPLAY_SLOTS=new Set([0,3]);

  function escapeHtml(value){
    return String(value).replace(/[&<>"']/g,char=>({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[char]);
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
    const boldEquation=sentence.match(/^<b>\s*(\d+(?:\.\d+)?\s*[+−×÷]\s*\d+(?:\.\d+)?)\s*<\/b>\s*=\s*\?\s*$/i);
    if(boldEquation)sentence=`${boldEquation[1]} = ?`;
    if(/<\/?[a-z][^>]*>/i.test(sentence))return null;
    const match=sentence.match(/^(\d+(?:\.\d+)?)\s*([+−×÷])\s*(\d+(?:\.\d+)?)\s*=\s*\?\s*$/);
    if(!match)return null;
    const [,left,operator,right]=match;
    // A long-division bracket with a decimal divisor is not an appropriate
    // written form for this first pass. Other decimal operations still align
    // their decimal places correctly in the column layout.
    if(operator==='÷'&&(left.includes('.')||right.includes('.')))return null;
    return {left,operator,right};
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

  function metrics(left,right){
    const split=value=>String(value).split('.');
    const [leftWhole,leftDecimal='']=split(left);
    const [rightWhole,rightDecimal='']=split(right);
    return {
      whole:Math.max(leftWhole.length,rightWhole.length),
      decimal:Math.max(leftDecimal.length,rightDecimal.length)
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
    const layout=metrics(arithmetic.left,arithmetic.right);
    const cellCount=layout.whole+layout.decimal+(layout.decimal?1:0);
    const label={'+':'Tambah','−':'Tolak','×':'Darab'}[arithmetic.operator]||'Pengiraan';
    return `<section class="paWrittenArithmetic paWrittenArithmetic--stack" aria-label="${label}: ${escapeHtml(arithmetic.left)} ${escapeHtml(arithmetic.operator)} ${escapeHtml(arithmetic.right)}">
      <div class="paWaKicker">Bentuk lazim · pilih jawapan yang betul</div>
      <div class="paWaStack" style="--pa-wa-cells:${cellCount}">
        <span class="paWaOperator" aria-hidden="true"></span>
        <span class="paWaNumber">${cells(arithmetic.left,layout)}</span>
        <span class="paWaOperator" aria-hidden="true">${escapeHtml(arithmetic.operator)}</span>
        <span class="paWaNumber">${cells(arithmetic.right,layout)}</span>
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
    const decision=planFor(question,session);
    if(!decision||!decision.show)return null;
    return decision.arithmetic.operator==='÷'
      ? divisionMarkup(decision.arithmetic)
      : stackedMarkup(decision.arithmetic);
  }

  const api={CYCLE_LENGTH,DISPLAY_SLOTS,directArithmetic,planFor,render};
  root.PAWrittenArithmetic=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
