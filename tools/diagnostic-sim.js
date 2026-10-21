/* Dummy child simulator for the Diagnostic Brain (dev only, not loaded by the app).
   A persona answers questions with a known behaviour model; the real
   PADiagnostic + PATargets modules then have to discover that behaviour.
   Week 1: ordinary mixed play → findings → plan → targeted practice.
   Week 2: the persona improves on what was practised → findings should clear. */
(function(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.PASim=api;
})(typeof window!=='undefined'?window:undefined,function(root){
  'use strict';
  const B=root?.PADiagnostic||(typeof require==='function'?require('../js/engine/diagnostic-brain-v1.js'):null);
  const T=root?.PATargets||(typeof require==='function'?require('../js/engine/diagnostic-targets-v1.js'):null);
  const DOMAIN={money:'Wang',plain:'Operasi'};

  // Behaviour models. acc = chance of a right first try; sec = typical seconds.
  const PERSONAS={
    aisyah:{name:'Aisyah',grade:3,label:'Darjah 3 · sifir 7 & 3 lemah, wang tolak, tolak meminjam',
      table:t=>[7,3].includes(t)?{acc:.5,sec:5.5}:{acc:.96,sec:2.1},
      sub:(borrow)=>borrow?{acc:.3,sec:9,bug:'smaller_from_larger',bugRate:.85}:{acc:.95,sec:7},
      add:()=>({acc:.92,sec:7}),
      money:op=>op==='sub'?{acc:.3,sec:14}:{acc:.85,sec:12},
      word:()=>({acc:.45,sec:16}),guess:.08},
    adam:{name:'Adam',grade:1,label:'Darjah 1 · tambah/tolak asas lambat, banyak meneka',
      fact:op=>op==='add'?{acc:.88,sec:5.2}:{acc:.55,sec:6},
      add:()=>({acc:.9,sec:8}),sub:()=>({acc:.8,sec:9}),money:()=>({acc:.7,sec:12}),word:()=>({acc:.7,sec:14}),guess:.3},
    mei:{name:'Mei Ling',grade:3,label:'Darjah 3 · kuat; cuma keliru sen dan RM',
      table:()=>({acc:.97,sec:1.9}),sub:()=>({acc:.95,sec:6}),add:()=>({acc:.96,sec:6}),
      money:()=>({acc:.6,sec:11,bug:'money_unit',bugRate:.9}),word:()=>({acc:.9,sec:12}),guess:.02}
  };

  function rng(seed){let t=seed>>>0||1;return()=>{t+=0x6D2B79F5;let x=Math.imul(t^t>>>15,1|t);x^=x+Math.imul(x^x>>>7,61|x);return((x^x>>>14)>>>0)/4294967296}}
  const digits=n=>String(n).split('').map(Number).reverse(),fromD=d=>Number(d.slice().reverse().join(''))||0;
  const sfl=(a,b)=>{const A=digits(a),Bd=digits(b);return fromD(A.map((x,i)=>Math.abs(x-(Bd[i]||0))))};
  const borrow=(a,b)=>{const A=digits(a),Bd=digits(b);return A.some((x,i)=>x<(Bd[i]||0))};

  // Ordinary play: a natural mix, not targeted.
  function ordinaryItems(p,r,n){
    const out=[],I=(a,b)=>a+Math.floor(r()*(b-a+1));let k=0;
    while(out.length<n){k++;
      const pick=p.grade===1?['fact','fact','add','sub','money','word'][k%6]:['table','table','sub','add','money','money','word','sub'][k%8];
      if(pick==='table'){const a=I(2,9),b=I(2,9);out.push({prompt:`${a} × ${b} = ?`,answer:a*b,facets:{op:'mul',operands:[a,b],format:'symbolic'},_k:'table'})}
      else if(pick==='fact'){const op=r()<.5?'add':'sub';let a,b;if(op==='add'){a=I(2,9);b=I(2,9)}else{b=I(2,9);a=b+I(1,9)}out.push({prompt:`${a} ${op==='add'?'+':'−'} ${b} = ?`,answer:op==='add'?a+b:a-b,facets:{op,operands:[a,b],format:'symbolic'},_k:'fact'})}
      else if(pick==='sub'){const a=I(30,98),b=I(11,a-1);out.push({prompt:`${a} − ${b} = ?`,answer:a-b,facets:{op:'sub',operands:[a,b],format:'lazim'},_k:'sub'})}
      else if(pick==='add'){const a=I(11,60),b=I(11,39);out.push({prompt:`${a} + ${b} = ?`,answer:a+b,facets:{op:'add',operands:[a,b],format:'lazim'},_k:'add'})}
      else if(pick==='money'){const op=r()<.55?'sub':'add';out.push({...T.practice({target:{kind:'money',op}},1,{},Math.floor(r()*1e9))[0],_k:'money'})}
      else out.push({...T.practice({target:{kind:'word'}},1,{},Math.floor(r()*1e9))[0],_k:'word'});
    }
    return out.map((q,i)=>({...q,token:q.token||`sim-${i}-${Math.floor(r()*1e9)}`}));
  }

  // How the persona answers one item. Returns {ok, sec, value}.
  function answer(p,q,r,boost){
    const f=q.facets||{};let m;
    const ops=f.operands;
    if(f.op==='mul'&&ops)m=p.table?.(Math.max(...ops.filter(x=>[7,3].includes(x)).concat([0]))||ops[0])||{acc:.9,sec:3};
    else if(f.context==='money')m=p.money?.(f.op)||{acc:.8,sec:12};
    else if(f.format==='word')m=p.word?.()||{acc:.8,sec:14};
    else if(ops&&Math.max(...ops)<=20&&p.fact)m=p.fact(f.op);
    else if(f.op==='sub'&&ops)m=p.sub?.(borrow(ops[0],ops[1]))||{acc:.9,sec:8};
    else if(f.op==='add')m=p.add?.()||{acc:.9,sec:8};
    else m={acc:.85,sec:6};
    if(boost&&boost(q))m={...m,acc:Math.min(.95,m.acc+.6),sec:Math.min(m.sec,2.6),bugRate:(m.bugRate||0)*.1};
    if(r()<(p.guess||0)){const wrong=q.choices?.find(c=>c.tag!=='correct');return{ok:false,sec:.6+r()*.6,value:wrong?.v??'0'}}
    const ok=r()<m.acc,sec=Math.max(.9,m.sec*(.7+r()*.6));
    if(ok)return{ok,sec,value:q.answer};
    if(m.bug==='smaller_from_larger'&&ops&&r()<m.bugRate)return{ok,sec,value:sfl(ops[0],ops[1])};
    if(m.bug==='money_unit'&&r()<m.bugRate){const c=q.choices?.find(x=>x.tag==='money_unit');if(c)return{ok,sec,value:c.v}}
    const wrong=q.choices?.find(c=>c.tag==='operation')||q.choices?.find(c=>c.tag!=='correct');
    return{ok,sec,value:wrong?.v??(typeof q.answer==='number'?q.answer+1:'?')};
  }

  function play(p,items,log,r,start,boost){
    items.forEach((q,i)=>{
      const a=answer(p,q,r,boost),at=start+i*90e3,meta={domain:DOMAIN[q.facets?.context]||'Operasi'};
      if(a.ok)log=B.applyResponse(log,{q,meta,ok:true,sec:a.sec,mode:'gembok',value:a.value,at});
      else{log=B.applyResponse(log,{q,meta,ok:false,sec:a.sec,mode:'gembok-first-attempt',value:a.value,at});
        log=B.applyResponse(log,{q,meta,ok:true,sec:a.sec+4,mode:'gembok-retry',value:q.answer,at:at+5e3});}
    });
    return log;
  }

  function simulate(id,opts={}){
    const p=PERSONAS[id];if(!p)throw new Error('persona');
    const r=rng(opts.seed||2026),now=opts.now||Date.now(),DAY=864e5;
    let log=[];
    // Week 1: ordinary play spread over 6 days.
    for(let d=6;d>=1;d--)log=play(p,ordinaryItems(p,r,25),log,r,now-d*DAY);
    const week1=B.analyze(log,{now,name:p.name});
    const pl=T.plan(week1,{grade:p.grade});
    const sets=pl.steps.map((s,i)=>({...s,items:T.practice(s,10,{grade:p.grade,fluentTables:pl.fluentTables},1000+i)}));
    // Week 2: targeted practice + ordinary play; the persona improves on practised targets.
    const practised=q=>pl.steps.some(s=>{const t=s.target,f=q.facets||{};
      if(t.kind==='tables')return f.op==='mul'&&(f.operands||[]).some(x=>(t.tables||[]).includes(x));
      if(t.kind==='regroup')return f.op===t.op&&f.operands&&(t.op==='sub'?borrow(f.operands[0],f.operands[1]):true);
      if(t.kind==='money')return f.context==='money'&&(t.op==='mixed'||f.op===t.op);
      if(t.kind==='units')return f.context==='money';
      if(t.kind==='word')return f.format==='word';
      if(t.kind==='facts')return (f.operands||[]).every(x=>x<=20);
      return false});
    const later=now+8*DAY;let log2=log.slice();
    sets.forEach((s,i)=>{log2=play(p,s.items,log2,r,later-7*DAY+i*3600e3,practised)});
    const guessless={...p,guess:Math.min(p.guess,.03)};             // parent talked to the child after Portal Restu
    for(let d=6;d>=1;d--)log2=play(guessless,ordinaryItems(p,r,25),log2,r,later-d*DAY,practised);
    const week2=B.analyze(log2,{now:later,name:p.name});
    return{persona:{id,...p},log1:log,week1,plan:pl,sets,worksheet:T.worksheet(pl,{name:p.name},7),week2,answers:{week1:log.length,week2:log2.length}};
  }

  return{PERSONAS,simulate};
});
