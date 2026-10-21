/* Pahlawan Angka — "Jom tengok cara": an interactive worked example for the mini games.
   After a pupil has tried a round several times, Wira walks through the written
   (lazim) method one column at a time. The pupil still does each step: every
   step asks one small question with three tiles (the right one, and the slips a
   child really makes: forgetting the carried 1, taking the smaller digit from the
   bigger, one off). Borrowing is its own tap ("Pinjam"). A wrong tile shakes and
   the right one glows, so nobody gets stuck. Pure step builder (Node-testable)
   plus a small DOM renderer the game page calls. */
(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.PAWorked=api;
})(typeof window!=='undefined'?window:undefined,function(){
  'use strict';
  const VERSION='1.0.0';
  const PLACE=['sa','puluh','ratus','ribu','puluh ribu','ratus ribu','juta'];
  const SIGN={add:'+',sub:'−',mul:'×',div:'÷'};
  const digits=n=>String(Math.abs(Math.trunc(n))).split('').map(Number).reverse();
  const num=s=>Number(String(s).replace(/[\s, ]/g,''));
  // Thousands grouped with a no-break space from 10 000, as the games print them.
  const nf=n=>Math.abs(n)>=10000?String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'\u00a0'):String(n);
  // Three different tiles: the right one first in the list given, shuffled by the caller's order rule.
  function tiles(right,wrongs){
    const out=[right];
    for(const w of wrongs)if(Number.isInteger(w)&&w>=0&&!out.includes(w)&&out.length<3)out.push(w);
    for(let d=1;out.length<3;d++){if(!out.includes(right+d))out.push(right+d);else if(right-d>=0&&!out.includes(right-d))out.push(right-d)}
    // A fixed, non-sorted order that still moves the right answer around.
    const k=(right*7+wrongs.length)%3;return[...out.slice(1,1+k),out[0],...out.slice(1+k)];
  }

  /* Read "a op b" from a round: its facets when the page knows them, else its worked text "a + b = c.". */
  function parse(q){
    const fx=q?.fx||{};
    if(['add','sub','mul','div'].includes(fx.op)&&Array.isArray(fx.operands)&&fx.operands.length===2)return{op:fx.op,a:fx.operands[0],b:fx.operands[1]};
    const m=/^\s*([\d][\d  ,]*)\s*([+−×÷])\s*([\d][\d  ,]*)\s*=\s*[\d]/.exec(String(q?.a||''));
    if(!m)return null;
    const op={'+':'add','−':'sub','×':'mul','÷':'div'}[m[2]];
    return{op,a:num(m[1]),b:num(m[3])};
  }

  /* The written method as steps. Each step: {kind:'pick'|'borrow', col, say, ask, choices, right, after}.
     `after` says what the board shows once the step is done. */
  function build(op,a,b,opt={}){
    if(!Number.isInteger(a)||!Number.isInteger(b)||a<0||b<0)return null;
    let plan=null;
    if(op==='add')plan=add(a,b);
    else if(op==='sub'&&a>=b)plan=sub(a,b);
    else if(op==='mul'&&b>=1&&b<=9&&a>=10)plan=mul(a,b);
    else if(op==='mul'&&a>=1&&a<=9&&b>=10)plan=mul(b,a);
    else if(op==='div'&&b>=2&&b<=12&&a>=b)plan=div(a,b);
    // A story first asks for the number sentence: the right one, the other operation, the reversed order.
    if(plan&&opt.story){
      const S=(x,o,y)=>`${nf(x)} ${SIGN[o]} ${nf(y)}`,other={add:'sub',sub:'add',mul:'add',div:'mul'}[op];
      const right=S(a,op,b),wrong=[S(a,other,b),op==='sub'||op==='div'?S(b,op,a):S(a,op==='add'?'mul':'sub',b)];
      plan.steps.unshift({kind:'pick',col:-1,say:'Ayat matematik mana yang sepadan dengan cerita?',right,choices:[wrong[0],right,wrong[1]],sentence:true,
        after:{sign:SIGN[op],note:`Betul: ${right}. Sekarang kira ikut tempat, mula dari sa.`}});
    }
    return plan;
  }
  function add(a,b){
    const A=digits(a),B=digits(b),n=Math.max(A.length,B.length),steps=[];let c=0;
    for(let i=0;i<n;i++){
      const x=A[i]||0,y=B[i]||0,s=x+y+c,one=A[i]===undefined||B[i]===undefined,ask=one?`${A[i]===undefined?y:x} + 1 = ?`:`${x} + ${y}${c?' + 1':''} = ?`;
      // Only one number has a digit here and nothing is carried: it just comes down.
      if((A[i]===undefined||B[i]===undefined)&&!c){steps.push({kind:'show',col:i,say:`Tempat ${PLACE[i]}: hanya ada ${s}. ${s} turun.`,after:{write:{col:i,digit:s},note:`Tulis ${s}.`}});continue}
      steps.push({kind:'pick',col:i,ask,say:`Tempat ${PLACE[i]}: ${ask}`,right:s,choices:tiles(s,[c?x+y:s+1,s%10===s?s-1:s%10,Math.abs(x-y)]),
        after:{write:{col:i,digit:s%10},carry:s>=10?{col:i+1}:null,note:s>=10?`Tulis ${s%10}, kumpul semula 1 ke tempat ${PLACE[i+1]}.`:`Tulis ${s}.`}});
      c=s>=10?1:0;
    }
    if(c)steps.push({kind:'show',col:n,say:`Tempat ${PLACE[n]}: 1 yang dikumpul semula turun.`,after:{write:{col:n,digit:1},note:'Tulis 1.'}});
    return{op:'add',rows:[a,b],answer:a+b,cols:Math.max(n+(c?1:0),digits(a+b).length),steps};
  }
  function sub(a,b){
    const A=digits(a),B=digits(b),top=[...A],n=A.length,steps=[];
    for(let i=0;i<n;i++){
      const y=B[i]||0;
      if(top[i]<y){
        // Borrow from the next place that has something; zeros on the way become 9.
        let j=i+1;while(j<n&&top[j]===0)j++;
        const chain=[];for(let k=j;k>i;k--){chain.push({col:k,from:top[k],to:k===j?top[k]-1:9})}
        steps.push({kind:'borrow',col:i,say:`Tempat ${PLACE[i]}: ${top[i]} kurang daripada ${y}. Pinjam 1 dari tempat ${PLACE[j]}${j>i+1?' (melalui 0)':''}.`,
          after:{borrow:chain,gain:{col:i,from:top[i],to:top[i]+10},note:`${top[i]} jadi ${top[i]+10}.`}});
        top[j]-=1;for(let k=j-1;k>i;k--)top[k]=9;top[i]+=10;
      }
      const d=top[i]-y,ask=`${top[i]} − ${y} = ?`;
      if(B[i]===undefined){const lead=i===n-1&&d===0&&n>1;steps.push({kind:'show',col:i,say:lead?`Tempat ${PLACE[i]}: tinggal 0. 0 di depan tidak ditulis.`:`Tempat ${PLACE[i]}: tiada nombor untuk ditolak. ${d} turun.`,after:{write:{col:i,digit:d,lead:i===n-1&&d===0&&n>1},note:d===0&&i===n-1&&n>1?'0 di depan tidak ditulis.':`Tulis ${d}.`}});continue}
      steps.push({kind:'pick',col:i,ask,say:`Tempat ${PLACE[i]}: ${ask}`,right:d,choices:tiles(d,[Math.abs((A[i])-y),d+1,top[i]+y]),
        after:{write:{col:i,digit:d,lead:i===n-1&&d===0&&n>1},note:`Tulis ${d}.`}});
    }
    return{op:'sub',rows:[a,b],answer:a-b,cols:n,steps};
  }
  function mul(a,b){
    const A=digits(a),n=A.length,steps=[];let c=0;
    for(let i=0;i<n;i++){
      const p=A[i]*b+c,ask=`${A[i]} × ${b}${c?' + '+c:''} = ?`;
      steps.push({kind:'pick',col:i,ask,say:`Tempat ${PLACE[i]}: ${ask}`,right:p,choices:tiles(p,[c?A[i]*b:p+b,p-b,A[i]+b+c]),
        after:{write:{col:i,digit:p%10},carry:p>=10?{col:i+1,digit:Math.floor(p/10)}:null,note:p>=10?`Tulis ${p%10}, bawa ${Math.floor(p/10)} ke tempat ${PLACE[i+1]}.`:`Tulis ${p}.`}});
      c=Math.floor(p/10);
    }
    if(c)steps.push({kind:'show',col:n,say:`Tempat ${PLACE[n]}: ${c} yang dibawa turun.`,after:{write:{col:n,digit:c,multi:true},note:`Tulis ${c}.`}});
    return{op:'mul',rows:[a,b],answer:a*b,cols:digits(a*b).length,steps};
  }
  function div(a,b){
    // Short division (bahagi bentuk lazim): left to right, the remainder joins the next digit.
    const D=digits(a).reverse(),steps=[];let r=0,started=false;const qd=[];
    D.forEach((d,k)=>{
      const cur=r*10+d,q=Math.floor(cur/b),col=D.length-1-k;
      if(!started&&q===0&&k<D.length-1){r=cur;steps.push({kind:'show',col,say:`${cur} kurang daripada ${b}. Gabung dengan digit seterusnya.`,after:{write:{col,digit:null},note:'Tiada di sini.'}});return}
      started=true;qd.push(q);const nr=cur-q*b;
      steps.push({kind:'pick',col,ask:`${cur} ÷ ${b} = ?`,say:`${cur} ÷ ${b} = ? (berapa kumpulan ${b}?)`,right:q,choices:tiles(q,[q+1,q-1,cur%10]),
        after:{write:{col,digit:q},rem:nr,note:nr?`${q} × ${b} = ${q*b}. Baki ${nr}${k<D.length-1?' dibawa ke digit seterusnya':''}.`:`${q} × ${b} = ${q*b}. Tiada baki.`}});
      r=nr;
    });
    return{op:'div',rows:[a,b],answer:Math.floor(a/b),rem:r,cols:D.length,steps};
  }

  /* ---------- renderer ---------- */
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  function boardHTML(plan,opt={}){
    const n=plan.cols,[a,b]=plan.rows,A=digits(a),B=digits(b),cell=(cls,txt,col,extra='')=>`<span class="wk-c ${cls}" data-col="${col}"${extra}>${txt}</span>`;
    const cols=[...Array(n).keys()].reverse();
    const head=cols.map(i=>cell('wk-h',PLACE[i]==='puluh ribu'?'p.ribu':PLACE[i]==='ratus ribu'?'r.ribu':PLACE[i],i)).join('');
    if(plan.op==='div'){
      const D=digits(a).reverse();
      return `<div class="wk-board wk-div" style="--n:${D.length}"><div class="wk-row wk-head"><span class="wk-op"></span>${D.map((_,k)=>cell('wk-h','',D.length-1-k)).join('')}</div>
        <div class="wk-row wk-ans"><span class="wk-op"></span>${D.map((_,k)=>cell('wk-a','',D.length-1-k)).join('')}</div>
        <div class="wk-row wk-top wk-bracket"><span class="wk-op wk-dv">${b}</span>${D.map((d,k)=>cell('wk-d',d,D.length-1-k)).join('')}</div>
        <div class="wk-rem" aria-live="polite"></div></div>`;
    }
    const row=(D,sign)=>`<div class="wk-row"><span class="wk-op">${sign||''}</span>${cols.map(i=>cell('wk-d',D[i]===undefined?'':D[i],i)).join('')}</div>`;
    const sign=opt.hideSign?'<i class="wk-sign">?</i>':SIGN[plan.op];
    const second=plan.op==='mul'?row([b],sign):row(B,sign);
    return `<div class="wk-board" style="--n:${n}"><div class="wk-row wk-head"><span class="wk-op"></span>${head}</div>
      <div class="wk-row wk-carry"><span class="wk-op"></span>${cols.map(i=>cell('wk-k','',i)).join('')}</div>
      ${row(A)}${second}<div class="wk-line"></div>
      <div class="wk-row wk-ans"><span class="wk-op">=</span>${cols.map(i=>cell('wk-a','',i)).join('')}</div></div>`;
  }
  /* Run the walkthrough. el = {board, tiles, say, next}; onDone(plan) after the last step. */
  function run(plan,el,onDone,opt={}){
    const q=s=>el.board.querySelector(s);let k=0,busy=false;
    const story=plan.steps[0]?.sentence===true;
    el.board.innerHTML=boardHTML(plan,{hideSign:story});
    // A story asks for the number sentence first, with no board in the way; the board comes in after.
    const boardEl=el.board.querySelector('.wk-board');if(story&&boardEl)boardEl.classList.add('wk-wait');
    const focus=col=>el.board.querySelectorAll('.wk-c').forEach(c=>c.classList.toggle('wk-on',Number(c.dataset.col)===col));
    const apply=a=>{
      if(!a)return;
      const topCell=col=>[...el.board.querySelectorAll('.wk-row:not(.wk-head):not(.wk-carry):not(.wk-ans)')][0].querySelector(`[data-col="${col}"]`);
      const swap=(col,from,to)=>{const c=topCell(col);if(c){c.innerHTML=`<s class="wk-old">${from}</s>${to}`;c.classList.add('wk-pop','wk-changed')}};
      if(a.borrow)for(const x of a.borrow)swap(x.col,x.from,x.to);
      if(a.gain)swap(a.gain.col,a.gain.from,a.gain.to);
      if(a.sign){const g=el.board.querySelector('.wk-sign');if(g){g.textContent=a.sign;g.classList.add('wk-pop')}
        const bd=el.board.querySelector('.wk-board');if(bd){bd.classList.remove('wk-wait');bd.classList.add('wk-in')}}
      if(a.write&&a.write.digit!==null&&a.write.digit!==undefined&&!a.write.lead){const c=q(`.wk-ans [data-col="${a.write.col}"]`);if(c){c.textContent=a.write.digit;c.classList.add('wk-drop')}}
      if(a.carry){const c=q(`.wk-carry [data-col="${a.carry.col}"]`);if(c){c.textContent=a.carry.digit||1;c.classList.add('wk-fly')}}
      if(a.rem!==undefined){const r=q('.wk-rem');if(r)r.textContent=a.rem?`baki ${a.rem}`:''}
    };
    const show=()=>{
      busy=false;
      if(k>=plan.steps.length){focus(-1);el.say.innerHTML=`<b>Siap!</b> ${esc(nf(plan.rows[0]))} ${SIGN[plan.op]} ${esc(nf(plan.rows[1]))} = ${esc(nf(plan.answer))}${plan.rem?` baki ${plan.rem}`:''}.`;el.tiles.innerHTML='';if(el.inline)el.inline.innerHTML='';onDone&&onDone(plan);return}
      const s=plan.steps[k];focus(s.col);el.say.textContent=s.say;opt.onShow&&opt.onShow(k,plan.steps.length);
      // The story's sentence choices sit right under Wira's question (el.inline) when the page gives a place for them.
      const T=s.sentence&&el.inline?el.inline:el.tiles;if(T!==el.tiles)el.tiles.innerHTML='';if(el.inline&&T!==el.inline)el.inline.innerHTML='';
      T.classList.toggle('wk-one',!!s.sentence||s.kind!=='pick');
      if(s.kind==='pick')T.innerHTML=s.choices.map(v=>`<button type="button" class="tl wk-t${s.sentence?' wk-s':''}" data-v="${esc(v)}">${esc(v)}</button>`).join('');
      else T.innerHTML=`<button type="button" class="tl wk-t wk-go" data-v="go">${s.kind==='borrow'?'Pinjam 1':'Teruskan'}</button>`;
      T.querySelectorAll('.wk-t').forEach((btn,i)=>{btn.onclick=()=>pick(btn);btn.style.setProperty('--i',i);btn.classList.add('wk-enter')});
      try{T.scrollIntoView({block:'nearest',behavior:'smooth'})}catch(_){}
    };
    let misses=0;
    const pick=btn=>{
      if(busy)return;const s=plan.steps[k];
      if(s.kind==='pick'&&String(btn.dataset.v)!==String(s.right)){
        misses++;btn.classList.remove('wk-no');void btn.offsetWidth;btn.classList.add('wk-no');btn.disabled=true;
        [...btn.parentNode.querySelectorAll('.wk-t')].find(b=>b.dataset.v===String(s.right))?.classList.add('wk-hint');opt.onMiss&&opt.onMiss(s);return;
      }
      busy=true;btn.classList.add('wk-yes');btn.parentNode.querySelectorAll('.wk-t').forEach(b=>b.disabled=true);
      apply(s.after);if(s.after?.note)el.say.textContent=s.after.note;opt.onStep&&opt.onStep(s);
      k++;setTimeout(show,opt.pace??900);
    };
    show();
    if(typeof window!=='undefined')window.__wkRight=()=>{const s=plan.steps[k];return s&&s.kind==='pick'?String(s.right):'go'};   // tests only
    return{get step(){return k},get misses(){return misses},plan};
  }
  return Object.freeze({VERSION,PLACE,parse,build,boardHTML,run,_digits:digits,_nf:nf});
});
